const fs =require("fs");
const path = require("path");

function getPublic() {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, "../public"), (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  })
}

function isFile(path) {
  return new Promise((resolve, reject) => {
    fs.stat(path,function(err,stat){
      if (err) {
       reject(err);
      } else {
        resolve(stat.isFile());
      }
    })
  })
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  })
}


module.exports = {
  getPublic,
  isFile,
  readFile
}