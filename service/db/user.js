const mysql = require('mysql');
const options = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'blog'
};
let connection = mysql.createConnection(options);
connection.connect(err => {
    if (err) {
        console.log(err);
        return;
    }
  console.log("Connected!");
});

function userLogin(username, password) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`, (err, result) => {
      console.log(username, password);
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