import compression from 'compression'
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import frameguard from 'frameguard'
import mongoose from 'mongoose'
import passport from 'passport'

import {
    LoginController,
    LogoutController,
    UserController,
} from './controllers'
import { logger } from './lib/utils/logging'
import { passportConfig } from './lib/middleware/passport'
import { promisify } from './lib/utils'

morgan.token('id', req => req.ip)

class Server {
    constructor() {
        this.app = express()
        this.config()
        this.dbInit()
        this.routes()
    }

    config() {
        this.app.disable('x-powered-by')
        this.app.use(frameguard({ action: 'deny' }))
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(express.json())
        this.app.use(compression())
        const loggerFormat =
            ':id [:date[web]] ":method :url" :status :response-time'
        this.app.use(
            morgan(loggerFormat, {
                stream: process.stderr,
            })
        )
        this.app.use(helmet())
        this.app.use(
            cors({
                credentials: true,
                origin: '*',
            })
        )
        this.app.use(passport.initialize())
    }

    async dbInit() {
        let uri = String(process.env.DB_URI)
        if (process.env.NODE_ENV === 'test') {
            uri = String(process.env.TEST_DB_URI)
        }

        const mongooseOptions = {
            useCreateIndex: true,
            useNewUrlParser: true,
            auto_reconnect: true,
            reconnectTries: 5,
            reconnectInterval: 2500,
        }

        // Try to connect to mongodb instance
        /* eslint-disable no-unused-vars */
        const [_, err] = await promisify(
            mongoose.connect(
                uri,
                mongooseOptions
            )
        )
        /* eslint-enable no-unused-vars */
        if (err) {
            console.log(`Error in mongodb connection: ${err}`)
        } else {
            console.log(`Mongoose successfully connected at: ${uri}`)
        }

        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                process.exit(0)
            })
        })
    }

    routes() {
        const router = express.Router()

        this.app.use('/v1', router)

        passportConfig()
        router.use('/login', LoginController)
        router.use('/logout', LogoutController)
        router.use('/user', UserController)

        // To prevent 404 if specific files are requested that don't exist
        const noContentUrls = ['/favicon.ico', '/robots.txt']
        noContentUrls.forEach(url => {
            router.get(url, (_, res) => res.sendStatus(204))
        })

        // Catch straggling errors
        this.app.use((err, req, res, next) => {
            console.log('Error In Server: ', err)
            logger(req.ip, req.statusMessage, req.statusCode)

            if (err && err.message) {
                res.status(500).json({
                    response: {},
                    message: err.message,
                })

                return next()
            }

            res.status(404).json({
                response: {},
                message: 'Not found.',
            })

            return next()
        })
    }
}

export default new Server().app
