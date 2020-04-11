<template>
    <view>
        <my-toast ref="toast"></my-toast>
        
        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }"
                     @scrolltolower="loadMoreHandler" style="width: 100%;" show-scrollbar>
            
            <view class="cu-list menu-avatar comment solids-top">
            	<view class="cu-item" v-for="(item, index) in notifications" :key="index" @click="notifyClick(item)">
            		<view class="cu-avatar round"
            		      :style="[{ 'backgroundImage': 'url(' + item.sender.avatar + ')'}]">
            		</view>
                    <view class="content">
            			<view class="text-grey">
                            {{item.sender.username}}
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
    </view>
</template>

<script>
    import { GET_notify_mounted, GET_notify_pointedArticle, GET_notify_pointedComment } from "../network/functions.js"
    import { stampFormatter } from '../common/utils.js'
    
    export default {
        name: "Notify",
        mounted() {
            this.queryNewData()
        },
        data() {
            return {
                notifications: [],
                
                pageSize: 10,
                curPage: 0,
                total: -1,
                
                pageLoading: false,
                loadStatus: "loading",
                queryCDing: false
            }
        },
        methods: {
            queryNewData() {
                this.pageLoading = true
                this.loadStatus = "loading"
                GET_notify_mounted(this.queryData).then(res => {
                    console.log(res.data)
                    this.total = res.data.total
                    this.loadStatus = "over"
                    if (res.data.notifications.length == 0) {
                        this.queryCDing = true
                        setTimeout(() => {
                            this.queryCDing = false
                        }, 5000)
                    } else {
                        this.notifications.push(...res.data.notifications)
                        this.curPage += 1
                    }
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("notify", err)
                    }
                    this.loadStatus = "error"
                }).finally(() => {
                    this.pageLoading = false
                })
            },
            notifyClick(item) {
                if (item.category == 1) {
                    this.navigateToArticle(item.link_id)
                } else {
                    this.navigateToComment(item.link_id)
                }
            },
            loadMoreHandler() {
                if (!this.queryCDing) {
                    this.queryNewData()
                }
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
            }
        },
        computed: {
            scrollViewHeight() {
                let height = this.$store.getters.windowHeight - this.$store.getters.fillerHeight
                return height + 'px'
            },
            queryData() {
                let offset = this.curPage * this.pageSize
                let limit = this.pageSize
                return {
                    offset: offset,
                    limit: limit,
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
</style>
