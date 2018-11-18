import chai from 'chai'
import request from 'supertest'
import chaiPromises from 'chai-as-promised'
import faker from 'faker'

import * as UserServices from '../../services/UserServices'
import { promisify } from '../../lib/utils'
import server from '../setup'

chai.use(chaiPromises)
const expect = chai.expect

describe('=> API Login Endpoint <=', () => {
    it('=> basicLogin should return user obj along with JWT token and authorization header after login', async () => {
        const userObj = {
            userName: faker.internet.userName() + 'a',
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email() + 'a',
            password: 'My_passwd@12',
        }
        const [user, userErr] = await promisify(UserServices.create(userObj))
        expect(user).to.exist
        expect(userErr).to.not.exist

        const { email, password } = userObj
        const response = await request(server)
            .post('/v1/login')
            .set('Content-Type', 'application/json')
            .send({ email, password })

        expect(response.body.response).to.haveOwnProperty('id')
        expect(response.body.response).to.haveOwnProperty('email')
        expect(response.body.response).to.haveOwnProperty('authToken')
        expect(response.body.response).to.not.haveOwnProperty('password')
        expect(response.headers.authorization).to.exist
        expect(response.statusCode).to.equal(200)
    })
    it('=> basicLogin should return 401 for invalid credentials & 404 for user not found', async () => {
        const userObj = {
            userName: faker.internet.userName() + 'c',
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            email: faker.internet.email() + 'c',
            password: 'My_passwd@12',
        }
        const [user, userErr] = await promisify(UserServices.create(userObj))
        expect(user).to.exist
        expect(userErr).to.not.exist

        const { email, password } = userObj
        const response = await request(server)
            .post('/v1/login')
            .set('Content-Type', 'application/json')
            .send({ email: email + 's', password })

        expect(response.headers.authorization).to.not.exist
        expect(response.statusCode).to.equal(404)

        const response2 = await request(server)
            .post('/v1/login')
            .set('Content-Type', 'application/json')
            .send({ email, password: password + 's' })

        expect(response2.headers.authorization).to.not.exist
        expect(response2.statusCode).to.equal(401)
    })
})
