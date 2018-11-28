import { body, validationResult } from 'express-validator/check'

import { code422 } from '../../lib/utils/httpMessages'
import { OAUTH_PROVIDERS } from '../../models/User'

export const validationRules = {
    basicLogin: [
        body('email')
            .not()
            .isEmpty()
            .withMessage('is required')
            .trim()
            .isEmail()
            .withMessage('is not a valid email address')
            .escape(),
        body('password')
            .not()
            .isEmpty()
            .withMessage('is required')
            .trim()
            .escape(),
    ],
    oauthLogin: [
        body('provider')
            .not()
            .isEmpty()
            .withMessage('is required.')
            .isIn([...OAUTH_PROVIDERS])
            .escape(),
        body('oauthToken')
            .not()
            .isEmpty()
            .withMessage('is required.')
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
