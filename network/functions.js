import axios from './index.js'

// let post = function(url, data, json=false) {
//     if (json) {
//         return axios({
//             method: 'post',
//             url: url,
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             data: data,
//         })
//     } else {
//          return axios({
//                 method: 'post',
//                 url: url,
//                 headers: {
//                     'Content-Type': 'application/x-www-form-urlencoded'
//                 },
//                 data: data,
//                 // transformRequest: [ data => qs.stringify(data, { arrayFormat: "indices" }) ]
//                 // transformRequest: [ data => qs.stringify(data, { arrayFormat: "brackets" }) ]
//                 transformRequest: [ data => qs.stringify(data, { arrayFormat: "repeat" }) ]

//                 // transformRequest: [ data => qs.stringify(data, { indices: false }) ]
//             })
//     }
// }

// let get = function(url, data) {
//     return axios({
//         method: 'get',
//         url: url,
//         params: data
//     })
// }

let get = function(options) {
    return axios({
        url: options.url,
        method: "GET",
        header: {
            "content-type": "application/json"
        },
        data: options.data || {}
    })
}

let post = function(options, json=false) {
    if (!json) {
        return axios({
            url: options.url,
            method: "POST",
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            data: options.data || {}
        })
    } else {
        return axios({
            url: options.url,
            method: "POST",
            header: {
                'content-type': 'application/json'
            },
            data: options.data || {}
        })
    }

}
// common部分,公共接口函数

export function GET_imageUptoken() {
    return get({
        url: '/api/common/image/'
    })
}

// common结束部分

// 专有部分,一般只供单独组件调用
export function POST_editor_publishBtnClick(board_id, data) {
    let tmp_data = {
        board_id: board_id,
        ...data
    }
    console.log(data)
    return post({
        url: '/api/article/operate/',
        data: tmp_data
    })
}

export function GET_me_login(code) {
    return get({
        url: '/api/wx/login/',
        data: {
            'code': code
        }
    })
}

export function POST_me_login(data) {
    let tmp_data = {
        avatarUrl: data.avatarUrl,
        gender: data.gender,
        nickName: data.nickName
    }
    return post({
        url: '/api/wx/user/',
        data: data
    })
}

export function GET_me_mounted() {
    return get({
        url: '/api/wx/user/'
    })
}

