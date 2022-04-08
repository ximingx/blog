const express = require('express');
const user = require('./db/user');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))


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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});