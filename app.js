const express = require('express');
const timeout = require('connect-timeout');
const https = require('https');
const fs = require('fs');
const app = express();
const path = require('path');
const winston = require('winston');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');


// 设置日志记录器
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: path.join(config.logging.dir, config.logging.errorLog), level: 'error' }),
        new winston.transports.File({ filename: path.join(config.logging.dir, config.logging.combinedLog) }),
    ],
});

let options = {};

const indexRouter = require('./router');

// 使用 Helmet 增强安全性
app.use(helmet());

// 使用压缩中间件
app.use(compression());

// 设置全局请求超时时间（60秒）
app.use(timeout('60s'));

app.set('view engine', 'ejs');

app.use('/public', express.static('public', {
    maxAge: '1d',
    etag: true,
    lastModified: true
}));
app.use('/public/fonts', express.static(path.join(__dirname, 'public', 'fonts'), {
    maxAge: '30d', // 缓存30天
    setHeaders: (res, path) => {
        if (path.endsWith('.woff2') || path.endsWith('.woff') || path.endsWith('.ttf')) {
            res.setHeader('Cache-Control', 'public, max-age=2592000'); // 30天in秒
        }
    }
}));

app.use('/assets', express.static('posts/assets'))

// 超时错误处理
app.use((req, res, next) => {
    if (!req.timedout) next();
});

app.use(indexRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
    if (err.timeout) {
        logger.error(`请求超时: ${req.method} ${req.url}`);
        res.status(408).send('Request Timeout');
    } else {
        logger.error(`服务器错误: ${err.message}\n${err.stack}`);
        res.status(500).send('Internal Server Error');
    }
});

// 读取SSL证书
if (process.platform === 'darwin') {
    options = {
        key: fs.readFileSync(path.resolve(__dirname, config.ssl.darwin.key)),
        cert: fs.readFileSync(path.resolve(__dirname, config.ssl.darwin.cert))
    };
} else if (process.platform === 'linux') {
    options = {
        key: fs.readFileSync(config.ssl.linux.key),
        cert: fs.readFileSync(config.ssl.linux.cert)
    };
}

const PORT = config.server.port;
const server = https.createServer(options, app);

server.listen(PORT, () => {
    logger.info(`HTTPS Server running on  https://localhost`);
});

// 优雅关闭
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', error);
    // 给服务器一些时间来记录错误，然后退出
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的 Promise 拒绝:', reason);
});

module.exports = app;
