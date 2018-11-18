import chai from 'chai'
import chaiPromises from 'chai-as-promised'
import faker from 'faker'

import { create } from '../'
import { promisify } from '../../../lib/utils'

chai.use(chaiPromises)
const expect = chai.expect

describe('=> Create user service <=', () => {
    it('=> should handle case when user already exists', async () => {
        const user = {
            userName: faker.internet.userName(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: 'My_passwd@12',
        }

        const [newUser, newUserErr] = await promisify(create(user))
        expect(newUser).to.exist
        expect(newUserErr).to.not.exist

        const [dupUser, dupUserErr] = await promisify(create(user))
        const mongooseDuplicateErrorCode = 'E11000'

        expect(dupUser).to.not.exist
        expect(
            String(dupUserErr.message).startsWith(mongooseDuplicateErrorCode)
        ).to.be.true
    })

    it('=> should create a new user and return mongoose model', async () => {
        const user = {
            userName: faker.internet.userName(),
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email(),
            password: 'My_passwd@12',
        }
        const [newUser, newUserErr] = await promisify(create(user, false))

        expect(newUserErr).to.not.exist
        expect(newUser).to.have.property('userName', user.userName)
        expect(newUser).to.have.property('firstName', user.firstName)
        expect(newUser).to.have.property('lastName', user.lastName)
        expect(newUser).to.have.property('email', user.email.toLowerCase())
        expect(newUser).to.have.property('__v', 0)
    })

    it('=> should throw error if anything but object is passed', async () => {
        /* eslint-disable no-unused-vars */
        const [_, userErr1] = await promisify(create('', false))
        expect(userErr1.toString()).to.equal(
            'Error: User data must be provided.'
        )

        const [__, userErr2] = await promisify(create([], false))
        expect(userErr2.toString()).to.equal(
            'Error: User data must be provided.'
        )

        const [___, userErr3] = await promisify(create(102, false))
        expect(userErr3.toString()).to.equal(
            'Error: User data must be provided.'
        )

        const [____, userErr4] = await promisify(create({}, false))
        expect(userErr4.toString()).to.equal(
            'Error: User data must be provided.'
        )
        /* eslint-enable no-unused-vars */
    })
})
