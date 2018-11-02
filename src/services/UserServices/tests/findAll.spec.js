import chai from 'chai';
import chaiPromises from 'chai-as-promised';
import faker from 'faker';

import { create, findAll } from '../';

chai.use(chaiPromises);
const expect = chai.expect;

describe('Find all user service', () => {
    it('should return empty array if no users.', async () => {
        let users = null;
        try {
            users = await findAll();
        } catch (error) {
            console.log(error);
            expect(error).to.not.exist;
        }

        expect(users).to.eql([]);
    });
    it('should return an array of user objects.', async () => {
        const AMOUNT_OF_USERS = 2;
        for (let i = 0; i < AMOUNT_OF_USERS; i++) {
            await create({
                username: faker.internet.userName(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            });
        }

        let users = null;
        try {
            users = await findAll();
        } catch (error) {
            console.log(error);
            expect(error).to.not.exist;
        }

        expect(users).to.have.lengthOf(AMOUNT_OF_USERS);
        expect(users[0]).to.haveOwnProperty('email');
        expect(users[0]).to.not.haveOwnProperty('password');
        expect(users[0]).to.not.haveOwnProperty('__v');
    });
});
