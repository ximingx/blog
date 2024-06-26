const fs = require('fs').promises;
const path = require('path');
const { Client } = require('node-scp');
const SSH2Client = require('ssh2').Client;

async function uploadAndSyncRecursive(scpClient, sshClient, localPath, remotePath) {
    try {
        console.log(`Processing: ${localPath} -> ${remotePath}`);
        const stats = await fs.stat(localPath);

        if (stats.isDirectory()) {
            console.log(`Creating directory: ${remotePath}`);
            await executeSSHCommand(sshClient, `mkdir -p "${remotePath}"`);

            const files = await fs.readdir(localPath);
            for (const file of files) {
                const localFilePath = path.join(localPath, file);
                const remoteFilePath = path.join(remotePath, file);
                await uploadAndSyncRecursive(scpClient, sshClient, localFilePath, remoteFilePath);
            }
        } else {
            console.log(`Uploading file: ${localPath} -> ${remotePath}`);
            await scpClient.uploadFile(localPath, remotePath);
        }

        // 同步日期
        console.log(`Syncing dates for: ${remotePath}`);
        await syncDates(sshClient, localPath, remotePath);

    } catch (error) {
        console.error(`Error processing ${localPath}: ${error.message}`);
        throw error; // 重新抛出错误以便上层函数可以捕获
    }
}

async function syncDirectoryAndDates(localDirPath, remoteHost, remoteUser, remotePath, privateKey) {
    let scpClient;
    let sshClient;
    try {
        // 创建SCP客户端
        scpClient = await Client({
            host: remoteHost,
            port: 22,
            username: remoteUser,
            privateKey: await fs.readFile(privateKey)
        });

        // 创建SSH连接
        sshClient = new SSH2Client();
        await new Promise(async (resolve, reject) => {
            sshClient.on('ready', resolve).on('error', reject).connect({
                host: remoteHost,
                port: 22,
                username: remoteUser,
                privateKey: await fs.readFile(privateKey)
            });
        });

        // 尝试删除远程目录（如果存在）
        try {
            await executeSSHCommand(sshClient, `rm -rf "${remotePath}"`);
        } catch (error) {
            // 如果目录不存在，忽略错误
            if (!error.message.includes('No such file')) {
                console.warn(`Warning when removing remote directory: ${error.message}`);
            }
        }

        // 创建远程目录
        await executeSSHCommand(sshClient, `mkdir -p "${remotePath}"`);

        // 上传文件并同步日期
        await uploadAndSyncRecursive(scpClient, sshClient, localDirPath, remotePath);

        console.log('目录同步完成');

        // 删除服务器上的 "posts/私人" 文件夹
        const remotePrivateFolder = path.posix.join(remotePath, '私人');
        console.log(`正在删除服务器上的文件夹: ${remotePrivateFolder}`);
        await executeSSHCommand(sshClient, `rm -rf "${remotePrivateFolder}"`);
        console.log(`已删除服务器上的文件夹: ${remotePrivateFolder}`);

        console.log('重启PM2进程...');
        await executeSSHCommand(sshClient, 'pm2 restart all');
        console.log('PM2进程重启完成');

    } catch (error) {
        console.error('操作过程中出错:', error);
    } finally {
        // 确保连接被关闭，即使发生错误
        if (scpClient) await scpClient.close();
        if (sshClient) sshClient.end();
    }
}

async function syncDates(sshClient, localPath, remotePath) {
    const stats = await fs.stat(localPath);
    const atime = stats.atime.getTime() / 1000; // 访问时间
    const mtime = stats.mtime.getTime() / 1000; // 修改时间

    const touchCommand = `touch -a -d @${atime} "${remotePath}" && touch -m -d @${mtime} "${remotePath}"`;
    await executeSSHCommand(sshClient, touchCommand);
}

async function executeSSHCommand(sshClient, command) {
    return new Promise((resolve, reject) => {
        sshClient.exec(command, (err, stream) => {
            if (err) reject(err);
            let stdoutData = "";
            let stderrData = "";
            stream.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Command failed with code ${code}: ${stderrData}`));
                } else {
                    resolve(stdoutData);
                }
            }).on('data', (data) => {
                stdoutData += data;
            }).stderr.on('data', (data) => {
                stderrData += data;
            });
        });
    });
}

module.exports = syncDirectoryAndDates;
