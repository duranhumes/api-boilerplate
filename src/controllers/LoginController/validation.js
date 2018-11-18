import { body, validationResult } from 'express-validator/check'
import { code422 } from '../../lib/utils/httpMessages'

export const validationRules = {
    basicLogin: [
        body('email')
            .not()
            .isEmpty()
            .trim()
            .isEmail()
            .withMessage('Is not a valid email address')
            .escape(),
        body('password')
            .not()
            .isEmpty()
            .withMessage('Is required')
            .trim()
            .escape(),
    ],
    oauthLogin: [
        body('provider')
            .not()
            .isEmpty()
            .withMessage('OAuth provider is required.')
            .isIn(['GOOGLE'])
            .withMessage('Google is a valid oauth provider')
            .escape(),
        body('oauthToken')
            .not()
            .isEmpty()
            .withMessage('OAuth token is required.')
            .escape(),
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
