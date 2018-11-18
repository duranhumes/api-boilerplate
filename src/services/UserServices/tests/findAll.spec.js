import chai from 'chai'
import chaiPromises from 'chai-as-promised'
import faker from 'faker'

import { create, findAll } from '../'
import { promisify } from '../../../lib/utils'

chai.use(chaiPromises)
const expect = chai.expect

describe('=> Find all user service <=', () => {
    it('=> should return empty array if no users.', async () => {
        const [users, usersErr] = await promisify(findAll())

        expect(usersErr).to.not.exist
        expect(users).to.eql([])
    })
    it('=> should return an array of user objects.', async () => {
        const AMOUNT_OF_USERS = 2
        for (let i = 0; i < AMOUNT_OF_USERS; i++) {
            await create({
                userName: faker.internet.userName(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: faker.internet.email(),
                password: 'My_passwd@12',
            })
        }

        const [users, usersErr] = await promisify(findAll())

        expect(usersErr).to.not.exist
        expect(users).to.have.lengthOf(AMOUNT_OF_USERS)
        expect(users[0]).to.haveOwnProperty('email')
        expect(users[0]).to.not.haveOwnProperty('password')
        expect(users[0]).to.not.haveOwnProperty('__v')
    })
})
