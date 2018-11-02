import chai from 'chai';
import chaiPromises from 'chai-as-promised';
import faker from 'faker';

import { create } from '../';

chai.use(chaiPromises);
const expect = chai.expect;

const user = {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
};

const dupUser = {
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
};

describe('Create user service', () => {
    it('should handle case when user already exists', async () => {
        await create(dupUser);

        try {
            await create(dupUser);
            return Promise.resolve();
        } catch (error) {
            expect(JSON.stringify(error)).to.equal(
                JSON.stringify({
                    code: 409,
                    message: 'User already exists',
                }),
            );
        }
    });

    it('should create a new user and return mongoose model', async () => {
        let newUser = null;
        try {
            newUser = await create(user, false);
        } catch (error) {
            console.log(error);
            expect(error).to.not.exist;
        }

        expect(newUser).to.have.property('username', user.username);
        expect(newUser).to.have.property('firstName', user.firstName);
        expect(newUser).to.have.property('lastName', user.lastName);
        expect(newUser).to.have.property('email', user.email.toLowerCase());
        expect(newUser).to.have.property('__v', 0);
    });

    it('should throw error if anything but object is passed', async () => {
        try {
            await create('', false);
        } catch (error) {
            expect(error.toString()).to.equal(
                'Error: User data must be provided.',
            );
        }

        try {
            await create([], false);
        } catch (error) {
            expect(error.toString()).to.equal(
                'Error: User data must be provided.',
            );
        }

        try {
            await create(102, false);
        } catch (error) {
            expect(error.toString()).to.equal(
                'Error: User data must be provided.',
            );
        }

        try {
            await create({}, false);
        } catch (error) {
            expect(error.toString()).to.equal(
                'Error: User data must be provided.',
            );
        }
    });
});
