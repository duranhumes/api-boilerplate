import chai from 'chai'
import request from 'supertest'
import mongoose from 'mongoose'
import chaiPromises from 'chai-as-promised'

import server from './setup'

chai.use(chaiPromises)
const expect = chai.expect

beforeEach(async () => {
    await mongoose.connection.dropDatabase()
})

after(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    server.close()
    console.log('=> Connections closed')
})

describe('=> API base route <=', () => {
    it('=> should serve /v1 without crashing', async () => {
        const response = await request(server)
            .get('/v1')
            .set('Content-Type', 'application/json')

        expect(response.statusCode).to.equal(404)
    })
})
