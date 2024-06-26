const express = require('express');
require('express-async-errors');
const {promises: fs} = require("fs");
const path = require("path");
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const Router = express.Router();
const schedule = require('node-schedule');
const {upload} = require('../utils/ssh');
const NodeCache = require("node-cache");
const winston = require('winston');
const config = require('../config');
const lockfile = require('proper-lockfile');


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

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// 缓存机制
const postCache = new NodeCache({ stdTTL: config.cache.stdTTL });

// 添加锁定机制
const lockFilePath = path.join(__dirname, '..', 'upload.lock');

async function runWithLock(fn) {
    let releaseLock = null;
    try {
        // 尝试获取锁，设置超时时间为10秒
        releaseLock = await lockfile.lock(lockFilePath, {
            retries: {
                retries: 5,
                factor: 2,
                minTimeout: 1000,
                maxTimeout: 10000,
            }
        });
        logger.info('Lock acquired successfully');
        await fn();
    } catch (err) {
        if (err.code === 'ELOCKED') {
            logger.error('Backup process failed: Lock file is already being held');
        } else {
            logger.error('Error during locked operation:', err);
        }
    } finally {
        if (releaseLock) {
            try {
                await releaseLock();
                logger.info('Lock released successfully');
            } catch (err) {
                logger.error('Error unlocking file:', err);
            }
        }
    }
}

async function initializePosts() {
    await runWithLock(async () => {
        await getPosts();
        await upload();
    });
}

initializePosts();

// 修改定时任务，减少执行频率
schedule.scheduleJob(config.upload.schedule, async () => {
    try {
        await runWithLock(async () => {
            postCache.flushAll();
            await getPosts();
            await upload();
        });
    } catch (err) {
        logger.error('Scheduled task failed:', err);
    }
});

function getPlainTextFromHtml(html) {
    let plainText = html.replace(/<[^>]+>/g, '');
    return plainText.replace(/\s+/g, ' ').trim();
}

async function getPostMetadata(filePath) {
    const stat = await fs.stat(filePath);
    const fileName = path.basename(filePath, path.extname(filePath));
    const relativePath = path.relative('./posts', path.dirname(filePath));
    const tags = relativePath ? relativePath.split(path.sep) : [];

    const content = await fs.readFile(filePath, 'utf-8');
    const htmlContent = md.render(content);
    const plainTextContent = getPlainTextFromHtml(htmlContent);
    const excerpt = plainTextContent.slice(0, 120) + '...';

    return {
        fileName,
        tags,
        fullPath: filePath,
        date: stat.mtime.toISOString().split('T')[0],
        excerpt
    };
}

async function getPostsFromFiles(dirPath = config.posts.directory) {
    const posts = [];
    const rootDir = path.resolve(dirPath);

    async function traverseDirectory(currentPath) {
        const files = await fs.readdir(currentPath);
        const promises = files.map(async file => {
            const filePath = path.join(currentPath, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                await traverseDirectory(filePath);
            } else if (file.endsWith('.md')) {
                const metadata = await getPostMetadata(filePath);
                posts.push(metadata);
            }
        });

        await Promise.all(promises);
    }

    await traverseDirectory(rootDir);
    return posts;
}

async function getPosts() {
    let posts = postCache.get('allPosts');
    if (posts == undefined) {
        posts = await getPostsFromFiles();
        postCache.set('allPosts', posts);
    }
    return posts;
}

async function getFullPost(fileName) {
    const posts = await getPosts();
    const post = posts.find(p => p.fileName === fileName);
    if (!post) return null;

    const content = await fs.readFile(post.fullPath, 'utf-8');
    const htmlContent = md.render(content);

    return {
        ...post,
        content,
        htmlContent
    };
}

Router.get('/', async (req, res) => {
    let posts = await getPosts();

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const page = parseInt(req.query.page) || 1;
    const totalPages = Math.ceil(posts.length / config.posts.perPage);

    const startIndex = (page - 1) * config.posts.perPage;
    const endIndex = startIndex + config.posts.perPage;
    const paginatedPosts = posts.slice(startIndex, endIndex);

    res.render('index', {
        posts: paginatedPosts,
        currentPage: page,
        totalPages: totalPages
    });
});

Router.get('/tags', async (req, res) => {
    let posts = await getPosts();

    const tagMap = {};
    posts.forEach(post => {
        let currentLevel = tagMap;
        for (let i = 0; i < post.tags.length; i++) {
            const tag = post.tags[i];
            if (i === post.tags.length - 1) {
                if (!currentLevel[tag]) {
                    currentLevel[tag] = [];
                }
                currentLevel[tag].push(post);
            } else {
                if (!currentLevel[tag]) {
                    currentLevel[tag] = {};
                }
                currentLevel = currentLevel[tag];
            }
        }
    });

    res.render('tags', {tagMap});
});

Router.get('/archives', async (req, res) => {
    let posts = await getPosts();

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    const archiveMap = {};
    posts.forEach(post => {
        const date = new Date(post.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (!archiveMap[year]) {
            archiveMap[year] = {};
        }
        if (!archiveMap[year][month]) {
            archiveMap[year][month] = [];
        }
        archiveMap[year][month].push(post);
    });
    res.render('archives', {archiveMap});
});

Router.get('/post/:title', async (req, res) => {
    const title = req.params.title;
    const post = await getFullPost(title);

    if (!post) {
        return res.status(404).send('文章不存在');
    }

    res.render('post', {post});
});

Router.get('/about', async (req, res) => {
    let content = await fs.readFile(path.join('./', 'README.md'), 'utf-8');
    let about = md.render(content);
    res.render('about', {htmlContent: about});
});

// 错误处理中间件
Router.use((err, req, res, next) => {
    logger.error('Error in request:', err);
    res.status(500).send('Internal Server Error');
});

module.exports = Router;