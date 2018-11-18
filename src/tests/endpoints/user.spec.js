import chai from 'chai'
import request from 'supertest'
import chaiPromises from 'chai-as-promised'
import faker from 'faker'

import server from '../setup'

chai.use(chaiPromises)
const expect = chai.expect

describe('=> API User Endpoint <=', () => {
    describe('=> me <=', () => {
        let userObj = {}
        let authToken = null
        beforeEach(async () => {
            userObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'My_passwd@12',
            }
            const response = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(userObj)

            authToken = response.headers.authorization
        })
        it('=> should return the current authenticated user data', async () => {
            const response = await request(server)
                .get('/v1/user/me')
                .set('Content-Type', 'application/json')
                .set('authorization', authToken)

            expect(response.body.response).to.haveOwnProperty('id')
            expect(response.body.response).to.haveOwnProperty('email')
            expect(response.body.response).to.not.haveOwnProperty('password')
            expect(response.statusCode).to.equal(200)
        })
        it('=> should return 401 if not authenticated', async () => {
            const response = await request(server)
                .get('/v1/user/me')
                .set('Content-Type', 'application/json')

            expect(response.statusCode).to.equal(401)
        })
    })
    describe('=> createUser <=', () => {
        it('=> should return a new user if valid data is passed', async () => {
            const newUserObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'My_passwd@12',
            }

            const response = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(newUserObj)

            expect(response.body.response).to.haveOwnProperty('id')
            expect(response.body.response).to.haveOwnProperty('email')
            expect(response.body.response).to.not.haveOwnProperty('password')
            expect(response.headers.authorization).to.exist
            expect(response.statusCode).to.equal(201)
        })
        it('=> should return an error if data is bad', async () => {
            const newUserObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'mypasswd',
            }

            const response = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(newUserObj)

            expect(response.headers.authorization).to.not.exist
            expect(response.statusCode).to.equal(422)
        })
        it('=> should return an error if required data is missing or doesnt pass validation', async () => {
            const userObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'mypasswd',
            }
            // Check password requirements validation
            const response = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send({ ...userObj, password: 'password' })

            expect(response.statusCode).to.equal(422)

            delete userObj.userName
            const respons2 = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(userObj)

            expect(respons2.statusCode).to.equal(422)
        })
    })
    describe('=> getUser <=', () => {
        let userObj = {}
        let userId = null
        beforeEach(async () => {
            userObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'My_passwd@12',
            }
            const response = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(userObj)

            userId = response.body.response.id
        })
        it('=> should return a user found by ID', async () => {
            const response = await request(server)
                .get(`/v1/user/${userId}`)
                .set('Content-Type', 'application/json')

            expect(response.body.response).to.haveOwnProperty('id')
            expect(response.body.response).to.haveOwnProperty('email')
            expect(response.body.response).to.not.haveOwnProperty('password')
            expect(response.statusCode).to.equal(200)
        })
        it('=> should return 404 if not found', async () => {
            const response = await request(server)
                .get('/v1/user/some-id-that-doesnt-exist')
                .set('Content-Type', 'application/json')

            expect(response.statusCode).to.equal(404)
        })
    })
    describe('=> getUsers <=', () => {
        let userObj = {}
        beforeEach(async () => {
            userObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'My_passwd@12',
            }
        })
        it('=> should return an empty array if there are no users', async () => {
            const response = await request(server)
                .get('/v1/user')
                .set('Content-Type', 'application/json')

            expect(response.body.response).to.eql([])
        })
        it('=> should return an array of users', async () => {
            await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(userObj)

            const newUserObj = {
                ...userObj,
                userName: userObj.userName + '2',
                email: '2' + userObj.email,
            }
            await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(newUserObj)

            const response = await request(server)
                .get('/v1/user')
                .set('Content-Type', 'application/json')

            expect(response.body.response[0]).to.haveOwnProperty('id')
            expect(response.body.response[0]).to.haveOwnProperty('email')
            expect(response.body.response[0]).to.not.haveOwnProperty('password')
            expect(response.body.response.length).to.equal(2)
            expect(response.statusCode).to.equal(200)
        })
    })
    describe('=> updateUser <=', () => {
        let userObj = {}
        let authToken = null
        let userId = null
        beforeEach(async () => {
            userObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'My_passwd@12',
            }
            const response = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(userObj)

            authToken = response.headers.authorization
            userId = response.body.response.id
        })
        it('=> should update the user found by the given id with new data from body', async () => {
            const originalUserObj = { ...userObj }

            const newEmail = 'my-email@gmail.com'
            const newUserName = 'my-new-user-name'

            userObj.email = newEmail
            userObj.userName = newUserName

            const response = await request(server)
                .patch(`/v1/user/${userId}`)
                .set('Content-Type', 'application/json')
                .set('authorization', authToken)
                .send(userObj)

            expect(response.body.response).to.haveOwnProperty('id')
            expect(response.body.response).to.haveOwnProperty('email')
            expect(response.body.response).to.not.haveOwnProperty('password')
            expect(response.body.response.email).to.equal(newEmail)
            expect(response.body.response.email).to.not.equal(
                originalUserObj.email
            )
            expect(response.body.response.userName).to.equal(newUserName)
            expect(response.body.response.userName).to.not.equal(
                originalUserObj.userName
            )
            expect(response.statusCode).to.equal(200)
        })
        it('should return 403 if authenticated user id and request id dont match', async () => {
            const response = await request(server)
                .patch(`/v1/user/${userId}20`)
                .set('Content-Type', 'application/json')
                .set('authorization', authToken)
                .send(userObj)

            expect(response.statusCode).to.equal(403)
        })
    })
    describe('=> deleteUser <=', () => {
        let userObj = {}
        let authToken = null
        let userId = null
        beforeEach(async () => {
            userObj = {
                userName: faker.internet.userName() + 'w',
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: 'w' + faker.internet.email(),
                password: 'My_passwd@12',
            }
            const response = await request(server)
                .post('/v1/user')
                .set('Content-Type', 'application/json')
                .send(userObj)

            authToken = response.headers.authorization
            userId = response.body.response.id
        })
        it('=> should delete user found by the given id', async () => {
            await request(server)
                .delete(`/v1/user/${userId}`)
                .set('Content-Type', 'application/json')
                .set('authorization', authToken)

            const response = await request(server)
                .get(`/v1/user/${userId}`)
                .set('Content-Type', 'application/json')

            expect(response.body.response).to.eql({})
            expect(response.statusCode).to.equal(404)
        })
        it('should return 403 if authenticated user id and request id dont match', async () => {
            const response = await request(server)
                .delete(`/v1/user/${userId}20`)
                .set('Content-Type', 'application/json')
                .set('authorization', authToken)
                .send(userObj)

            expect(response.statusCode).to.equal(403)
        })
    })
})
