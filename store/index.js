import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const loginModule = {
    state: {
        token: uni.getStorageSync("token") || "",
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
        }
    },
    getters: {
        hasToken: state => !!state.token,
        token: state => state.token,
        debug: () => true,
        imageDomain: () => "http://image.buptwecode.com/",
        windowHeight: () => uni.getSystemInfoSync().windowHeight - 64
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
        article: articleModule
    }
})

export default store