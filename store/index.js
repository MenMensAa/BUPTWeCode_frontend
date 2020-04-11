import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const loginModule = {
    state: {
        token: uni.getStorageSync("token") || "",
        fillerHeight: 0
    },
    mutations: {
        setToken(state, payload) {
            state.token = payload.token
            uni.setStorage({
                key: "token",
                data: payload.token
            })
        },
        unsetToken(state) {
            state.token = "",
            uni.removeStorage({
                key: "token"
            })
        },
        setFillerHeight(state, payload) {
            state.fillerHeight = payload.fillerHeight
        }
    },
    getters: {
        hasToken: state => !!state.token,
        token: state => state.token,
        debug: () => true,
        imageDomain: () => "http://image.buptwecode.com/",
        windowHeight: () => uni.getSystemInfoSync().windowHeight - 64,
        fillerHeight: state => state.fillerHeight
    }
}

const userModule = {
    state: {
        userInfo: uni.getStorageSync('userInfo')
    },
    mutations: {
        updateUser(state, payload) {
            state.userInfo = payload.userInfo
            uni.setStorage({
                key: 'userInfo',
                data: payload.userInfo
            })
        },
        clearUser(state) {
            state.userInfo = null
            uni.removeStorage({
                key: 'userInfo'
            })
        }
    },
    getters: {
        isLogged: state => !!state.userInfo,
        userInfo: state => state.userInfo
    }
}

