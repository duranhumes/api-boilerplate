import { body, param } from 'express-validator/check';

const validations = {
    createUser: [
        body('firstName')
            .not()
            .isEmpty()
            .trim()
            .escape(),
        body('lastName')
            .not()
            .isEmpty()
            .trim()
            .escape(),
        body('username')
            .not()
            .isEmpty()
            .trim()
            .escape(),
        body('email')
            .not()
            .isEmpty()
            .trim()
            .isEmail()
            .escape(),
        body('password')
            .not()
            .isEmpty()
            .trim()
            .escape(),
    ],
    getUser: [
        param('id')
            .not()
            .isEmpty()
            .trim()
            .escape(),
    ],
    updateUser: [
        param('id')
            .not()
            .isEmpty()
            .trim()
            .escape(),
    ],
    deleteUser: [
        param('id')
            .not()
            .isEmpty()
            .trim()
            .escape(),
    ],
};

export default validations;
