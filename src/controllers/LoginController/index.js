import { Router } from 'express'

import Controller from '../Controller'
import { pick, promisify } from '../../lib/utils'
import { sign } from '../../lib/auth/userToken'
import { logger } from '../../lib/utils/logging'
import { verifyPassword } from '../../lib/auth/password'
import { filteredModel } from '../../models/helpers'
import * as UserServices from '../../services/UserServices'
import { AuthService } from '../../services/OAuthServices'
import * as httpMessages from '../../lib/utils/httpMessages'
import { validationFunc, validationRules } from './validation'

class LoginController extends Controller {
    constructor() {
        super()

        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.post(
            '/',
            [...validationRules.basicLogin],
            validationFunc,
            this.basicLogin
        )
        this.router.post(
            '/oauth',
            [...validationRules.oauthLogin],
            validationFunc,
            this.oauthLogin
        )
    }

    /**
     * Login a user with required fields
     * @field email
     * @field password
     */
    basicLogin = async (req, res) => {
        /**
         * Build request object
         */
        const data = {}
        for (const key in req.body) {
            data[key] = this.escapeString(req.body[key]).trim()
        }

        /**
         * Dont allow other fields other
         * than the specified fields below
         */
        const allowedFields = ['email', 'password']
        const { email, password } = pick(data, allowedFields)

        /**
         * Check if user exists, if not return 404
         * otherwise proceed.
         */
        const [user, userErr] = await promisify(
            UserServices.findOne('email', email, false)
        )
        if (userErr) {
            if (userErr.code === 404) {
                logger(req.ip, userErr, 404)

                return res
                    .status(404)
                    .json(httpMessages.code404({}, userErr.message))
            }

            logger(req.ip, userErr, 500)

            return res
                .status(500)
                .json(httpMessages.code500({}, userErr.message))
        }

        if (!user) {
            return res.status(404).json(httpMessages.code404())
        }

        /**
         * Check if found users password matches the password
         * supplied to this endpoint
         */
        const [verified, verifiedErr] = await promisify(
            verifyPassword(user.password, password)
        )
        if (verifiedErr) {
            logger(req.ip, verifiedErr, 500)

            return res
                .status(500)
                .json(httpMessages.code500({}, verifiedErr.message))
        }

        if (!verified) {
            return res
                .status(401)
                .json(httpMessages.code401({}, 'Invalid credentials.'))
        }

        const filteredUserObj = filteredModel(user)

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        req.login(filteredUserObj.id, function(err) {
            if (err) {
                logger(req.ip, err, 500)

                return res
                    .status(500)
                    .json(httpMessages.code500({}, err.message))
            }

            // Generate JWT Token with user id
            const authToken = sign(user.id)

            // Return user obj with new JWT token
            const response = {
                ...filteredUserObj,
                authToken,
            }

            res.set('authorization', authToken)
            return res.status(200).json(httpMessages.code200(response))
        })
    }

    /**
     * Login a user with oauth provider
     * @field provider
     * @field oauthToken
     */
    oauthLogin = async (req, res) => {
        /**
         * Build request object
         */
        const data = {}
        for (const key in req.body) {
            data[key] = this.escapeString(req.body[key]).trim()
        }

        /**
         * Build user oauth obj
         */
        const userOAuthData = {
            email: null,
            userName: null,
            firstName: null,
            lastName: null,
            profilePhoto: null,
            oauthProviders: {
                id: null,
                type: null,
            },
        }
        if (data.provider && data.oauthToken) {
            if (data.provider === 'GOOGLE') {
                const [google, googleErr] = await promisify(
                    AuthService.Google.authAsync(data.oauthToken)
                )
                if (googleErr) {
                    logger(req.ip, googleErr, 500)

                    return res
                        .status(500)
                        .json(httpMessages.code500({}, googleErr.message))
                }

                userOAuthData.email = google.email
                userOAuthData.userName = `${google.given_name} ${
                    google.family_name
                }`
                userOAuthData.firstName = google.given_name
                userOAuthData.lastName = google.family_name
                userOAuthData.profilePhoto = google.picture
                userOAuthData.oauthProviders.id = google.id
                userOAuthData.oauthProviders.type = 'GOOGLE'
            } else if (data.provider === 'FACEBOOK') {
                const [facebook, facebookErr] = await promisify(
                    AuthService.Facebook.authAsync(data.oauthToken)
                )
                if (facebookErr) {
                    logger(req.ip, facebookErr, 500)

                    return res
                        .status(500)
                        .json(httpMessages.code500({}, facebookErr.message))
                }

                const [firstName, ...lastName] = facebook.name.split(' ')
                userOAuthData.email = facebook.email
                userOAuthData.username = facebook.name
                userOAuthData.firstName = firstName
                userOAuthData.lastName = lastName.join(' ')
                userOAuthData.profilePhoto = facebook.picture.data.url
                userOAuthData.oauthProviders.id = facebook.id
                userOAuthData.oauthProviders.type = 'FACEBOOK'
            } else {
                return res
                    .status(422)
                    .json(
                        httpMessages.code422(
                            {},
                            'OAuth provider not recognized.'
                        )
                    )
            }
        } else {
            return res.status(422).json(httpMessages.code422())
        }

        /**
         * Attempt to find user by oauth email
         * if found contine otherwise if code = 404
         * create a new user and return it.
         */
        let code = null
        let user = null
        try {
            user = await UserServices.findOne(
                'email',
                userOAuthData.email,
                false
            )
            /**
             * If user is found update oauthProviders field
             */
            if (user) {
                /**
                 * If user has used an oauth login before
                 * loop over entries and prevent duplicates.
                 * Otherwise add the new entry to oauthProviders array
                 * and update user.
                 */
                if (user.oauthProviders.length > 0) {
                    let newOAuthData = user.oauthProviders
                    newOAuthData = newOAuthData.map(
                        provider =>
                            provider.id !== userOAuthData.oauthProviders.id
                    )

                    // Map would return false if nothing new is there
                    if (newOAuthData[0]) {
                        user.oauthProviders = [
                            ...user.oauthProviders,
                            ...newOAuthData,
                        ]
                    }
                } else {
                    user.oauthProviders = [
                        ...user.oauthProviders,
                        userOAuthData.oauthProviders,
                    ]
                }

                user = await UserServices.update(user)
            }
        } catch (error) {
            if (error.code !== 404) {
                logger(req.ip, error, 500)

                return res
                    .status(500)
                    .json(httpMessages.code500({}, error.message))
            } else {
                code = 404
            }
        } finally {
            if (code === 404) {
                try {
                    user = await UserServices.create({
                        ...userOAuthData,
                        password: String(process.env.DEFAULT_OAUTH_PASSWORD),
                    })
                } catch (error) {
                    logger(req.ip, error, 500)

                    res.status(500).json(
                        httpMessages.code500({}, error.message)
                    )
                }
            }
        }

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        req.login(user.id, err => {
            if (err) {
                logger(req.ip, err, 500)

                return res
                    .status(500)
                    .json(httpMessages.code500({}, err.message))
            }

            // Generate JWT Token with user id
            const authToken = sign(user.id)

            // Return user obj with new JWT token
            const response = {
                ...user,
                authToken,
            }

            res.set('authorization', authToken)
            return res.status(200).json(httpMessages.code200(response))
        })
    }
}

export default new LoginController().router
