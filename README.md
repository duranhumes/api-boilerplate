# Express MongoDB API Boilerplate (WIP)

This was built for my personal projects as a good ongoing template.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

* [Docker](https://www.docker.com/) & [Docker-Compose](https://docs.docker.com/compose/)
* [npx](https://github.com/zkat/npx)

If you aren't using Docker then you'll need to follow Argon2 [install steps](https://github.com/ranisalt/node-argon2/#before-installing)

## Installing

* Copy the .env.example file to a new .env file and fill in the variables like so,

```
DB_URI=<DB_URI || mongodb://127.0.0.1:27017/db>
TEST_DB_URI=<TEST_DB_URI || mongodb://127.0.0.1:27017/db_test>
JWT_SECRET=<JWT_SECRET || myjwtsecret>
JWT_ISSUER=<JWT_ISSUER || myapp>
DEFAULT_OAUTH_PASSWORD=<DEFAULT_OAUTH_PASSWORD || password123>
```

* Then run `yarn` from a terminal to install packages

* Once done, `yarn dev` with start the server in development mode with live reload, and `yarn start` will build the API for production

## Current endpoints

### /v1/user
* `GET /v1/user` -> Returns all users in DB
* `POST /v1/user` -> Creates a new user from data in the request body
```
{
    "userName": "myusername",
    "email": "myemail@email.com",
    "password": "mypassword(&)1234"
}
```

* `GET /v1/user/:id` -> Returns a user found by id provided
* `PATCH /v1/user/:id` -> Updates a user found by id provided
* `DELETE /v1/user/:id` -> Deletes a user found by id provided
* `GET /v1/user/me` -> Returns the currently logged in user data based on the `authorization` header provided in the request headers
* `POST /v1/user/seed?amount=20` -> Seeds the DB with the amount of users provided in the request query

### /v1/login
* `POST /v1/login` -> Login user with email & password provided in the request body
```
{
    "email": "myemail@email.com",
    "password": "mypassword(&)1234"
}
```

* `POST /v1/oauth` -> Login user with OAuth provider & oauth access token from request body
```
{
    "provider": "GOOGLE",
    "oauthToken": "ADSA930293SA"
}
```

### /v1/logout
* `POST /v1/logout` -> Removes req.user from server

## Running the tests

* Make sure you have a MongoDB instance up and the `.env` variables are set.

* Run `yarn test`

## Deployment

* Fill in the `.env` file with the appropriate variables following the `.env.example` file

* Run `docker-compose up -d`, that will start MongoDB & the API

**Note**
MongoDB is not setup with password authentication so keep that in mind if you want to use this project for anything beyond local development

## Built With

* [Express](https://expressjs.com/) - The api framework used
* [MongoDB](https://www.mongodb.com/) - Database store
* [Argon2](https://github.com/ranisalt/node-argon2/) - Used to hash password
* [Mocha](https://mochajs.org/) - For testing
* [Bunyan](https://github.com/trentm/node-bunyan/) - Used for logging

## Authors

* [Duran Humes](https://github.com/duranhumes)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
