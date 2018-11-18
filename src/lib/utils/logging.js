import fs from 'fs'
import bunyan from 'bunyan'
import RotatingFileStream from 'bunyan-rotating-file-stream'

if (!fs.existsSync('logs')) {
    fs.mkdirSync('logs')
}

const logSettings = {
    period: '1d', // daily rotation
    totalFiles: 2, // keep 2 back copies
    threshold: '10m', // Rotate log files larger than 10 megabytes
    totalSize: '20m', // Don't keep more than 20mb of archived log files
    rotateExisting: true, // Give ourselves a clean file when we start up, based on period
    gzip: true, // Compress the archive log files to save space
}

const date = new Date().toJSON().slice(0, 10)
const errorStreamerRotatedByLength = {
    type: 'raw',
    level: 'error',
    stream: new RotatingFileStream({
        path: `logs/log-${date}.errors.log`,
        ...logSettings,
    }),
}

const infoStreamerRotatedByLength = {
    type: 'raw',
    level: 'info',
    stream: new RotatingFileStream({
        path: `logs/log-${date}.log`,
        ...logSettings,
    }),
}

export const stream = bunyan.createLogger({
    name: 'api',
    serializers: {
        req: require('bunyan-express-serializer'),
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err,
    },
    streams: [infoStreamerRotatedByLength, errorStreamerRotatedByLength],
})

export function logger(id, body, statusCode) {
    const log = stream.child(
        {
            id,
            body,
            statusCode,
        },
        true
    )

    if (statusCode > 404) {
        return log.error(body)
    } else {
        return log.info(body)
    }
}
