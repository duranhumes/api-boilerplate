import chai from 'chai';
import chaiPromises from 'chai-as-promised';
import faker from 'faker';

import { create, findOne } from '../';

chai.use(chaiPromises);
const expect = chai.expect;

let gUser = null;

before(done => {
    create({
        username: faker.internet.userName(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
    }).then(u => {
        gUser = u;
        done();
    });
});

describe('Find one user service', () => {
    it('should return 404 if user does not exist.', async () => {
        try {
            await findOne('id', 'f1cc428f-5bca-4991-afd4-a120f400cce1');
        } catch (error) {
            expect(error.code).to.equal(404);
            expect(error.message.toString()).to.equal('User not found');
        }
    });
    it('should find a user by the given id', async () => {
        const { email } = gUser;

        let user = null;
        try {
            user = await findOne('email', email);
            console.log('email: ', email);
        } catch (error) {
            // console.log(error);
            // expect(error).to.not.exist;
        }

        console.log('User: ', gUser);

        expect(user).to.haveOwnProperty('email');
        expect(user).to.not.haveOwnProperty('password');
        expect(user).to.not.haveOwnProperty('__v');
    });
    // it('should return an array of user objects.', async () => {
    //     const AMOUNT_OF_USERS = 2;
    //     try {
    //         const users = await findAll();
    //         expect(users).to.have.lengthOf(AMOUNT_OF_USERS);
    //         expect(users[0]).to.haveOwnProperty('email');
    //         expect(users[0]).to.not.haveOwnProperty('password');
    //         expect(users[0]).to.not.haveOwnProperty('__v');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // });
});
