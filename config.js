const path = require('path');

module.exports = {
    server: {
        port: process.env.PORT || 443,
    },
    ssl: {
        darwin: {
            key: './ssl/private.key',
            cert: './ssl/certificate.crt'
        },
        linux: {
            key: '/etc/nginx/ssl/ximingx.org.cn.key',
            cert: '/etc/nginx/ssl/ximingx.org.cn.crt'
        }
    },
    ssh: {
        localPosts: path.join(__dirname, './posts'),
        remoteHost: '0.0.0.0',
        user: 'root',
        remotePath: '/root/blog/posts',
        privateKey: '/Users/ximingx/.ssh/id_rsa'
    },
    logging: {
        dir: path.join(__dirname, 'logs'),
        errorLog: 'error.log',
        combinedLog: 'combined.log'
    },
    posts: {
        perPage: 5,
        directory: path.join(__dirname, 'posts')
    },
    cache: {
        stdTTL: 3600
    },
    refresh: {
        schedule: '0 0 */1 * * *'
    }
};
