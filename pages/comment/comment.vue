<template>
	<view v-if="pageLoaded">
        <my-nav bgColor="bg-gradual-blue" :isBack="true"
                   :autoBack="false" @backClick="backClickHandler" ref="nav">
            <block slot="backText">返回</block>
        	<block slot="content">第{{commentFloor}}楼的评论</block>
        </my-nav>
        
        <my-menu ref="menu"></my-menu>
        <my-toast ref="toast"></my-toast>
        <my-dialog ref="dialog"></my-dialog>
		
        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }"
                     @scrolltolower="loadMoreHandler" style="width: 100%;" show-scrollbar>
            
            <view class="cu-list menu-avatar comment solids-top" @click="changeTargetComment(comment)">
            	<view class="cu-item">
            		<view class="cu-avatar round"
            		      :style="[{ 'backgroundImage': 'url(' + comment.author.avatar + ')'}]">
            		</view>
                    <view class="content">
            			<view class="text-grey">{{comment.author.username}}</view>
            			<view class="text-gray text-content text-df">
            				{{comment.content}}
            			</view>
                        <view class="grid flex-sub padding-lr col-1">
                            <image v-for="(img, idx) in comment.images" :key="idx" class="my-image margin-tb-sm"
                                   :src="img" mode="widthFix" @click.stop="viewImage(comment.images, img)"></image>
                        </view>
            			<view class="margin-top-sm flex justify-between">
            				<view class="text-gray text-df">{{comment.created | timeFormatter}}</view>
            				<view>
            					<text class="cuIcon-more text-gray" @click.stop="commentOperate(item)"></text>
            				</view>
            			</view>
            		</view>
            	</view>
            </view>
            
            <view class="cu-bar bg-white margin-top">
            	<view class="action">
            		<text class="cuIcon-title text-green"></text>
            		<text>回复区</text>
            	</view>
            </view>
            
            <view class="cu-list menu-avatar comment solids-top">
            	<view class="cu-item" v-for="(item, index) in sub_comments" :key="index" @click="changeTargetComment(item)">
            		<view class="cu-avatar round"
            		      :style="[{ 'backgroundImage': 'url(' + item.author.avatar + ')'}]">
            		</view>
                    <view class="content">
            			<view class="text-grey">
                            {{item.author.username}}
                            <text class="text-gray" style="padding: 0rpx 10rpx;">回复给</text>
                            <view class="cu-avatar round sm margin-lr-xs"
                                  :style="[{ 'backgroundImage': 'url(' + item.acceptor.avatar + ')'}]">
                            </view>
                            {{item.acceptor.username}}
                        </view>
            			<view class="text-gray text-content text-df">
            				{{item.content}}
            			</view>
            			<view class="margin-top-sm flex justify-between">
            				<view class="text-gray text-df">{{item.created | timeFormatter}}</view>
            				<view>
            					<text class="cuIcon-more text-gray" @click.stop="subCommentOperate(item, index)"></text>
            				</view>
            			</view>
            		</view>
            	</view>
            </view>
            
            <view class="cu-load text-gray" :class="[loadStatus]" @click="loadMoreHandler"></view>
        </scroll-view>
        
        <view class="input-bar my-shadow" v-show="!textAreaShow">
            <view class="cu-bar input input-bar-header">
                <view class="cu-avatar round"
                      :style="[{ 'backgroundImage': 'url(' + userInfo.avatar + ')'}]">
                </view>
            	<input :adjust-position="false" class="input-background" :placeholder="inputTextDisplay" placeholder-class="text-gray"
                       maxlength="300" :disabled="true" @click="textAreaShow = true"></input>
            	<button class="cu-btn bg-green shadow-blur" :disabled="sendBtnLoading" @click="subCommentBtnClick">发送</button>
            </view>
        </view>
        
        
        
        <view class="my-textarea bg-white my-shadow" v-show="textAreaShow">
            <view class="textarea-container align-center">
                <view class="textarea-input">
                    <form>
                        <view class="cu-form-group input-background">
                        	<textarea maxlength="500" v-model="subCommentContent" cursor-spacing="50"
                                      :focus="textAreaShow" @blur="textAreaShow = false" :fixed="true"/>
                        </view>
                    </form>
                </view>
                <view class="textarea-button">
                    <button class="cu-btn bg-green shadow-blur" :disabled="sendBtnLoading" @click="subCommentBtnClick">发送</button>
                </view>
            </view>
        </view>
        <view :style="{ height: inputBarHeaderHeight + 'px'}"></view>
	</view>
