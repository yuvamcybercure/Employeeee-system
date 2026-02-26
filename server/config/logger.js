// Fix #4: Winston Logger — replaces hardcoded Windows debug log path
// Used throughout the application for structured, safe logging

const { createLogger, format, transports } = require('winston');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
    level: isProduction ? 'info' : 'debug',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        isProduction
            ? format.json()
            : format.combine(format.colorize(), format.printf(({ timestamp, level, message, stack }) => {
                return `${timestamp} [${level}]: ${stack || message}`;
            }))
    ),
    defaultMeta: { service: 'employee-mgmt' },
    transports: [
        new transports.Console(),
        // File transport only in non-production (Docker/PM2 capture stdout)
        ...(!isProduction ? [
            new transports.File({
                filename: path.join(__dirname, '..', 'logs', 'error.log'),
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),
            new transports.File({
                filename: path.join(__dirname, '..', 'logs', 'app.log'),
                maxsize: 5242880,
                maxFiles: 5,
            }),
        ] : []),
    ],
});

module.exports = logger;
