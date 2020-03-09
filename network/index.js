import store from '../store/index.js'
import { CODES } from '../common/cnst.js'


export default function axios (options) {
    const baseURL = "http://192.168.0.102:5000"
    const url = baseURL + options.url
    let header = options.header
    if (store.getters.hasToken) {
        header["Z-Token"] = store.getters.token
    }
    return new Promise((resolve, reject) => {
        uni.request({
            url: url,
            method: options.method,
            header: options.header,
            timeout: 60000,
            data: options.data,
            success: (res) => {
                if (res.data.code === CODES.OK) {
                    resolve(res.data)
                } else {
                    reject(res.data)
                }
            },
            fail: reject
        })
    })
}