const express = require('express');
const router = require('./router/router');
const app = express();
const cors = require('cors')
const bodyParser = require('body-parser');

app.use(express.static("public/dist"));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(router);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});