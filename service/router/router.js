const express = require('express');
const { userLogin } = require('../db/user');
const { getPublic,readFile,isFile } =require("../bin/ximingx_fs")
const router = express.Router();
const path = require('path');

// 登录
router.post('/api/user/login', (req, res) => {
  const { username, password } = req.query;
  userLogin(username, password).then(data => {
    console.log(data)
    if (data.length) {
      res.send({
        code: 200,
        data: data[0]
      });
    } else {
      res.send({
        code: 400,
        msg: '用户名或密码错误'
      });
    }
  });
});

// 资源
router.get('/api/public/source', (req, res) => {
  res.send([
    {
      id: 1,
      name: "file1",
      type: "file"
    },
    {
      id: 2,
      name: "dir1",
      type: "dir",
    },
    {
      id: 3,
      name: "file2",
      type: "file",
    },
    {
      id: 4,
      name: "dir2",
      type: "dir",
    },
    {
      id: 2,
      name: "file5",
      type: "file",
    },
  ])
})

// 4. 向外导出路由对象
module.exports = router