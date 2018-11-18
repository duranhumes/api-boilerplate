import { logger } from '../../lib/utils/logging'
import { promisify } from '../../lib/utils'

/**
 * Remove one user in mongodb by key
 * @param {mongoose model} user - Mongoose user model instance to be deleted.
 */
export default async function remove(user) {
    if (!user) {
        throw new Error('A user must be provided.')
    }

    const [_, removeUserErr] = await promisify(user.remove()) // eslint-disable-line no-unused-vars
    if (removeUserErr) {
        logger('Remove User Service', removeUserErr, 500)

        return Promise.reject({ code: 500, message: removeUserErr.message })
    }

    return Promise.resolve('User deleted.')
}
