const mysql = require('mysql');
const options = {
    host: 'ximingx.com',
    user: 'ximingx',
    password: 'ximingx',
    database: 'blog'
};
let connection = mysql.createConnection(options);
connection.connect();

function userLogin(username, password) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`, (err, result) => {
      if (err) {
        reject(err);
      } else {
       resolve(result);
      }
    });
  })
}

module.exports = {
  userLogin
}