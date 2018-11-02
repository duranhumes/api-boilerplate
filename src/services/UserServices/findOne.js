import { User } from '../../models';
import { filteredUser } from '../../models/User/helpers';
import { logger } from '../../lib/services/logging';
import { isEmpty } from '../../lib/helpers/isEmpty';

/**
 * Find one user in mongodb by key
 * @param {string} key - Name of field to search for user record.
 * @param {string} value - Value to search for.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function findOne(key, value, filter = true, fields = []) {
    if (!key || !value) {
        throw new Error('You must provide both the field key and value');
    }

    let user = null;
    try {
        user = await User.findOne({ [key]: value }).exec();
    } catch (error) {
        logger('Find user', error, 500);

        return Promise.reject({ code: 500, message: error });
    }

    if (!user || isEmpty(user)) {
        return Promise.reject({ code: 404, message: 'User not found' });
    }

    if (filter) {
        user = filteredUser(user, fields);
    }

    return Promise.resolve(user);
}
