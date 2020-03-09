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
        imageDomain: () => "http://image.buptwecode.com/"
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
                created: new Date().getTime()
            }
            state.drafts.push(draft)
            uni.setStorageSync('drafts', state.drafts)
        },
        updateDraft(state, payload) {
            let draft = {
                draft: payload.draft,
                created: new Date().getTime()
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
                        draft: payload.draft
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
                    console.log(payload)
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
    }
})

export default store