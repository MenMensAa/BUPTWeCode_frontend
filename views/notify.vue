<template>
    <view>
        <my-toast ref="toast"></my-toast>
        
        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }" :scroll-top="scrollTop" :scroll-with-animation="true"
                     @scroll="scrollHandler" @scrolltolower="loadMoreHandler">
            
            <view class="cu-list menu-avatar comment solids-top">
            	<view class="cu-item" v-for="(item, index) in notifications" :key="index" @click="notifyClick(item)">
            		<view class="cu-avatar round" @click.stop="userAvatarClick(item)"
            		      :style="[{ 'backgroundImage': 'url(' + item.sender.avatar + ')'}]">
            		</view>
                    <view v-if="!item.visited" class="notify-spot bg-red"></view>
                    <view class="content">
            			<view class="text-grey">
                            <text @click.stop="userAvatarClick(item)">{{item.sender.username}}</text>
                            <text class="text-gray" style="padding: 0rpx 10rpx;" v-if="item.category > 2">回复了你</text>
                            <text class="text-gray" style="padding: 0rpx 10rpx;" v-else>{{item.sender_content}}</text>
                        </view>
            			<view class="text-gray text-content text-df" v-if="item.category > 2">
            				{{item.sender_content}}
            			</view>
                        <view class="text-gray bg-grey light padding-xs radius margin-top-xs  text-sm">
                        	<view>@{{userInfo.username}}: {{item.acceptor_content}}</view>
                        </view>
            			<view class="margin-top-sm flex justify-between">
            				<view class="text-gray text-df">{{item.created | timeFormatter}}</view>
            			</view>
            		</view>
            	</view>
            </view>
            
        <view class="cu-load text-gray" :class="[loadStatus]" @click="loadMoreHandler"></view>
        </scroll-view>
        
        <button class="cu-btn cuIcon reload lg fly-bottom bg-white"
                @click.stop="reloadPageHandler" :disabled="pageLoading">
        	<text class="cuIcon-refresh"  :class="{'cuIconfont-spin': pageLoading}"></text>
        </button>
    </view>
</template>

<script>
    import { GET_notify_mounted, GET_notify_pointedArticle, 
             GET_notify_pointedComment, GET_notify_unnotify } from "../network/functions.js"
    import { stampFormatter } from '../common/utils.js'
    
    export default {
        name: "Notify",
        mounted() {
            this.queryNewData()
        },
        data() {
            return {
                notifications: [],
                newCount: 0,
                
                
                scrollTop: 0,
                oldScrollTop: 0,
                
                pageLoading: false,
                loadStatus: "over",
                queryCDing: false
            }
        },
        methods: {
            queryNewData(reload=false) {
                if (!this.pageLoading) {
                    this.pageLoading = true
                    this.loadStatus = "loading"
                    let queryData = { ...this.queryData }
                    if (reload) {
                        queryData.offset = 0
                    }
                    GET_notify_mounted(queryData).then(res => {
                        this.newCount = res.data.new
                        this.$emit("change", this.newCount)
                        this.loadStatus = "over"
                        if (res.data.notifications.length == 0) {
                            this.queryCDing = true
                            setTimeout(() => {
                                this.queryCDing = false
                            }, 5000)
                        } else {
                            if (reload) {
                                this.notifications = res.data.notifications
                                this.$refs.toast.showToast("刷新成功")
                            } else {
                                this.notifications.push(...res.data.notifications)
                            }
                        }
                    }).catch(err => {
                        if (this.$store.getters.debug) {
                            console.log("notify", err)
                        }
                        this.loadStatus = "erro"
                    }).finally(() => {
                        this.pageLoading = false
                    })
                }
            },
            notifyClick(item) {
                if (!item.visited) {
                    GET_notify_unnotify({
                        notify_id: item.notify_id
                    }).then(() => {
                        item.visited = true
                        this.newCount -= 1
                        this.$emit("change", this.newCount)
                    }).catch(err => {
                        console.log(err)
                    }).finally(() => {
                        if (item.category == 1) {
                            this.navigateToArticle(item.link_id)
                        } else {
                            this.navigateToComment(item.link_id)
                        }
                    })
                } else {
                    if (item.category == 1) {
                        this.navigateToArticle(item.link_id)
                    } else {
                        this.navigateToComment(item.link_id)
                    }
                }
            },
            loadMoreHandler() {
                if (!this.queryCDing) {
                    this.queryNewData()
                }
            },
            scrollHandler(e) {
            	this.oldScrollTop = e.detail.scrollTop
            },
            goToTopHandler() {
            	this.scrollTop = this.oldScrollTop
            	this.$nextTick(function() {
            		this.scrollTop = 0
            	})
            },
            reloadPageHandler() {
            	this.goToTopHandler()
            	this.queryNewData(true)
            },
            navigateToArticle(article_id) {
                GET_notify_pointedArticle({
                    article_id: article_id
                }).then(res => {
                    this.$store.dispatch("setArticle", {
                        article: res.data.article
                    }).then(() => {
                        uni.navigateTo({
                            url: '/pages/article/article'
                        })
                    }).catch(err => {
                        this.$refs.toast.showToast("啊哦...好像出错了")
                        if (this.$store.getters.debug) {
                            console.log("board article Click", err)
                        }
                    })
                }).catch(err => {
                    if (err.code == 404) {
                        this.$refs.toast.showToast("该文章已被删除...")
                    } else {
                        if (this.$store.getters.debug) {
                            console.log("notify navToArticle", err)
                        }
                    }
                })
            },
            navigateToComment(comment_id) {
                GET_notify_pointedComment({
                    comment_id: comment_id
                }).then(res => {
                    this.$store.dispatch("setComment", {
                        comment: res.data.comment
                    }).then(() => {
                        uni.navigateTo({
                            url: '/pages/comment/comment?notify=true&host=true&article_id=' + res.data.article_id
                        })
                    }).catch(err => {
                        if (this.$store.getters.debug) {
                            console.log("err in article")
                        }
                        this.$refs.toast.showToast("好像出了点小错误...")
                    })
                }).catch(err => {
                    if (err.code == 404) {
                        this.$refs.toast.showToast("该评论已被删除...")
                    } else {
                        if (this.$store.getters.debug) {
                            console.log("notify navToComment", err)
                        }
                    }
                })
            },
            userAvatarClick(item) {
                uni.navigateTo({
                    url: "/pages/zoom/zoom?user_id=" + item.sender.sender_id
                })
            }
        },
        computed: {
            scrollViewHeight() {
                let height = this.$store.getters.windowHeight - this.$store.getters.fillerHeight
                return height + 'px'
            },
            queryData() {
                return {
                    offset: this.notifications.length,
                    limit: 10
                }
            },
            userInfo() {
                return this.$store.getters.userInfo
            },
        },
        filters: {
            timeFormatter(val) {
                return stampFormatter(val, "Y-m-d")
            }
        }
    }
</script>

<style>
.notify-spot {
    position: absolute;
    top: 10%;
    height: 16rpx;
    width: 16rpx;
    border-radius: 16rpx;
}

.fly-bottom {
    position: fixed;
    right: 7%;
    z-index: 1;
    box-shadow: 0rpx 0rpx 10rpx rgba(0, 0, 0, 0.2);
}

.reload {
    bottom: 10%;
}
</style>
