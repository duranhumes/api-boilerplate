import chai from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';

import server from './setup';

const expect = chai.expect;

beforeEach('Drop db', async () => {
    await mongoose.connection.dropDatabase();
});

after('Drop db', async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close(() => {
        console.log('Connection closed');
    });
});

describe('API base routes should run without crashing', () => {
    it('should serve  /api/v1', done => {
        request(server)
            .get('/api/v1')
            .set('Accept', 'application/json')
            .end((error, response) => {
                if (error) {
                    console.log(error);
                }
                expect(response.statusCode).to.equal(200);
                done();
            });
    });
    it('should serve /api/v1/user', done => {
        request(server)
            .get('/api/v1/user')
            .set('Accept', 'application/json')
            .end((error, response) => {
                if (error) {
                    console.log(error);
                }
                expect(response.statusCode).to.equal(200);
                done();
            });
    });
});
