const winston = require('winston');
const config = require('../config');
const path = require('path');

// 设置日志
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: path.join(config.logging.dir, config.logging.errorLog), level: 'error' }),
        new winston.transports.File({ filename: path.join(config.logging.dir, config.logging.combinedLog) })
    ]
});

module.exports = logger;
