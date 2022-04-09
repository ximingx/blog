// 1. 导入 express
const express = require('express')
const user = require("./db/user");
// 2. 创建路由对象
const router = express.Router()
// 3. 挂载路由
const app = express();

app.post('/api/user/login', (req, res) => {
  const { username, password } = req.query;
  user.userLogin(username, password).then(data => {
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

// 4. 向外导出路由对象
module.exports = router