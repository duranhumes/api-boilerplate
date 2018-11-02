import { body } from 'express-validator/check';

const validations = {
    basicLogin: [
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
    oauthLogin: [
        body('provider')
            .not()
            .isEmpty()
            .isIn(['FACEBOOK', 'GOOGLE'])
            .escape(),
        body('oauthToken')
            .not()
            .isEmpty()
            .escape(),
    ],
};

export default validations;
