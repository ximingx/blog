// config.js
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
    logging: {
        dir: './log',
        errorLog: 'error.log',
        combinedLog: 'combined.log'
    },
    ssh: {
        remoteDir: '/root/blog/posts',
        remoteHost: '你的服务器ip地址',
        remoteUser: 'root',
        remotePassword: '你的服务器密码',
    },
    backup: {
        fileName: 'posts.zip',
        metadataFileName: 'file_metadata.json'
    },
    posts: {
        perPage: 5,
        directory: './posts'
    },
    cache: {
        stdTTL: 3600
    },
    upload: {
        schedule: '0 */12 * * *'
    }
};
