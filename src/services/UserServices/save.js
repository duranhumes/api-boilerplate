import { filteredUser } from '../../models/User/helpers';
import { logger } from '../../lib/services/logging';
import { isEmpty } from '../../lib/helpers/isEmpty';

/**
 * Save one user in mongodb
 * @param {mongoose model} user - Mongoose user model instance to be saved.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function save(user, filter = true, fields = []) {
    if (!user || isEmpty(user)) {
        throw new Error('User data must be provided.');
    }

    let updatedUser = null;
    try {
        updatedUser = await user.save();
    } catch (error) {
        logger('Create User', error, 500);

        return Promise.reject({ code: 500, message: error });
    }

    if (filter) {
        updatedUser = filteredUser(updatedUser, fields);
    }

    return Promise.resolve(updatedUser);
}
