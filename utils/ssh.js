const archiver = require('archiver');
const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const Client = require('ssh2-sftp-client');
const SSH2Client = require('ssh2').Client;
const winston = require('winston');
const { promisify } = require('util');
const lockfile = require('proper-lockfile');
const config = require('../config');

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

function formatDateForTouch(isoString) {
    const date = new Date(isoString);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

async function createZipArchiveWithMetadata(source, out) {
    const archive = archiver('zip', {zlib: {level: 9}});
    const stream = fs.createWriteStream(out);
    const metadata = {};

    try {
        await collectMetadata(source, metadata);
        await fsp.writeFile(path.join(source, config.backup.metadataFileName), JSON.stringify(metadata, null, 2));

        return new Promise((resolve, reject) => {
            archive
                .directory(source, false)
                .on('error', err => reject(err))
                .pipe(stream);
            stream.on('close', () => resolve());
            archive.finalize();
        });
    } catch (err) {
        logger.error('Error in createZipArchiveWithMetadata:', err);
        throw err;
    }
}

async function collectMetadata(dir, metadata) {
    const files = await fsp.readdir(dir, {withFileTypes: true});
    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            await collectMetadata(fullPath, metadata);
        } else {
            const stat = await fsp.stat(fullPath);
            metadata[path.relative(dir, fullPath)] = {
                mtime: stat.mtime.toISOString()
            };
        }
    }
}

function executeRemoteCommand(command, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const conn = new SSH2Client();
        const timer = setTimeout(() => {
            conn.end();
            reject(new Error(`Command "${command}" timed out after ${timeout}ms`));
        }, timeout);

        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) {
                    clearTimeout(timer);
                    reject(err);
                }
                let output = '';
                stream.on('close', (code, signal) => {
                    clearTimeout(timer);
                    conn.end();
                    if (code !== 0) {
                        reject(new Error(`Command "${command}" failed with exit code ${code}: ${output}`));
                    } else {
                        resolve(output);
                    }
                }).on('data', (data) => {
                    output += data;
                }).stderr.on('data', (data) => {
                    output += data;
                });
            });
        }).on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        }).connect({
            host: config.ssh.remoteHost,
            username: config.ssh.remoteUser,
            password: config.ssh.remotePassword
        });
    });
}

async function uploadToRemoteServer(localFile, remoteFile) {
    const sftp = new Client();

    try {
        await sftp.connect({
            host: config.ssh.remoteHost,
            username: config.ssh.remoteUser,
            password: config.ssh.remotePassword
        });

        await sftp.put(localFile, remoteFile);
        logger.info('File uploaded successfully');

        const tempDir = `${config.ssh.remoteDir}_temp`;
        await executeRemoteCommand(`sudo mkdir -p ${tempDir}`);
        await executeRemoteCommand(`sudo unzip -o ${remoteFile} -d ${tempDir}`);
        logger.info('File unzipped to temporary directory');

        await executeRemoteCommand(`
            sudo rm -rf ${config.ssh.remoteDir}/*;
            sudo mkdir -p ${config.ssh.remoteDir}/公务员 ${config.ssh.remoteDir}/博客;
            sudo mv ${tempDir}/公务员/* ${config.ssh.remoteDir}/公务员/ 2>/dev/null || true;
            sudo mv ${tempDir}/博客/* ${config.ssh.remoteDir}/博客/ 2>/dev/null || true;
        `);

        await executeRemoteCommand(`sudo rm -rf ${tempDir}`);
        logger.info('Files replaced successfully, only "公务员" and "博客" folders retained');

        const metadataPath = path.join(config.ssh.remoteDir, config.backup.metadataFileName);
        if (await fileExists(metadataPath)) {
            const metadataContent = await executeRemoteCommand(`sudo cat ${metadataPath}`);
            const metadata = JSON.parse(metadataContent);
            await updateFileTimes(metadata, config.remoteDir);
            await deleteMetadataFile(metadataPath);
        }

    } catch (err) {
        logger.error('Error in uploadToRemoteServer:', err);
        throw err;
    } finally {
        await sftp.end();
    }
}

async function fileExists(filePath) {
    try {
        await executeRemoteCommand(`sudo test -e ${filePath}`);
        return true;
    } catch (error) {
        return false;
    }
}

async function updateFileTimes(metadata, remoteDir) {
    for (const [filePath, fileMetadata] of Object.entries(metadata)) {
        const fullPath = path.join(remoteDir, filePath);
        const timestamp = formatDateForTouch(fileMetadata.mtime);
        try {
            await executeRemoteCommand(`sudo touch -m -t ${timestamp} -- "${fullPath}"`);
            logger.info(`Successfully updated mtime for ${fullPath}`);
        } catch (error) {
            logger.error(`Failed to update mtime for ${fullPath}: ${error.message}`);
        }
    }
    logger.info('File modification times restored');
}

async function deleteMetadataFile(metadataPath) {
    const metadataExists = await executeRemoteCommand(`sudo test -f ${metadataPath} && echo "exists" || echo "not exists"`);
    if (metadataExists.trim() === "exists") {
        await executeRemoteCommand(`sudo rm ${metadataPath}`);
        logger.info('Metadata file deleted');
    } else {
        logger.info('Metadata file does not exist, skipping deletion');
    }
}

async function cleanupFiles(localBackupPath, remoteBackupPath) {
    try {
        await fsp.unlink(localBackupPath);
        logger.info('Local backup file deleted');
    } catch (unlinkError) {
        logger.error('Failed to delete local backup file:', unlinkError);
    }

    try {
        const zipExists = await executeRemoteCommand(`sudo test -f ${remoteBackupPath} && echo "exists" || echo "not exists"`);
        if (zipExists.trim() === "exists") {
            await executeRemoteCommand(`sudo rm ${remoteBackupPath}`);
            logger.info('Remote zip file deleted');
        } else {
            logger.info('Remote zip file does not exist, skipping deletion');
        }
    } catch (rmError) {
        logger.error('Failed to delete remote zip file:', rmError);
    }
}

async function restartPM2Services() {
    try {
        await executeRemoteCommand('pm2 restart all');
        logger.info('PM2 services restarted');
    } catch (pm2Error) {
        logger.error('Failed to restart PM2 services:', pm2Error);
    }
}

// 添加重试逻辑的包装函数
async function withRetry(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            logger.warn(`Attempt ${i + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function upload() {
    const lockFilePath = path.join(__dirname, '..', 'upload.lock');

    try {
        await lockfile.lock(lockFilePath, { retries: { retries: 5, minTimeout: 1000 } });

        const backupPath = path.join(__dirname, '..', config.backup.fileName);
        await createZipArchiveWithMetadata(config.posts.directory, backupPath);
        logger.info('Backup created with metadata');

        const remoteFile = path.join(config.ssh.remoteDir, config.backup.fileName);
        await withRetry(() => uploadToRemoteServer(backupPath, remoteFile));

        await cleanupFiles(backupPath, remoteFile);
        await restartPM2Services();

    } catch (err) {
        logger.error('Backup process failed:', err);
    } finally {
        try {
            await lockfile.unlock(lockFilePath);
        } catch (unlockError) {
            logger.error('Error unlocking file:', unlockError);
        }
    }
}

logger.info('Upload process started');

module.exports = { upload };
