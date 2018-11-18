import { User } from '../../models'
import { filteredModel } from '../../models/helpers'
import { logger } from '../../lib/utils/logging'
import { isEmpty, promisify } from '../../lib/utils'

/**
 * Find all users in mongodb
 * @param {boolean} filter - If the return value must be a filtered user.
 * @param {array} fields - Fields to filter.
 */
export default async function findAll(filter = true, fields = []) {
    const [users, usersErr] = await promisify(User.find({}).exec())
    if (usersErr) {
        logger('Find All User Service', usersErr, 500)

        return Promise.reject({ code: 500, message: usersErr.message })
    }

    if (!users || isEmpty(users)) {
        return Promise.resolve([])
    }

    if (filter) {
        return Promise.resolve(filteredModel(users, fields))
    } else {
        return Promise.resolve(users)
    }
}
