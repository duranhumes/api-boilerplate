import chai from 'chai'
import chaiPromises from 'chai-as-promised'
import faker from 'faker'

import { create, findOne } from '../'
import { promisify } from '../../../lib/utils'

chai.use(chaiPromises)
const expect = chai.expect

describe('=> Find one user service <=', () => {
    it('=> should return 404 if user does not exist.', async () => {
        const [user, userErr] = await promisify(
            findOne('email', 'email123-that-doesnt-exist@gmail.com')
        )

        expect(user).to.not.exist
        expect(userErr.code).to.equal(404)
        expect(userErr.message.toString()).to.equal('User not found')
    })
    it('=> should find a user by the given key value pair', async () => {
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

        const [foundUser, foundUserErr] = await promisify(
            findOne('id', user.id)
        )
        expect(foundUserErr).to.not.exist
        expect(foundUser).to.haveOwnProperty('email')
        expect(foundUser).to.not.haveOwnProperty('password')
        expect(foundUser).to.not.haveOwnProperty('__v')

        const [foundUser2, foundUser2Err] = await promisify(
            findOne('email', user.email)
        )
        expect(foundUser2Err).to.not.exist
        expect(foundUser2).to.haveOwnProperty('email')
        expect(foundUser2).to.not.haveOwnProperty('password')
        expect(foundUser2).to.not.haveOwnProperty('__v')
    })
})
