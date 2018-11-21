import { body, param, query, validationResult } from 'express-validator/check'
import { code422 } from '../../lib/utils/httpMessages'

export const validationRules = {
    createUser: [
        body('userName')
            .not()
            .isEmpty()
            .withMessage('Is required')
            .trim()
            .escape(),
        body('email')
            .not()
            .isEmpty()
            .withMessage('Is required')
            .trim()
            .isEmail()
            .withMessage('Is not a valid email address')
            .escape(),
        body('password')
            .not()
            .isEmpty()
            .withMessage('Is required')
            .trim()
            .escape()
            .matches(
                /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/,
                'i'
            )
            .withMessage(
                'A valid password consists of atleast 1 uppercase letter, 1 special character, 1 number, and is between 8 - 15 characters long'
            ),
    ],
    getUser: [
        param('id')
            .not()
            .isEmpty()
            .trim()
            .escape()
            .withMessage('An ID is required for this endpoint'),
    ],
    updateUser: [
        param('id')
            .not()
            .isEmpty()
            .trim()
            .escape()
            .withMessage('An ID is required for this endpoint'),
    ],
    deleteUser: [
        param('id')
            .not()
            .isEmpty()
            .trim()
            .escape()
            .withMessage('An ID is required for this endpoint'),
    ],
    seeder: [
        query('amount')
            .not()
            .isEmpty()
            .trim()
            .escape()
            .withMessage('Is required for this endpoint'),
    ],
}

export function validationFunc(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const errString = errors
            .array()
            .map(({ param, msg }) => `${param}: ${msg}`)
            .join(', ')

        return res.status(422).json(code422({}, errString))
    }

    next()
}
