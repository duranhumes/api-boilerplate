import { User } from '../../models';
import { filteredUser } from '../../models/User/helpers';
import { logger } from '../../lib/services/logging';
import { isEmpty } from '../../lib/helpers/isEmpty';

/**
 * Find all users in mongodb
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function findAll(filter = true, fields = []) {
    let users = null;
    try {
        users = await User.find({}).exec();
    } catch (error) {
        logger('Find All Users', error, 500);

        return Promise.reject({ code: 500, message: error });
    }

    if (!users || isEmpty(users)) {
        return Promise.resolve([]);
    }

    if (filter) {
        users = filteredUser(users, fields);
    }

    return Promise.resolve(users);
}
