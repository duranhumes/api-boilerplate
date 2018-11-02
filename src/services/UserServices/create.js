import { User } from '../../models';
import { filteredUser } from '../../models/User/helpers';
import { logger } from '../../lib/services/logging';
import { isEmpty } from '../../lib/helpers/isEmpty';

/**
 * Create a new mongodb record.
 * @param {Object} user - the posted data from req.body.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function create(user, filter = true, fields = []) {
    if (!user || isEmpty(user)) {
        throw new Error('User data must be provided.');
    }

    let newUser = null;
    try {
        newUser = await User.create(user);
    } catch (error) {
        if (Number(error.code) === 11000) {
            return Promise.reject({
                code: 409,
                message: 'User already exists',
            });
        } else {
            logger('Create User', error, 500);

            return Promise.reject({ code: 500, message: error });
        }
    }

    if (filter) {
        newUser = filteredUser(newUser, fields);
    }

    return Promise.resolve(newUser);
}
