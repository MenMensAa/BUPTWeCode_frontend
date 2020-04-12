<template>
    <view>
        <template v-if="isLogged">
            <view class="me-header flex margin-sm padding-sm shadow bg-white">
                <view class="flex-sub">
                    <view class="cu-avatar xl round bg-red"
                          :style="[{ backgroundImage: 'url(' + userInfo.avatar + ')'}]">
                        <view class="cu-tag badge" :class=" userInfo.gender%2 == 0 ? 'cuIcon-female bg-pink': 'cuIcon-male bg-blue' "></view>
                    </view>
                </view>
                <view class="flex-treble">
                    <view class="me-username">{{userInfo.username}}</view>
                    <view class="me-signatrue margin-top-sm">{{userInfo.signature | signatureFilter}}</view>
                </view>
            </view>

            <view class="cu-list menu sm-border card-menu margin-top">
                <template v-for="(val, index) in serviceList">
                    <view :key="val.id" class="cu-item arrow" @click="serviceClick(index)">
                        <view class="content">
                            <text class="text-gray" :class="val.icon"></text>
                            <text class="text-gray">{{val.name}}</text>
                        </view>
                    </view>
                </template>
            </view>
        </template>
        
        <template v-else>
            <button class="cu-btn block bg-green margin-xl lg" type="" 
                    :disabled="btnLoading" open-type="getUserInfo" @getuserinfo="loginBtnClick">
                <template v-if="btnLoading">
                    <text class="cuIcon-loading2 cuIconfont-spin padding-sm"></text>
                </template>
                <template v-else>
                    <text class="cuIcon-weixin padding-sm"></text>
                </template>
                微信登陆
            </button>
        </template>
        <my-modal ref="modal"></my-modal>
        <button class="cu-btn block bg-green margin-xl lg" type="" @click="clearUserInfo">测试: 清除登陆状态</button>
    </view>
</template>

<script>
    import { POST_me_login, GET_me_login, GET_me_mounted } from '../network/functions.js'
    
    export default {
        name: "Me",
        data() {
            return {
                btnLoading: false,
                serviceList: [
                    { name: "浏览历史", icon: "cuIcon-time", dest: "/pages/history/history" },
                    { name: "帖子管理", icon: "cuIcon-form", dest: "/pages/posts/posts" },
                    { name: "赞过的帖子", icon: "cuIcon-like", dest: "/pages/like/like" },
                    { name: "草稿箱", icon: "cuIcon-edit", dest: "/pages/drafts/drafts" },
                    { name: "反馈", icon: "cuIcon-service", dest: "/pages/feedback/feedback"}
                ],
            }
        },
        methods: {
            login() {
                let that = this
                uni.login({
                    provider: "weixin",
                    success: (wx_res) => {
                        GET_me_login(wx_res.code).then(res => {
                            console.log('login', res)
                            that.$store.commit({
                                type: 'setToken',
                                token: res.data.token
                            })
                            uni.getUserInfo({
                                provider: "weixin",
                                lang: "zh_CN",
                                success: (info_res) => {
                                    POST_me_login(info_res.userInfo).then(res => {
                                        console.log(res.data)
                                        that.$store.commit({
                                            type: 'updateUser',
                                            userInfo: res.data
                                        })
                                        that.$refs.modal.showModal("提示", "登陆成功!")
                                    }).catch(err => {
                                        that.$refs.modal.showModal("错误", "登陆过程中发生错误...")
                                        if (that.$store.getters.debug) {
                                            console.log(err)
                                        }
                                    }).finally(() => {
                                        that.btnLoading = false
                                    })
                                }
                            })
                        }).catch(err => {
                            that.$store.commit({
                                type: "unsetToken"
                            })
                            that.$refs.modal.showModal("错误", "登陆过程中发生错误...")
                            that.btnLoading = false
                            if (that.$store.getters.debug) {
                                console.log("GET_store_SignIn", err)
                            }
                        })
                    },
                    fail: (err) => {
                        that.$store.commit({
                            type: "unsetToken"
                        })
                        that.btnLoading = false
                        that.$refs.modal.showModal("错误", "登陆过程中发生错误...")
                        if (that.$store.getters.debug) {
                            console.log("uni.login", err)
                        }
                    }
                })
            },
            loginBtnClick() {
                this.btnLoading = true
                let that = this
                uni.getSetting({
                    success: (setting_res) => {
                        console.log(setting_res)
                        if (!setting_res.authSetting["scope.userInfo"]) {
                            uni.authorize({
                                scope: 'scope.userInfo',
                                success: () => {
                                    that.login()
                                },
                                fail: () => {
                                    that.btnLoading = false
                                    console.log("auth deny")
                                },
                            })
                        } else {
                            that.login()
                        }
                    },
                    fail: (err) => {
                        console.log(err)
                    }
                })
            },
            clearUserInfo() {
                this.$store.commit({
                    type: "clearUser"
                })
                this.$store.commit({
                    type: "unsetToken"
                })
            },
            serviceClick(index) {
                uni.navigateTo({
                    url: this.serviceList[index].dest
                })
            }
        },
        computed: {
            isLogged() {
                return this.$store.getters.isLogged
            },
            userInfo() {
                if (this.$store.getters.isLogged) {
                    return this.$store.getters.userInfo
                } else {
                    return {
                        username: "这是用户名",
                        avatar: "",
                        gender: 0,
                        signature: "这是用户签名"
                    }
                }
            }
        },
        filters: {
            signatureFilter(val) {
                if (val.length > 30) {
                    return '"' + val.substring(0, 30)+ '... "'
                } else {
                    return '"' + val + ' "'
                }
            }
        }
    }
</script>

<style lang="less">
.me-header {
    position: relative;
    overflow: hidden;
    border-radius: 20rpx;
    .me-username {
        font-size: 36rpx;
    }
    .me-signatrue {
        color: #d5d5d5;
        font-style: italic;
    }
}
</style>
