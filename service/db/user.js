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

function userLogin(name, password) {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT * FROM user WHERE name = '${name}' AND password = '${password}'`, (err, result) => {
      console.log(result);
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