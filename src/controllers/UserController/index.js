import { Router } from 'express';
import { validationResult } from 'express-validator/check';

import Controller from '../Controller';
import { sign, verify } from '../../lib/auth/userToken';
import requireLogin from '../../lib/middleware/requireLogin';
import * as httpMessages from '../../lib/helpers/httpMessages';
import { logger } from '../../lib/services/logging';
import * as UserServices from '../../services/UserServices';
import validations from './validation';

class UserController extends Controller {
    constructor() {
        super();

        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.get('/', this.getUsers);
        this.router.get('/me', requireLogin, this.me);
        this.router.post('/', [...validations.createUser], this.createUser);
        this.router.get('/:id', [...validations.getUser], this.getUser);
        this.router.patch(
            '/:id',
            [...validations.updateUser],
            requireLogin,
            this.updateUser,
        );
        this.router.delete(
            '/:id',
            [...validations.deleteUser],
            requireLogin,
            this.deleteUser,
        );
    }

    /**
     * Returns a user object based on the
     * auth token sent with request
     */
    me = async (req, res) => {
        if (req.headers && req.headers.authorization) {
            const authorization = req.headers.authorization;

            let decoded = null;
            try {
                decoded = verify(authorization);
            } catch (error) {
                console.log(error);
                logger(req.ip, error, 500);

                return res.status(401).json(httpMessages.code401);
            }

            if (!decoded) {
                return res.status(404).json(httpMessages.code404);
            }

            let user = null;
            try {
                user = await UserServices.findOne('id', decoded.sub);
            } catch (error) {
                console.log(error);
                logger(req.ip, error, 500);

                return res.status(500).json(httpMessages.code500);
            }

            return res.status(200).json({ response: user, message: 'Success' });
        }

        return res.status(401).json(httpMessages.code401);
    };

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
         * Check if submitted values
         * pass validation
         */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(httpMessages.code422);

            return;
        }

        /**
         * Build user object
         */
        const data = {};
        for (const key in req.body) {
            if (req.body[key].trim() !== '') {
                data[key] = this.escapeString(req.body[key]);
            }
        }

        /**
         * Create & save new user
         */
        let user = null;
        try {
            user = await UserServices.create(data);
        } catch (error) {
            console.log(error);
            if (Number(error.code) === 409) {
                logger(req.ip, error, 409);

                return res.status(409).json({
                    response: {},
                    message: 'User already exists.',
                });
            } else {
                logger(req.ip, error, 500);

                return res.status(500).json(httpMessages.code500);
            }
        }

        /**
         * Find new user
         */
        let newUser = null;
        try {
            newUser = await UserServices.findOne('email', user.email);
        } catch (error) {
            console.log(error);
            const code = error.code || 500;
            logger(req.ip, error, code);

            return res.status(code).json(httpMessages[`code${code}`]);
        }

        /**
         * Login user, send user info back
         * along with jsonwebtoken as a way to
         * verify who the user is in
         * subsequent requests
         */
        req.login(newUser.id, err => {
            if (err) {
                console.log(err);
                logger(req.ip, err, 500);

                return res.status(500).json(httpMessages.code500);
            }

            // Generate JWT Token with user id
            const token = sign(newUser.id);

            // Return user obj with new JWT token
            const response = {
                ...newUser,
                token,
            };

            res.set('authorization', token);
            res.status(201).json({
                response,
                message: 'Success',
            });

            return;
        });
    };

    /**
     * Returns a single user object
     */
    getUser = async (req, res) => {
        /**
         * Check if submitted values
         * pass validation
         */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(httpMessages.code422);
        }

        const userId = this.escapeString(req.params.id);

        let user = null;
        try {
            user = await UserServices.findOne('id', userId);
        } catch (error) {
            console.log(error);
            const code = error.code || 500;
            logger(req.ip, error, code);

            return res.status(code).json(httpMessages[`code${code}`]);
        }

        return res.status(200).json({ response: user, message: 'Success' });
    };

    /**
     * Returns an array of users
     */
    getUsers = async (req, res) => {
        let users = null;
        try {
            users = await UserServices.findAll();
        } catch (error) {
            console.log(error);
            const code = error.code || 500;
            logger(req.ip, error, code);

            return res.status(code).json(httpMessages[`code${code}`]);
        }

        return res.status(200).json({ response: users, message: 'Success' });
    };

    /**
     * Updates a user
     */
    updateUser = async (req, res) => {
        /**
         * Check if submitted values
         * pass validation
         */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(httpMessages.code422);
        }

        const userId = this.escapeString(req.params.id);

        /**
         * Check if user can perform this action
         */
        if (req.user.id !== userId) {
            return res.status(403).json(httpMessages.code403);
        }

        /**
         * Find user
         */
        let user = null;
        try {
            user = await UserServices.findOne('id', userId, false);
        } catch (error) {
            console.log(error);
            const code = error.code || 500;
            logger(req.ip, error, code);

            return res.status(code).json(httpMessages[`code${code}`]);
        }

        /**
         * Update fields
         */
        for (const key in req.body) {
            if (req.body[key].trim() !== '') {
                user[key] = this.escapeString(req.body[key]);
            }
        }

        /**
         * Save updated user
         */
        let updatedUser = null;
        try {
            updatedUser = await UserServices.save(user);
        } catch (error) {
            console.log(error);
            logger(req.ip, error, 500);

            return res.status(500).json(httpMessages.code500);
        }

        return res.status(200).json({
            response: updatedUser,
            message: 'User successfully updated.',
        });
    };

    /**
     * Deletes user found by id
     */
    deleteUser = async (req, res) => {
        /**
         * Check if submitted values
         * pass validation
         */
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(httpMessages.code422);
        }

        const userId = this.escapeString(req.params.id);

        /**
         * Check if user can perform this action
         */
        if (req.user.id !== userId) {
            return res.status(403).json(httpMessages.code403);
        }

        /**
         * Find user
         */
        let user = null;
        try {
            user = await UserServices.findOne('id', userId, false);
        } catch (error) {
            console.log(error);
            const code = error.code || 500;
            logger(req.ip, error, code);

            return res.status(code).json(httpMessages[`code${code}`]);
        }

        /**
         * Remove user
         */
        try {
            await UserServices.remove(user);
        } catch (error) {
            console.log(error);
            logger(req.ip, error, 500);

            return res.status(500).json(httpMessages.code500);
        }

        return res
            .status(200)
            .json({ response: {}, message: 'User successfully deleted.' });
    };
}

const userController = new UserController();
const controller = userController.router;

export default controller;
