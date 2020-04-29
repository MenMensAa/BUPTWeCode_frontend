<template>
    <view>
        <my-modal ref="modal"></my-modal>
        
        <template v-if="isLogged">
            <view class="me-header flex margin-sm padding-sm shadow bg-white" @click="profileClick">
                <veiw class="cuIcon-write write-icon"></veiw>
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

        <button class="cu-btn block bg-green margin-xl lg" type="" @click="goToResigt">测试: 重新登陆</button>
        <button class="cu-btn block bg-green margin-xl lg" type="" @click="clearStorage">测试: 清除所有缓存</button>
        <button class="cu-btn block bg-green margin-xl lg" type="" @click="goToBlock">测试: 被封禁</button>
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
                    { name: "反馈", icon: "cuIcon-service", dest: "/pages/feedback/feedback" }, 
                    { name: "关于", icon: "cuIcon-info", dest: "/pages/about/about" }
                ],
            }
        },
        methods: {
            clearStorage() {
                this.$store.commit({
                    type: "clearUser"
                })
                this.$store.commit({
                    type: "unsetToken"
                })
                uni.clearStorageSync()
                this.goToResigt()
            },
            goToResigt() {
                uni.redirectTo({
                    url: '/pages/regist/regist?from=me'
                })
            },
            goToBlock() {
                uni.redirectTo({
                    url: '/pages/block/block'
                })
            },
            serviceClick(index) {
                uni.navigateTo({
                    url: this.serviceList[index].dest
                })
            },
            profileClick() {
                uni.navigateTo({
                    url: "/pages/profile/profile"
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
    .write-icon {
        position: absolute;
        right: 2%;
        top: 10%
    }
}
</style>
