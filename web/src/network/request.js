import axios from 'axios'

export default function (config) {
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      baseURL: 'http://ximingx.com/api',
      timeout: 10000
    })

    instance(config).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })

  })
}