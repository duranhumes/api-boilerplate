import faker from 'faker'

const userShape = () => ({
    id: faker.random.uuid(),
    userName: faker.internet.userName(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: 'Pass_wd@123',
    profilePhoto: faker.internet.avatar(),
    oauthProviders: faker.random.boolean()
        ? [
              {
                  id: faker.random.uuid(),
                  type: 'GOOGLE',
              },
          ]
        : [],
})

export default (amount = 10) => {
    let users = []
    for (let i = 0; i < amount; i++) {
        users = [...users, { ...userShape() }]
    }

    console.log(`=> Created ${amount} users`)

    return users
}
