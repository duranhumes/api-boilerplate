import { Router } from 'express';
import { validationResult } from 'express-validator/check';

import Controller from '../Controller';
import { sign } from '../../lib/auth/userToken';
import * as httpMessages from '../../lib/helpers/httpMessages';
import { logger } from '../../lib/services/logging';
import { pick } from '../../lib/helpers/pick';
import * as UserServices from '../../services/UserServices';
import { AuthService } from '../../services/OAuthServices';
import { verifyPassword } from '../../lib/auth/password';
import { filteredUser } from '../../models/User/helpers';
import validations from './validation';

class LoginController extends Controller {
    constructor() {
        super();

        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.post('/', [...validations.basicLogin], this.basicLogin);
        this.router.post(
            '/oauth',
            [...validations.oauthLogin],
            this.oauthLogin,
        );
    }

    /**
     * Login a user with required fields
     * @field email
     * @field password
     */
    basicLogin = async (req, res) => {
        /**
         * Check if submitted values
         * pass validation
         */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            res.status(422).json(httpMessages.code422);

            return;
        }

        /**
         * Build request object
         */
        const data = {};
        for (const key in req.body) {
            if (req.body[key].trim() !== '') {
                data[key] = this.escapeString(req.body[key]);
            }
        }

        /**
         * Dont allow other fields other
         * than the specified fields below
         */
        const allowedFields = ['email', 'password'];
        const { email, password } = pick(data, allowedFields);

        let user = null;
        try {
            user = await UserServices.findOne('email', email, false);
        } catch (error) {
            console.log(error);
            const code = error.code || 500;
            logger(req.ip, error, code);

            return res.status(code).json(httpMessages[`code${code}`]);
        }

        let verified = false;
        try {
            verified = await verifyPassword(user.password, password);
        } catch (error) {
            console.log(error);
            logger(req.ip, error, 500);

            return res.status(500).json(httpMessages.code500);
        }

        if (!verified) {
            return res.status(401).json(httpMessages.code401);
        }

        user = filteredUser(user);

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        req.login(user.id, err => {
            if (err) {
                console.log(err);
                logger(req.ip, err, 500);

                return res.status(500).json(httpMessages.code500);
            }

            // Generate JWT Token with user id
            const token = sign(user.id);

            // Return user obj with new JWT token
            const response = {
                ...user,
                token,
            };

            res.set('authorization', token);
            return res.status(200).json({
                response,
                message: 'Success',
            });
        });
    };

    /**
     * Login a user with oauth provider
     * @field provider
     * @field oauthToken
     */
    oauthLogin = async (req, res) => {
        /**
         * Check if submitted values
         * pass validation
         */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            res.status(422).json(httpMessages.code422);

            return;
        }

        /**
         * Build request object
         */
        const data = {};
        for (const key in req.body) {
            if (req.body[key].trim() !== '') {
                data[key] = this.escapeString(req.body[key]);
            }
        }

        /**
         * Build user oauth obj
         */
        const userOAuthData = {
            email: null,
            username: null,
            firstName: null,
            lastName: null,
            profilePhoto: null,
            oauthProviders: {
                id: null,
                type: null,
            },
        };
        if (data.provider && data.oauthToken) {
            if (data.provider === 'FACEBOOK') {
                let facebook = null;
                try {
                    facebook = await AuthService.Facebook.authAsync(
                        data.oauthToken,
                    );
                } catch (error) {
                    logger(req.ip, error, 500);

                    return res.status(500).json(httpMessages.code500);
                }

                const [firstName, ...lastName] = facebook.name.split(' ');
                userOAuthData.email = facebook.email;
                userOAuthData.username = facebook.name;
                userOAuthData.firstName = firstName;
                userOAuthData.lastName = lastName.join(' ');
                userOAuthData.profilePhoto = facebook.picture.data.url;
                userOAuthData.oauthProviders.id = facebook.id;
                userOAuthData.oauthProviders.type = 'FACEBOOK';
            } else if (data.provider === 'GOOGLE') {
                let google = null;
                try {
                    google = await AuthService.Google.authAsync(
                        data.oauthToken,
                    );
                } catch (error) {
                    logger(req.ip, error, 500);

                    return res.status(500).json(httpMessages.code500);
                }

                userOAuthData.email = google.email;
                userOAuthData.username = `${google.given_name} ${
                    google.family_name
                }`;
                userOAuthData.firstName = google.given_name;
                userOAuthData.lastName = google.family_name;
                userOAuthData.profilePhoto = google.picture;
                userOAuthData.oauthProviders.id = google.id;
                userOAuthData.oauthProviders.type = 'GOOGLE';
            } else {
                return res.status(422).json({
                    response: {},
                    message: 'OAuth provider not recognized.',
                });
            }
        } else {
            return res.status(422).json(httpMessages.code422);
        }

        /**
         * Attempt to find user by oauth email
         * if found contine otherwise if code = 404
         * create a new user and return it.
         */
        let code = null;
        let user = null;
        try {
            user = await UserServices.findOne(
                'email',
                userOAuthData.email,
                false,
            );
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
                    let newOAuthData = user.oauthProviders;
                    newOAuthData = newOAuthData.map(
                        provider =>
                            provider.id !== userOAuthData.oauthProviders.id,
                    );

                    // Map would return false if nothing new is there
                    if (newOAuthData[0]) {
                        user.oauthProviders = [
                            ...user.oauthProviders,
                            ...newOAuthData,
                        ];
                    }
                } else {
                    user.oauthProviders = [
                        ...user.oauthProviders,
                        userOAuthData.oauthProviders,
                    ];
                }

                user = await UserServices.save(user);
            }
        } catch (error) {
            console.log(error);
            if (error.code !== 404) {
                logger(req.ip, error, 500);

                return res.status(500).json(httpMessages.code500);
            } else {
                code = 404;
            }
        } finally {
            if (code === 404) {
                try {
                    user = await UserServices.create({
                        ...userOAuthData,
                        password: String(process.env.DEFAULT_OAUTH_PASSWORD),
                    });
                } catch (error) {
                    console.log(error);
                    logger(req.ip, error, 500);

                    res.status(500).json(httpMessages.code500);
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
                console.log(err);
                logger(req.ip, err, 500);

                return res.status(500).json(httpMessages.code500);
            }

            // Generate JWT Token with user id
            const token = sign(user.id);

            // Return user obj with new JWT token
            const response = {
                ...user,
                token,
            };

            res.set('authorization', token);
            return res.status(200).json({
                response,
                message: 'Success',
            });
        });
    };
}

const loginController = new LoginController();
const controller = loginController.router;

export default controller;
