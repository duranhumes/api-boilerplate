import { logger } from '../../lib/services/logging';

/**
 * Remove one user in mongodb by key
 * @param {mongoose model} user - Mongoose user model instance to be deleted.
 */
export default async function remove(user) {
    if (!user) {
        throw new Error('A user must be provided.');
    }

    try {
        await user.remove();

        return Promise.resolve('User successfully deleted.');
    } catch (error) {
        logger('Remove User', error, 500);

        return Promise.reject({ code: 500, message: error });
    }
}