const draftsModule = {
    state: {
        drafts: uni.getStorageSync('drafts') || []
    },
    mutations: {
        addDraft(state, payload) {
            let draft = {
                draft: payload.draft,
                created: new Date().getTime(),
                board: payload.board
            }
            state.drafts.push(draft)
            uni.setStorageSync('drafts', state.drafts)
        },
        updateDraft(state, payload) {
            let draft = {
                draft: payload.draft,
                created: new Date().getTime(),
                board: payload.board
            }
            state.drafts.splice(payload.index, 1, draft)
            uni.setStorageSync('drafts', state.drafts)
        },
        deleteDraft(state, payload) {
            state.drafts.splice(payload.index, 1)
            uni.setStorageSync('drafts', state.drafts)
        }
    },
    actions: {
        addDraft(context, payload) {
            return new Promise((resolve, reject) => {
                try {
                    context.commit({
                        type: 'addDraft',
                        draft: payload.draft,
                        board: payload.board
                    })
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        },
        updateDraft(context, payload) {
            return new Promise((resolve, reject) => {
                try {
                    if (context.state.drafts.length <= payload.index) {
                        reject("缓存索引出错")
                    } else {
                        context.commit({
                            type: 'updateDraft',
                            draft: payload.draft,
                            board: payload.board,
                            index: payload.index
                        })
                        resolve()
                    }
                } catch (err) {
                    reject(err)
                }
            })
        },
        deleteDraft(context, payload) {
            return new Promise((resolve, reject) => {
                try {
                    if (context.state.drafts.length <= payload.index) {
                        reject("缓存索引出错")
                    } else {
                        context.commit({
                            type: 'deleteDraft',
                            index: payload.index
                        })
                        resolve()
                    }
                } catch (err) {
                    reject(err)
                }
            })
        }
    },
    getters: {
        drafts: state => state.drafts
    }
}

const messageModule = {
    state: {
        flag: false,
        message: {}
    },
    mutations: {
        setMessage(state, payload) {
            state.message = payload
            state.flag = true
        },
        clearMessage(state) {
            state.message = {}
            state.flag = false
        },
    },
    actions: {
        setMessage(context, payload) {
            return new Promise((resolve, reject) => {
                try {
                    // console.log(payload)
                    context.commit('setMessage', payload)
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
            
        },
        clearMessage(context) {
            context.commit({
                type: 'clearMessage'
            })
        }
    },
    getters: {
        hasNewMsg: state => state.flag,
        msg: state => state.message
    }
}

const boardModule = {
    state: {
        boardList: [],
        boardSetting: uni.getStorageSync("boardSetting") || {
            history: [],
            useList: false
        }
    },
    mutations: {
        setBoardList(state, payload) {
            state.boardList = payload.boards
        },
        setBoardHistory(state, payload) {
            let board_id = payload.board.board_id
            for (let i = 0; i < state.boardSetting.history.length; i++) {
                if (board_id === state.boardSetting.history[i].board_id) {
                    state.boardSetting.history.splice(i, 1)
                }
            }
            state.boardSetting.history.unshift(payload.board)
            uni.setStorageSync("boardSetting", state.boardSetting)
        },
        clearBoardHistory(state) {
            state.boardSetting.history = []
            uni.setStorageSync("boardSetting", state.boardSetting)
        },
        setBoardStyle(state) {
            state.boardSetting.useList = !state.boardSetting.useList
            uni.setStorageSync("boardSetting", state.boardSetting)
        }
    },
    actions: {
        setBoardList(context, payload) {
            context.commit({
                type: "setBoardList",
                boards: payload.boards
            })
        },
        setBoardHistory(context, payload) {
            context.commit({
                type: "setBoardHistory",
                board: payload.board
            })
        },
        clearBoardHistory(context) {
            context.commit({
                type: "clearBoardHistory"
            })
        },
        setBoardStyle(context) {
            context.commit({
                type: "setBoardStyle"
            })
        }
    },
    getters: {
        boardList: state => state.boardList,
        boardHistory: state => state.boardSetting.history,
        boardStyle: state => state.boardSetting.useList,
        boardLoaded: state => state.boardList.length !== 0
    }
}

const articleModule = {
    state: {
        article: {},
        flag: false
    },
    mutations: {
        setArticle(state, payload) {
            state.article = payload.article
            state.flag = true
        },
        clearArticle(state) {
            state.article = {}
            state.flag = false
        }
    },
    actions: {
        setArticle(context, payload) {
            return new Promise((resolve, reject) => {
                try {
                    context.commit({
                        type: "setArticle",
                        article: payload.article
                    })
                    resolve()
                } catch(err) {
                    reject(err)
                }
            })
        },
        clearArticle(context) {
            return new Promise((resolve, reject) => {
                try {
                    context.commit({
                        type: "clearArticle"
                    })
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        }
    },
    getters: {
        article: state => state.article,
        hasArticle: state => state.flag
    }
}

const commentModule = {
    state: {
        comment: {},
        flag: false
    },
    mutations: {
        setComment(state, payload) {
            state.comment = payload.comment
            state.flag = true
        },
        clearComment(state) {
            state.comment = {}
            state.flag = false
        }
    },
    actions: {
        setComment(context, payload) {
            return new Promise((resolve, reject) => {
                try {
                    context.commit({
                        type: "setComment",
                        comment: payload.comment
                    })
                    resolve()
                } catch(err) {
                    reject(err)
                }
            })
        },
        clearComment(context) {
            return new Promise((resolve, reject) => {
                try {
                    context.commit({
                        type: "clearComment"
                    })
                    resolve()
                } catch (err) {
                    reject(err)
                }
            })
        }
    },
    getters: {
        comment: state => state.comment,
        hasComment: state => state.flag
    }
}

const articleHistoriesModule = {    state: {        histories: uni.getStorageSync('histories') || []    },    mutations: {        addArticleHistory(state, payload) {
            let article_id = payload.history.article_id            let history = {                history: payload.history,                board: payload.board            }
            for (let i = 0; i < state.histories.length; i++) {
                if (state.histories[i].history.article_id == article_id) {
                    state.histories.splice(i, 1)
                }
            }            state.histories.unshift(history)            uni.setStorageSync('histories', state.histories)        },        deleteArticleHistory(state, payload) {            state.histories.splice(payload.index, 1)            uni.setStorageSync('histories', state.histories)        },        clearArticleHistory(state) {            state.histories = []            uni.setStorageSync('histories', state.histories)        }    },    actions: {        addArticleHistory(context, payload) {            return new Promise((resolve, reject) => {                try {                    context.commit({                        type: 'addArticleHistory',                        history: payload.history,                        board: payload.board                    })                    resolve()                } catch (err) {                    reject(err)                }            })        },        deleteArticleHistory(context, payload) {            return new Promise((resolve, reject) => {                try {                    if (context.state.histories.length <= payload.index) {                        reject("缓存索引出错")                    } else {                        context.commit({                            type: 'deleteArticleHistory',                            index: payload.index                        })                        resolve()                    }                } catch (err) {                    reject(err)                }            })        },        clearArticleHistory(context) {            context.commit({                type: "clearArticleHistory"            })        }    },    getters: {        articleHistories: state => state.histories    }}

const store = new Vuex.Store({
    state: {
        
    },
    mutations: {
        
    },
    actions: {
        
    },
    getters: {
        
    },
    modules: {
        login: loginModule,
        user: userModule,
        drafts: draftsModule,
        message: messageModule,
        board: boardModule,
        article: articleModule,
        comment: commentModule,
        articleHistories: articleHistoriesModule
    }
})

export default store