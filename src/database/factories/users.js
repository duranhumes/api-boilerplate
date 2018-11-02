import faker from 'faker';

const userShape = () => ({
    username: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    dateOfBirth: faker.date.past(
        50,
        new Date('Sat Sep 20 1992 21:35:02 GMT+0200 (CEST)'),
    ),
    phone: faker.phone.phoneNumber(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    profilePhoto: faker.internet.avatar(),
    showProfile: faker.random.boolean(),
    location: {
        city: faker.address.city(),
        country: faker.address.country(),
    },
    socialMediaLinks: {
        twitter: {
            online: faker.random.boolean(),
            link: `https://twitter.com/${faker.internet.userName()}`,
        },
        facebook: {
            online: faker.random.boolean(),
            link: `https://facbook.com/${faker.internet.userName()}`,
        },
        linkedin: {
            online: faker.random.boolean(),
            link: `https://linkedin.com/in/${faker.internet.userName()}`,
        },
        instagram: {
            online: faker.random.boolean(),
            link: `https://instagram.com/${faker.internet.userName()}`,
        },
    },
    oauthProviders: [
        {
            id: faker.random.uuid(),
            type: 'FACEBOOK',
        },
    ],
});

export default (amount = 1) => {
    let users = [];
    for (let i = 0; i < amount; i++) {
        users = [...users, { ...userShape() }];
    }

    return users;
};
