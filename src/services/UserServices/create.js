import { User } from '../../models'
import { filteredModel } from '../../models/helpers'
import { logger } from '../../lib/utils/logging'
import { isEmpty, promisify } from '../../lib/utils'

/**
 * Create a new mongodb record.
 * @param {Object} user - the posted data from req.body.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function create(user, filter = true, fields = []) {
    if (!user || isEmpty(user)) {
        throw new Error('User data must be provided.')
    }

    const [newUser, newUserErr] = await promisify(User.create(user))
    if (newUserErr) {
        logger('Create User Service', newUserErr, 500)

        return Promise.reject({ code: 500, message: newUserErr.message })
    }

    if (filter) {
        return Promise.resolve(filteredModel(newUser, fields))
    } else {
        return Promise.resolve(newUser)
    }
}
