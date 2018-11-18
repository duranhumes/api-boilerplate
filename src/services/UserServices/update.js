import { filteredModel } from '../../models/helpers'
import { logger } from '../../lib/utils/logging'
import { isEmpty, promisify } from '../../lib/utils'

/**
 * Update user in mongodb
 * @param {mongoose model} user - Mongoose user model instance to be updated.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function update(user, filter = true, fields = []) {
    if (!user || isEmpty(user)) {
        throw new Error('User data must be provided.')
    }

    const [updatedUser, updatedUserErr] = await promisify(user.save())
    if (updatedUserErr) {
        logger('Update User Service', updatedUserErr, 500)

        return Promise.reject({ code: 500, message: updatedUserErr.message })
    }

    if (filter) {
        return Promise.resolve(filteredModel(updatedUser, fields))
    } else {
        return Promise.resolve(updatedUser)
    }
}
