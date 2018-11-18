import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'

import * as UserServices from '../../services/UserServices'
import { logger } from '../utils/logging'
import { promisify, isEmpty } from '../utils'

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: String(process.env.JWT_SECRET),
    issuer: String(process.env.JWT_ISSUER),
    passReqToCallback: true,
}

export const jwtLogin = new Strategy(jwtOptions, async (req, payload, done) => {
    // Users Id
    const id = payload.sub
    const timestamp = new Date().getTime()

    // If token is expired revoke user token
    if (payload.exp <= timestamp) {
        return done(null, false)
    }

    const [user, userErr] = await promisify(UserServices.findOne('id', id))

    if (userErr) {
        logger('Error In Passport JWT Login', userErr, 500)

        return done(null, false)
    }

    if (!user || isEmpty(user)) {
        return done(null, false)
    }

    req.user = user

    return done(null, user)
})

/**
 * For server.js to initiate passport
 */
export const passportConfig = () => {
    passport.use(jwtLogin)

    passport.serializeUser((user, done) => {
        return done(null, user)
    })

    passport.deserializeUser(async (id, done) => {
        const [user, userErr] = await promisify(UserServices.findOne('id', id))

        if (userErr) {
            logger('Error In Passport Deserialize', userErr, 500)

            return done(null, false)
        }

        if (!user || isEmpty(user)) {
            return done(null, false)
        }

        return done(null, user)
    })
}
