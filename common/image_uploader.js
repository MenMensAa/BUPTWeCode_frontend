import qiniuUploader from './sdk/qiniuUploader.js'
import { GET_imageUptoken } from '../network/functions.js'

let domian = "image.buptwecode.com"

export function imageUploader(filePath, callback) {
    return new Promise((resolve, reject) => {
        GET_imageUptoken().then(res => {
            let uptoken = res.data.uptoken
            qiniuUploader.upload(
                filePath,
                success => {
                    resolve(success)
                },
                fail => {
                    reject(fail)
                },
                {
                    region: 'NCN',
                    domian: domian,
                    uptoken: uptoken
                },
                callback
            )
        }).catch(err => {
            reject(err)
        })
    })
}