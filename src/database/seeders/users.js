import userFactory from '../factories/users'
import { create } from '../../services/UserServices'
import { promisify } from '../../lib/utils'

export default async function seedUsers(amount = 10) {
    const users = userFactory(amount)

    console.log('=> Seeding users table')

    const userList = users.map(async user => {
        const [newUser, newUserErr] = await promisify(create(user))
        if (newUserErr) {
            console.log(newUserErr)

            return null
        }

        return newUser
    })

    return Promise.resolve(Promise.all([...userList]))
}
