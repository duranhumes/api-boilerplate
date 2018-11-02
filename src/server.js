import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import frameguard from 'frameguard';
import mongoose from 'mongoose';
import requestId from 'express-request-id';
import passport from 'passport';

import {
    LoginController,
    LogoutController,
    UserController,
} from './controllers';
import { logger } from './lib/services/logging';
import { passportConfig } from './lib/services/passport';

morgan.token('id', req => req.ip);

class Server {
    constructor() {
        this.app = express();
        this.config();
        this.dbInit();
        this.routes();
    }

    config() {
        this.app.disable('x-powered-by');
        this.app.use(frameguard({ action: 'deny' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(compression());
        this.app.use(requestId());
        const loggerFormat =
            ':id [:date[web]] ":method :url" :status :response-time';
        this.app.use(
            morgan(loggerFormat, {
                stream: process.stderr,
            }),
        );
        this.app.use(helmet());
        this.app.use(
            cors({
                credentials: true,
                origin: '*',
            }),
        );
        this.app.use(passport.initialize());
    }

    async dbInit() {
        let uri = String(process.env.DB_URI);
        if (process.env.NODE_ENV === 'test') {
            uri = String(process.env.TEST_DB_URI);
        }

        const mongooseOptions = {
            useCreateIndex: true,
            useNewUrlParser: true,
            auto_reconnect: true,
            reconnectTries: Number.MAX_VALUE,
            reconnectInterval: 1000,
        };

        let connectionRetrys = 0;

        // Try to connect to mongodb instance
        // If unsuccessful log the error and crash the app
        try {
            await mongoose.connect(
                uri,
                mongooseOptions,
            );
        } catch (error) {
            console.error('Error in mongodb connection: ', error);

            // Reconnect to db upto 5 times if connection error occurs
            mongoose.connection.on('error', () => {
                if (connectionRetrys <= 5) {
                    setTimeout(async () => {
                        connectionRetrys += 1;
                        try {
                            await this.dbInit();
                        } catch (error) {
                            console.log(
                                'Error in mongodb reconnection: ',
                                error,
                            );
                        }
                    }, 5000);
                }
            });
        }

        process.on('SIGINT', () => {
            mongoose.connection.close(() => {
                process.exit(0);
            });
        });
    }

    routes() {
        const router = express.Router();

        this.app.use('/api/v1', router);

        router.all('*', (req, res, next) => {
            logger(req.ip, req.statusMessage, req.statusCode);

            // Only allow JSON requests to server
            // to keep consistent
            const contentType = req.headers['content-type'];
            if (req.method !== 'GET') {
                if (!contentType || !contentType.includes('application/json')) {
                    res.status(400).json({
                        response: {},
                        message:
                            "This API only accepts 'application/json' content type for everything except GET requests.",
                    });

                    return;
                }
            }

            next();
        });

        passportConfig();
        router.use('/login', LoginController);
        router.use('/logout', LogoutController);
        router.use('/user', UserController);

        // To prevent 404 if using the API in browser
        const noContentUrls = ['/favicon.ico', '/robots.txt'];
        noContentUrls.forEach(url => {
            this.app.get(url, (_, res) => res.sendStatus(204));
        });

        // Catch stragling errors
        this.app.use((err, req, res, next) => {
            console.log('Error In Server: ', err);
            logger(req.ip, req.statusMessage, req.statusCode);

            res.status(500).json({
                response: {},
                message: 'Something went wrong please try again.',
            });

            return next();
        });
    }
}

export default new Server().app;
