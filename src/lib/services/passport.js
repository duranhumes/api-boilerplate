import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

import * as UserServices from '../../services/UserServices';
import { logger } from './logging';
import { isEmpty } from '../helpers/isEmpty';

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: String(process.env.JWT_SECRET),
    issuer: String(process.env.JWT_ISSUER),
};

export const jwtLogin = new Strategy(jwtOptions, async (payload, done) => {
    // Users Id
    const id = payload.sub;
    const timestamp = new Date().getTime();

    // If token is expired revoke user token
    if (payload.exp <= timestamp) {
        return done(null, false);
    }

    let user = null;
    try {
        user = await UserServices.findOne('id', id);
    } catch (error) {
        console.log('Error In Passport JWT Login: ', error);
        logger('Error In Passport JWT Login', error, 500);

        return done(null, false);
    }

    if (!user || isEmpty(user)) {
        return done(null, false);
    }

    return done(null, user);
});

/**
 * For server.js to initiate passport
 */
export const passportConfig = () => {
    passport.use(jwtLogin);

    passport.serializeUser((user, done) => {
        return done(null, user);
    });

    passport.deserializeUser(async (id, done) => {
        let user = null;
        try {
            user = await UserServices.findOne('id', id);
        } catch (error) {
            console.log('Error In Passport Deserialize: ', error);
            logger('Error In Passport Deserialize', error, 500);

            return done(null, false);
        }

        if (!user || isEmpty(user)) {
            return done(null, false);
        }

        return done(null, user);
    });
};
