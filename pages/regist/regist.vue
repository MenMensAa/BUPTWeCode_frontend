<template>
	<view class="regist-container">
        <my-modal ref="modal"></my-modal>
        <my-toast ref="toast"></my-toast>
        
		<image src="../../static/logo.png" mode="widthFix" class="logo animation-fade" v-if="logoFlag"></image>
        <image src="../../static/xiaochuan.png" mode="widthFix" class="bg-image animation-slide-bottom" v-if="bgImageFlag"></image>
        <image src="../../static/text_logo.png" mode="widthFix" class="text-logo animation-fade" v-if="logoFlag"></image>
        <view class="desc-text animation-scale-down" v-if="descFlag">一个致力于互联网入门的问答小窝</view>
        <template v-if="btnFlag">
            <button class="cu-btn margin-xl lg login-btn round animation-scale-up" 
                    :disabled="btnLoading" open-type="getUserInfo" @getuserinfo="loginBtnClick">
                <template v-if="btnLoading">
                    <text class="cuIcon-loading2 cuIconfont-spin"></text>
                </template>
                <template v-else>
                    <text class="cuIcon-weixin"></text>
                </template>
                微信登陆
            </button>
        </template>
	</view>
</template>

<script>
    import { POST_me_login, GET_me_login, GET_me_mounted } from '../../network/functions.js'
    
	export default {
        onLoad(options) {
            if (!!options.expire) {
                this.$refs.toast.showToast("您的登陆状态已过期，请重新登陆...")
            }
        },
        onReady() {
            setTimeout(() => {
                this.bgImageFlag = true
            }, 1000)
            setTimeout(() => {
                this.logoFlag = true
            }, 2000)
            setTimeout(() => {
                this.descFlag = true
            }, 3000)
            setTimeout(() => {
                this.btnFlag = true
            }, 4000)
        },
		data() {
			return {
				btnLoading: false,
                
                bgImageFlag: false,
                logoFlag: false,
                descFlag: false,
                btnFlag: false
			}
		},
		methods: {
            login() {
                let that = this
                uni.login({
                    provider: "weixin",
                    success: (wx_res) => {
                        GET_me_login(wx_res.code).then(res => {
                            that.$store.dispatch({
                                type: 'setToken',
                                token: res.data.token
                            }).then(() => {
                                if (res.data.new) {
                                    uni.getUserInfo({
                                        provider: "weixin",
                                        lang: "zh_CN",
                                        success: (info_res) => {
                                            POST_me_login(info_res.userInfo).then(res => {
                                                that.$store.dispatch({
                                                    type: 'updateUser',
                                                    userInfo: res.data
                                                }).then(() => {
                                                    uni.redirectTo({
                                                        url: "/pages/index/index?login=true"
                                                    })
                                                })
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
                                } else {
                                    that.$store.dispatch({
                                        type: 'updateUser',
                                        userInfo: res.data.info
                                    }).then(() => {
                                        uni.redirectTo({
                                            url: "/pages/index/index?login=true"
                                        })
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
                        }).finally(() => {
                            this.btnLoading = false
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
			            if (that.$store.getters.debug) {
			                console.log("uni.login", err)
			            }
			            this.btnLoading = false
			        },
			    })
			},
		}
	}
    
</script>

<style lang="less">
.regist-container {
    background-color: #fff6e6;
    width: 100%;
    height: 100%;
    position: absolute;
    .bg-image {
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
    }
    .logo {
        height: 200rpx;
        width: 200rpx;
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        top: 15%;
    }
    .text-logo {
        height: 120rpx;
        width: 316rpx;
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        top: 30%;
    }
    .login-btn {
        background-color: #dbd4cb;
        position: absolute;
        left: 0;
        right: 0;
        margin: 0 250rpx;
        top: 55%;
    }
    .desc-text {
        text-align: center;
        font-size: 30rpx;
        position: absolute;
        top: 41%;
        width: 100%;
        height: 100rpx;
        line-height: 100rpx;
        letter-spacing: 4rpx;
    }
}
</style>
