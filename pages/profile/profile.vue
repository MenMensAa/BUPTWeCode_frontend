<template>
	<view>
        <my-nav bgColor="bg-gradual-blue" :isBack="true" ref="nav"
                :autoBack="false" @backClick="backClickHandler">
        	<block slot="backText">返回</block>
        	<block slot="content">资料</block>
        </my-nav>
		
        <my-modal ref="modal"></my-modal>
        <my-toast ref="toast"></my-toast>
        <my-dialog ref="dialog"></my-dialog>
        
        <view class="cu-load load-modal" v-if="uploading">
        	<image src="/static/logo.png" mode="aspectFit"></image>
        	<view class="gray-text">加载中...</view>
        </view>
        
        <view class="cu-bar bg-white solid-bottom">
        	<view class="action">
        		<text class="cuIcon-title text-orange"></text> 个人资料
        	</view>
            <view class="action">
                <button class='cu-btn bg-green shadow' @click="saveProfile" :disabled="noChanged">保存</button>
            </view>
        </view>
        
        <form>
            <view class="cu-form-group my-avatar margin-top" @click="changeAvatar">
            	<view class="title">头像</view>
            	<view class="cu-avatar radius bg-gray xl"
                      :style="[{ backgroundImage: 'url(' + profileForm.avatar + ')'}]" @click.stop="viewImage"></view>
            </view>
            <view class="cu-form-group">
            	<view class="title">性别</view>
            	<switch class='switch-sex' @change="sexChange" :class="isMale?'checked':''" :checked="isMale ? true:false" color="#8799a3"></switch>
            </view>
            <view class="cu-form-group">
            	<view class="title">昵称</view>
            	<input name="input" v-model="profileForm.username" maxlength="10"></input>
            </view>
        	<view class="cu-form-group align-start">
        		<view class="title">小尾巴</view>
        		<textarea maxlength="50" v-model="profileForm.signature"></textarea>
        	</view>
        </form>
	</view>
</template>

<script>
    import { imageUploader } from '../../common/image_uploader.js'
    import { POST_profile_updateProfile } from '../../network/functions.js'
    
	export default {
        onLoad() {
            let profile = this.$store.getters.userInfo
            this.profileForm = JSON.parse(JSON.stringify(profile))
            this.oldProfileForm = JSON.parse(JSON.stringify(profile))
        },
		data() {
			return {
				profileForm: {
                    username: "这是用户名",
                    avatar: "",
                    gender: 0,
                    signature: "这是用户签名"
                },
                oldProfileForm: {
                    username: "这是用户名",
                    avatar: "",
                    gender: 0,
                    signature: "这是用户签名"
                },
                uploading: false,
                sending: false,
			};
		},
        methods: {
            sexChange() {
                this.profileForm.gender = 1 - this.profileForm.gender
            },
            backClickHandler() {
                if (!this.noChanged) {
                    this.$refs.dialog.showDialog({
                        content: "还有没保存的修改，确定退出吗?"
                    }).then(() => {
                        this.$refs.nav.backPage()
                    }).catch(() => {})
                } else {
                    this.$refs.nav.backPage()
                }
            },
            saveProfile() {
                this.sending = true
                POST_profile_updateProfile(this.profileForm).then(() => {
                    console.log(this.profileForm)
                    this.$store.dispatch({
                        type: 'updateUser',
                        userInfo: this.profileForm
                    }).then(() => {
                        this.$refs.toast.showToast("保存成功")
                        this.oldProfileForm = JSON.parse(JSON.stringify(this.profileForm))
                    }).catch(err => {
                        this.$refs.toast.showToast("保存失败...")
                        if (this.$store.getters.debug) {
                            console.log("vuex updateUser", err)
                        }
                    })
                }).catch(err => {
                    this.$refs.toast.showToast("保存失败...")
                    if (this.$store.getters.debug) {
                        console.log("profile", err)
                    }
                }).finally(() => {
                    this.sending = false
                })
            },
            changeAvatar() {
            	uni.chooseImage({
            		count: 1,
            		sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            		// sourceType: ['album'], //从相册选择
            		success: (res) => {
                        this.uploading = true
                        for (let imagePath of res.tempFilePaths) {
                            imageUploader(imagePath, callback => {
                                // do something
                            }).then(res => {
                                console.log(res.imageURL)
                                this.profileForm.avatar = this.$store.getters.imageDomain + res.key
                            }).catch(err => {
                                this.$refs.toast.showToast("图片上传失败")
                                if (this.$store.getters.debug) {
                                    console.log("editor uploadImage", err)
                                }
                            }).finally(() => {
                                this.uploading = false
                            })
                        }
            		}
            	})
            },
            viewImage() {
                uni.previewImage({
                	urls: [this.profileForm.avatar],
                	current: this.profileForm.avatar
                });
            },
        },
        computed: {
            isMale() {
                return this.profileForm.gender == 1
            },
            noChanged() {
                if (this.sending) {
                    return true
                }
                return JSON.stringify(this.profileForm) == JSON.stringify(this.oldProfileForm)
            }
        },
	}
</script>

<style lang="less">
switch .wx-switch-input:not([class*="bg-"]),
switch .uni-switch-input:not([class*="bg-"]) {
	background: #e54d42 !important;
}

.my-avatar {
    min-height: 150rpx;
}

.cu-form-group .title {
    min-width: calc(4em + 15px);
}
</style>
