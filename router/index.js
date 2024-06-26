const express = require('express');
require('express-async-errors');
const {promises: fs} = require("fs");
const path = require("path");
const MarkdownIt = require('markdown-it');
const md = new MarkdownIt();
const Router = express.Router();
const schedule = require('node-schedule');
const NodeCache = require("node-cache");
const logger = require('../utils/logger');
const config = require('../config');
const syncDirectoryAndDates = require('../utils/ssh');
const chokidar = require('chokidar');

// 缓存机制
const postCache = new NodeCache({ stdTTL: config.cache.stdTTL });

initializePosts();

schedule.scheduleJob(config.refresh.schedule, async () => {
    try {
        postCache.flushAll();
        await getPosts();
        if (process.platform === 'linux' || config.ssh.remoteHost === '0.0.0.0') return;
        console.log('Start to sync posts...')
        await syncDirectoryAndDates(config.ssh.localPosts, config.ssh.remoteHost, config.ssh.user, config.ssh.remotePath, config.ssh.privateKey);
    } catch (err) {
        logger.error('Scheduled task failed:', err);
    }
});

let timeoutId;

// 监听 posts 文件夹下的文件改动
chokidar.watch(config.ssh.localPosts).on('all', (event, path) => {
    console.log(event, path);
    // 如果在三分钟内有新的文件改动，清除旧的定时器
    if (timeoutId) clearTimeout(timeoutId);
    // 设置新的定时器，在三分钟后执行 syncDirectoryAndDates 事件
    timeoutId = setTimeout(async () => {
        console.log('Start to sync posts...')
        await syncDirectoryAndDates(config.ssh.localPosts, config.ssh.remoteHost, config.ssh.user, config.ssh.remotePath, config.ssh.privateKey);
    }, 3 * 60 * 1000);  // 3分钟
});

async function initializePosts() {
    try {
        await getPosts();
        if (process.platform === 'linux' || config.ssh.remoteHost === '0.0.0.0') return;
        await syncDirectoryAndDates(config.ssh.localPosts, config.ssh.remoteHost, config.ssh.user, config.ssh.remotePath, config.ssh.privateKey);
    } catch (err) {
        console.error('Error during posts initialization:', err);
    }
    console.log('Posts initialization process completed');
}

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
