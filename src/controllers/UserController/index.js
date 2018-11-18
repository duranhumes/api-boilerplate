import { Router } from 'express'

import Controller from '../Controller'
import { sign, verify } from '../../lib/auth/userToken'
import requireLogin from '../../lib/middleware/requireLogin'
import * as httpMessages from '../../lib/utils/httpMessages'
import { logger } from '../../lib/utils/logging'
import * as UserServices from '../../services/UserServices'
import { validationRules, validationFunc } from './validation'
import seedUsers from '../../database/seeders/users'
import { promisify } from '../../lib/utils'

class UserController extends Controller {
    constructor() {
        super()

        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.get('/', this.getUsers)
        this.router.get('/me', requireLogin, this.me)
        this.router.post(
            '/seed',
            [...validationRules.seeder],
            validationFunc,
            this.seeder
        )
        this.router.post(
            '/',
            [...validationRules.createUser],
            validationFunc,
            this.createUser
        )
        this.router.get(
            '/:id',
            [...validationRules.getUser],
            validationFunc,
            this.getUser
        )
        this.router.patch(
            '/:id',
            [...validationRules.updateUser],
            validationFunc,
            requireLogin,
            this.updateUser
        )
        this.router.delete(
            '/:id',
            [...validationRules.deleteUser],
            validationFunc,
            requireLogin,
            this.deleteUser
        )
    }

    /**
     * Seeds db with users,
     *
     * @field {number} amount of users to create
     */
    seeder = async (req, res) => {
        const amountOfUsers = this.escapeString(req.query.amount)

        await seedUsers(Number(amountOfUsers))

        const [users, usersErr] = await promisify(UserServices.findAll())
        if (usersErr) {
            return res
                .status(500)
                .json(httpMessages.code500({}, usersErr.message))
        }

        return res
            .status(200)
            .json(
                httpMessages.code200(
                    {},
                    `${amountOfUsers} users created. There are ${
                        users.length
                    } users now in DB.`
                )
            )
    }

    /**
     * Returns a user object based on the
     * auth token sent with request
     */
    me = async (req, res) => {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization

            /**
             * Check JWT token, if not valid return 401 error
             */
            const [decoded, decodedErr] = await promisify(verify(authorization))
            if (!decoded || decodedErr) {
                return res.status(401).json(httpMessages.code401())
            }

            /**
             * Attempt to find user from JWT token subject value
             */
            const [user, userErr] = await promisify(
                UserServices.findOne('id', decoded.sub)
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

            return res.status(200).json(httpMessages.code200(user))
        }

        return res.status(401).json(httpMessages.code401())
    }

    /**
     * Creates a user with required fields
     * @field firstName
     * @field lastName
     * @field username
     * @field email
     * @field password
     */
    createUser = async (req, res) => {
        /**
         * Build user object
         */
        const data = {}
        for (const key in req.body) {
            data[key] = this.escapeString(req.body[key]).trim()
        }

        /**
         * Create & save new user
         */
        const [user, userErr] = await promisify(UserServices.create(data))
        if (userErr) {
            if (Number(userErr.code) === 409) {
                logger(req.ip, userErr, 409)

                return res.status(409).json(httpMessages.code409())
            }

            logger(req.ip, userErr, 500)

            return res
                .status(500)
                .json(httpMessages.code500({}, userErr.message))
        }

        /**
         * Find new user
         */
        const [newUser, newUserErr] = await promisify(
            UserServices.findOne('email', user.email)
        )
        if (newUserErr) {
            if (userErr.code === 404) {
                logger(req.ip, userErr, 404)

                return res
                    .status(404)
                    .json(httpMessages.code404({}, userErr.message))
            }

            logger(req.ip, newUserErr, 500)

            return res
                .status(500)
                .json(httpMessages.code500({}, newUserErr.message))
        }

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        req.login(newUser.id, function(err) {
            if (err) {
                logger(req.ip, err, 500)

                return res
                    .status(500)
                    .json(httpMessages.code500({}, err.message))
            }

            // Generate JWT Token with user id
            const authToken = sign(newUser.id)

            // Return user obj with new JWT token
            const response = {
                ...newUser,
                authToken,
            }

            res.set('authorization', authToken)
            return res.status(201).json(httpMessages.code200(response))
        })
    }

    /**
     * Returns a single user object
     */
    getUser = async (req, res) => {
        const userId = this.escapeString(req.params.id)

        const [user, userErr] = await promisify(
            UserServices.findOne('id', userId)
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

        return res.status(200).json(httpMessages.code200(user))
    }

    /**
     * Returns an array of users
     */
    getUsers = async (req, res) => {
        const [users, usersErr] = await promisify(UserServices.findAll())
        if (usersErr) {
            logger(req.ip, usersErr, 500)

            return res
                .status(500)
                .json(httpMessages.code500({}, usersErr.message))
        }

        return res.status(200).json(httpMessages.code200(users))
    }

    /**
     * Updates a user
     */
    updateUser = async (req, res) => {
        const userId = this.escapeString(req.params.id)

        /**
         * Check if user can perform this action
         */
        if (req.user.id !== userId) {
            return res.status(403).json(httpMessages.code403())
        }

        /**
         * Find user
         */
        const [user, userErr] = await promisify(
            UserServices.findOne('id', userId, false)
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

        /**
         * Update fields
         */
        for (const key in req.body) {
            user[key] = this.escapeString(req.body[key]).trim()
        }

        /**
         * Save updated user
         */
        const [updatedUser, updatedUserErr] = await promisify(
            UserServices.update(user)
        )
        if (updatedUserErr) {
            logger(req.ip, updatedUserErr, 500)

            return res
                .status(500)
                .json(httpMessages.code500({}, updatedUserErr.message))
        }
        return res
            .status(200)
            .json(
                httpMessages.code200(updatedUser, 'User successfully updated.')
            )
    }

    /**
     * Deletes user found by id
     */
    deleteUser = async (req, res) => {
        const userId = this.escapeString(req.params.id)

        /**
         * Check if user can perform this action
         */
        if (req.user.id !== userId) {
            return res.status(403).json(httpMessages.code403())
        }

        /**
         * Find user
         */
        const [user, userErr] = await promisify(
            UserServices.findOne('id', userId, false)
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

        /**
         * Remove user
         */
        const [msg, deleteUserErr] = await promisify(
            await UserServices.remove(user)
        )
        if (deleteUserErr) {
            logger(req.ip, deleteUserErr, 500)

            return res
                .status(500)
                .json(httpMessages.code500({}, deleteUserErr.message))
        }

        return res.status(200).json(httpMessages.code200({}, msg))
    }
}

export default new UserController().router
