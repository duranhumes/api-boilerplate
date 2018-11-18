import { User } from '../../models'
import { filteredModel } from '../../models/helpers'
import { logger } from '../../lib/utils/logging'
import { isEmpty, promisify } from '../../lib/utils'

/**
 * Find one user in mongodb by key
 * @param {string} key - Name of field to search for user record.
 * @param {string} value - Value to search for.
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function findOne(key, value, filter = true, fields = []) {
    if (!key || !value) {
        throw new Error('You must provide both the field key and value')
    }

    const [user, userErr] = await promisify(
        User.findOne({ [key]: value }).exec()
    )

    if (userErr) {
        logger('Find One User Service', userErr, 500)

        return Promise.reject({ code: 500, message: userErr.message })
    }

    if (!user || isEmpty(user)) {
        return Promise.reject({ code: 404, message: 'User not found' })
    }

    if (filter) {
        return Promise.resolve(filteredModel(user, fields))
    } else {
        return Promise.resolve(user)
    }
}
