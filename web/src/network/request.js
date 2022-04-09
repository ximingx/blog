import axios from 'axios'

export default function (config) {
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 5000
    })

    instance.interceptors.request.use(config => {
      return config
    }, error => {
      return Promise.reject(error)
    })

    instance.interceptors.response.use(response => {
      return response
    }, error => {
      return Promise.reject(error)
    })

    instance(config).then(res => {
      resolve(res)
    }).catch(error => {
      reject(error)
    })

  })
}