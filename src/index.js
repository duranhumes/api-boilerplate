import 'babel-polyfill';
import http from 'http';
import debug from 'debug';
import 'dotenv/config';

import Server from './server';
import { logger } from './lib/services/logging';

debug('api-express:server');

const port = normalizePort(process.env.PORT || 8080);

Server.set('port', port);
console.log(`Server Listening on port ${port}`);

const server = http.createServer(Server);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

export function normalizePort(value) {
    const iPort = typeof value === 'string' ? Number(value) : value;
    switch (true) {
        case isNaN(iPort):
            return value;
        case iPort >= 0:
            return iPort;
        default:
            return false;
    }
}

server.on('uncaughtException', exception => {
    logger('uncaughtException in index', exception, 500);
    console.error('uncaughtException: ', exception);
});

server.on('unhandledRejection', (reason, promise) => {
    logger('Unhandled Rejection in index', { reason, promise }, 500);
    console.error('Unhandled Rejection: ', promise, ' reason: ', reason);
});

export function onError(error) {
    console.error('Error in Index: ', error);
    logger('Error in index', error, 500);

    if (error.syscall !== 'listen') {
        throw error;
    }
    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

export function onListening() {
    const addr = server.address();
    const bind =
        typeof addr === 'string' ? `Pipe ${addr}` : `Port ${addr.port}`;
    debug(`Listening on ${bind}`);
}

export { server };
