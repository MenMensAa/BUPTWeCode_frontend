import axios from './index.js'

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

// 1.如果有post传递的数据是复杂类型的数据（some fields in list, dict）, json=true
// 2.如果传递的数据类型不包含复杂类型的数据(all field not list, dict), json=false
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
export function POST_comment_subCommentBtnClick(data) {
    console.log(data)
    return post({
        url: '/api/comment/sub/add/',
        data: data
    })
}

export function GET_comment_mounted(data) {
    console.log(data)
    return get({
        url: '/api/comment/sub/query/',
        data: data
    })
}

export function POST_article_commentBtnClick(article_id, data) {
    let tmp_data = {
        article_id: article_id,
        ...data
    }
    return post({
        url: '/api/comment/add/',
        data: tmp_data
    }, true)
}

export function GET_article_mounted(data) {
    return get({
        url: '/api/comment/query/',
        data: data
    })
}

export function POST_feedback_submitBtnClick(data) {
    return post({
        url: '/api/feedback/submit/',
        data: data
    }, true)
}

export function GET_board_article(data) {
    return get({
        url: "/api/article/query/",
        data: data
    })
}

export function GET_board_mounted() {
    return get({
        url: "/api/board/"
    })
}

export function POST_editor_publishBtnClick(board_id, data) {
    let tmp_data = {
        board_id: board_id,
        ...data
    }
    return post({
        url: '/api/article/put/',
        data: tmp_data
    }, true)
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

