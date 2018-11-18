import chai from 'chai'
import chaiPromises from 'chai-as-promised'
import faker from 'faker'

import { create, findOne, remove } from '../'
import { promisify } from '../../../lib/utils'

chai.use(chaiPromises)
const expect = chai.expect

describe('=> Remove user service <=', () => {
    it('=> should remove a user by the given mongoose user obj', async () => {
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

        const [removeUser, removeUserErr] = await promisify(remove(user))
        expect(removeUserErr).to.not.exist
        expect(removeUser).to.be.equal('User deleted.')

        const [userToBeDeleted, userToBeDeletedErr] = await promisify(
            findOne('id', user.id)
        )
        expect(userToBeDeleted).to.not.exist
        expect(userToBeDeletedErr.code).to.equal(404)
        expect(userToBeDeletedErr.message.toString()).to.equal('User not found')
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

        const [removeUser, removeUserErr] = await promisify(remove(user))
        expect(removeUser).to.not.exist
        expect(String(removeUserErr)).to.include.any.string(
            'user.remove is not a function'
        )
    })
})
