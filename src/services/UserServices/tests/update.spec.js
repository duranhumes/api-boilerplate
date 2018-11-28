import chai from 'chai'
import chaiPromises from 'chai-as-promised'
import faker from 'faker'

import { create, update } from '..'
import { promisify } from '../../../lib/utils'

chai.use(chaiPromises)
const expect = chai.expect

describe('=> Update user service <=', () => {
    it('=> should update user in db', async () => {
        const [user, userErr] = await promisify(
            create(
                {
                    userName: faker.internet.userName(),
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    email: faker.internet.email(),
                    password: 'My_passwd@12',
                },
                false
            )
        )
        expect(userErr).to.not.exist

        const newEmail = 'my-new-email@gmail.com'
        const newUserName = 'my-new-username'

        user.email = newEmail
        user.userName = newUserName

        const [updateUser, updateUserErr] = await promisify(update(user))
        expect(updateUserErr).to.not.exist
        expect(updateUser.email).to.equal(newEmail)
        expect(updateUser.userName).to.equal(newUserName)
    })
    it('=> should throw err if obj provided is not a mongoose model', async () => {
        const [user, userErr] = await promisify(
            create({
                userName: faker.internet.userName(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: faker.internet.email(),
                password: 'My_passwd@12',
            })
        )
        expect(userErr).to.not.exist

        const [updateUser, updateUserErr] = await promisify(update(user))
        expect(updateUser).to.not.exist
        expect(String(updateUserErr)).to.include.any.string(
            'user.save is not a function'
        )
    })
})