</template>

<script>
    import { stampFormatter } from '../../common/utils.js'
    import { GET_comment_mounted, POST_comment_subCommentBtnClick, GET_comment_deleteSubComment } from '../../network/functions.js'
    
	export default {
        onLoad(options) {
            console.log(options)
            if (this.$store.getters.hasComment) {
                this.comment = this.$store.getters.comment
                console.log(this.comment)
                this.targetComment = this.$store.getters.comment
                this.commentFloor = options.floor
                this.isHoster = options.hoster == "true"
                this.pageLoaded = true
                this.queryNewSubComment()
            } else {
                console.log("no comment in Vuex")
            }
        },
        onReady() {
            let inputBarHeader = uni.createSelectorQuery().select(".input-bar-header")
            inputBarHeader.boundingClientRect(data => {
                this.inputBarHeaderHeight = data.height
            }).exec()
        },
		data() {
			return {
                pageLoaded: false,
				inputBarHeaderHeight: 0,
                isHoster: false,
                
                comment: {},
                commentFloor: 0,
                targetComment: {},
                subCommentContent: "",
                textAreaShow: false,
                sendBtnLoading: false,
                
                sub_comments: [],
                sendSubCommentTime: 0,
                
                pageSize: 10,
                curPage: 0,
                total: -1,
                pageLoading: false,
                loadStatus: "over",
                queryCDing: false
			};
		},
        methods: {
            backClickHandler() {
                this.$store.dispatch({
                    type: "clearComment"
                }).then(() => {
                    this.$refs.nav.backPage({
                        floor: this.commentFloor,
                        times: this.sendSubCommentTime
                    })
                }).catch(err => {
                    console.log("err in comment backpage")
                })
                
            },
            loadMoreHandler() {
                if (!this.queryCDing) {
                    this.queryNewSubComment()
                }
            },
            changeTargetComment(comment) {
                this.targetComment = comment
                this.textAreaShow = true
            },
            subCommentBtnClick() {
                if (this.subCommentContent.length == 0) {
                    this.$refs.toast.showToast("回复内容不能为空")
                } else {
                    this.sendBtnLoading = true
                    POST_comment_subCommentBtnClick({
                        comment_id: this.comment.comment_id,
                        acceptor_id: this.targetComment.author.author_id,
                        content: this.subCommentContent
                    }).then(res => {
                        this.$refs.toast.showToast("发布评论成功")
                        this.subCommentContent = ""
                        this.sendSubCommentTime += 1
                    }).catch(err => {
                        if (this.$store.getters.debug) {
                            console.log("subCommentBtnClick", err)
                        }
                        this.$refs.toast.showToast("啊啦...评论失败了呢")
                    }).finally(() => {
                        this.sendBtnLoading = false
                    })
                }
            },
            viewImage(urls, img) {
                uni.previewImage({
                	urls: urls,
                	current: img
                });
            },
            commentOperate() {
                if (this.comment.author.author_id == this.userInfo.uid) {
                    this.$refs.menu.showMenu([3]).then(() => {
                        this.$refs.dialog.showDialog({
                            content: "是否删除该评论?"
                        }).then(() => {
                            this.deleteComment()
                        }).catch(() => {})
                    }).catch(() => {})
                } else if (this.isHoster) {
                    this.$refs.menu.showMenu([2, 3]).then(res => {
                        if (res == 0) {
                            console.log("report")
                        } else {
                            this.$refs.dialog.showDialog({
                                content: "是否删除该评论?"
                            }).then(() => {
                                this.deleteComment()
                            }).catch(() => {})
                        }
                    }).catch(() => {})
                } else {
                    this.$refs.menu.showMenu([2]).then(() => {
                        console.log("report")
                    }).catch(() => {})
                }
            },
            subCommentOperate(item, index) {
                if (item.author.author_id == this.userInfo.uid) {
                    this.$refs.menu.showMenu([3]).then(() => {
                        this.deleteSubComment(item, index)
                    }).catch(() => {})
                } else if (this.isHoster) {
                    this.$refs.menu.showMenu([2, 3]).then(res => {
                        if (res == 0) {
                            console.log("report")
                        } else {
                            this.deleteSubComment(item, index)
                        }
                    }).catch(() => {})
                } else {
                    this.$refs.menu.showMenu([2]).then(() => {
                        console.log("report")
                    }).catch(() => {})
                }
            },
            deleteSubComment(item, index) {
                this.$refs.dialog.showDialog({
                    content: "是否删除该评论?"
                }).then(() => {
                    GET_comment_deleteSubComment({
                        sub_comment_id: item.sub_comment_id
                    }).then(res => {
                        this.$refs.toast.showToast("删除评论成功")
                        this.sub_comments.splice(index, 1)
                        this.sendSubCommentTime -= 1
                    }).catch(err => {
                        this.$refs.toast.showToast("删除评论失败...")
                        if (this.$store.getters.debug) {
                            console.log("comment deleteSubComment", err)
                        }
                    })
                }).catch(() => {})
            },
            deleteComment(){
                this.$refs.nav.backPage({
                    delete: true,
                    floor: this.commentFloor
                })
            },
            queryNewSubComment() {
                this.pageLoading = true
                this.loadStatus = "loading"
                GET_comment_mounted(this.queryData).then(res => {
                    console.log(res.data.sub_comments)
                    this.total = res.data.total
                    if (res.data.sub_comments.length == 0) {
                        this.queryCDing = true
                        setTimeout(() => {
                            this.queryCDing = false
                        }, 5000)
                    } else {
                        this.sub_comments.push(...res.data.sub_comments)
                        this.curPage += 1
                    }
                    console.log(this.sub_comments)
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("article mounted", err)
                    }
                    this.loadStatus = "error"
                    this.$refs.toast.showToast("评论加载出错...")
                }).finally(() => {
                    this.pageLoading = false
                    this.loadStatus = "over"
                })
            }
        },
        computed: {
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
            },
            userInfo() {
                return this.$store.getters.userInfo
            },
            inputTextDisplay() {
                if (this.pageLoaded) {
                    return "回复给 " + this.targetComment.author.username + "："
                } else {
                    return "加载中..."
                }
            },
            queryData() {
                if (this.pageLoaded) {
                    let offset = this.curPage * this.pageSize
                    let limit = this.pageSize
                    if (this.total != -1 && offset >= this.total) {
                        return {
                            offset: this.total,
                            limit: limit,
                            comment_id: this.comment.comment_id
                        }
                    } else {
                        return {
                            offset: offset,
                            limit: limit,
                            comment_id: this.comment.comment_id
                        }
                    }
                } else {
                    return {}
                }
            },
        },
        filters: {
            timeFormatter(val) {
                return stampFormatter(val, "Y-m-d")
            }
        }
	}
</script>

<style lang="less">
.my-image {
    width: 100%;
}

.input-bar {
    position: fixed;
    bottom: 0;
    width: 100%;
}

.my-textarea {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 170rpx;
    z-index: 10;
    .textarea-container {
        height: 100%;
        display: flex;
        .textarea-input {
            flex: 4;
            margin: 20rpx;
            textarea {
                margin: 0;
            }
        }
        .textarea-button {
            flex: 1;
            .cu-btn {
                margin: 0 auto;
            }
        }
    }
    
}

.my-shadow {
    box-shadow: 0rpx 0rpx 15rpx rgba(0, 0, 0, 0.15);
}
.input-background {
    border-radius: 10rpx;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 5rpx 10rpx;
}
</style>
