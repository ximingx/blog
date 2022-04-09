const express = require('express');
const { userLogin } = require('../db/user');
const { getPublic,readFile,isFile } =require("../bin/ximingx_fs")
const router = express.Router();
const path = require('path');

// 登录
router.post('/api/user/login', (req, res) => {
  const { username, password } = req.query;
  userLogin(username, password).then(data => {
    if (data.length === 0) {
      res.status(500).end({
        message: 'Login Error',
        data: data
      })
    } else {
      res.status(200).send({
        message: 'Login Success',
        data: data
      })
    }
  }).catch(err => {
    res.send({
      message: 'Login Error',
    })
  })
});

// 资源
router.get('/api/public/source', (req, res) => {
  res.send([
    {
      id: 1,
      name: "public",
      type: "file",
    }
  ])
})

// 4. 向外导出路由对象
module.exports = router