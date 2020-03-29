<template>
	<view v-if="pageLoaded">
		<cu-custom bgColor="bg-gradual-blue" :isBack="true"
		           :autoBack="false" @backClick="backClickHandler" ref="nav">
		    <block slot="backText">返回</block>
			<block slot="content">{{boardName}}</block>
		</cu-custom>
        
        <my-toast ref="toast"></my-toast>
        <my-dialog ref="dialog"></my-dialog>
        
        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }"
                     @scrolltolower="loadMoreHandler" style="width: 100%;" show-scrollbar>
                     
            <view class="my-article">
                <button class="cu-btn bg-green shadow follow-btn">关注</button>
                <view class="cu-card dynamic no-card">
                	<view class="cu-item shadow">
                		<view class="cu-list menu-avatar">
                			<view class="cu-item">
                                <view class="cu-avatar round lg"
                                      :style="[{ 'backgroundImage': 'url(' + article.author.avatar + ')'}]">
                                      <view class="cu-tag badge" :class=" article.author.gender%2 == 0 ? 'cuIcon-female bg-pink': 'cuIcon-male bg-blue' "></view>
                                </view>
                				<view class="content flex-sub">
                					<view>{{article.author.username}}</view>
                					<view class="text-gray text-sm flex justify-between">
                						{{article.created | timeFormatter}}
                					</view>
                				</view>
                			</view>
                		</view>
                		<view class="my-container">
                			<view class="my-title margin-tb-sm">{{article.title}}</view>
                			<view class="my-content">{{article.content}}</view>
                		</view>
                		<view class="grid flex-sub padding-lr col-1">
                            <image v-for="(img, index) in article.images" :key="index" class="my-image margin-tb-sm"
                                   :src="img" mode="widthFix" @click="viewImage(article.images, img)"></image>
                		</view>
                        <article-bar @operate="operateHandler"></article-bar>
                    </view>
                </view>
                
                <view class="cu-bar bg-white margin-top">
                	<view class="action">
                		<text class="cuIcon-title text-green"></text>
                		<text>评论区</text>
                	</view>
                </view>
                
                <view class="cu-list menu-avatar comment solids-top">
                	<view class="cu-item" v-for="(item, index) in comments" :key="index">
                		<view class="cu-avatar round"
                		      :style="[{ 'backgroundImage': 'url(' + item.author.avatar + ')'}]">
                		</view>
                        <view class="content">
                			<view class="text-grey">{{item.author.username}}</view>
                			<view class="text-gray text-content text-df">
                				{{item.content}}
                			</view>
                            <view class="grid flex-sub padding-lr col-1">
                                <image v-for="(img, idx) in item.images" :key="idx" class="my-image margin-tb-sm"
                                       :src="img" mode="widthFix" @click="viewImage(item.images, img)"></image>
                            </view>
                			<view class="bg-grey padding-sm radius margin-top-sm  text-sm">
                				<view class="flex">
                					<view>凯尔：</view>
                					<view class="flex-sub">妹妹，你在帮他们给黑暗找借口吗?</view>
                				</view>
                			</view>
                			<view class="margin-top-sm flex justify-between">
                				<view class="text-gray text-df">{{index+1}}楼 {{item.created | timeFormatter}}</view>
                				<view>
                					<text class="cuIcon-more text-gray"></text>
                				</view>
                			</view>
                		</view>
                	</view>
                </view>
                
            </view>

            <view class="cu-load text-gray" :class="[loadStatus]"></view>
        </scroll-view>
        
        
        <view class="input-bar my-shadow" :animation="animationData" v-show="!textAreaShow"
              :style="{transform: 'translateY('+(inputBarHeaderHeight-inputBarheight)+'px)'}">
            <view class="cu-bar input input-bar-header">
                <view class="cu-avatar round"
                      :style="[{ 'backgroundImage': 'url(' + userAvatar + ')'}]">
                </view>
            	<view class="action" @click="commentAddIconHandler">
            		<text class="cuIcon-roundaddfill text-grey"></text>
            	</view>
            	<input :adjust-position="false" class="input-background" :placeholder="inputTextDisplay" placeholder-class="text-gray"
                       maxlength="300" :disabled="true" @click="textAreaShow = true"></input>
                <view class="action">
                	<text class="cuIcon-favor text-grey"></text>
                </view>
            	<button class="cu-btn bg-green shadow-blur" :disabled="sendBtnLoading" @click="commentBtnClick">发送</button>
            </view>
            
            <view class="grid col-4 grid-square flex-sub bg-white padding-sm">
                <view class="bg-img" v-for="(item,index) in tmpImageList" :key="index" @click="viewImage(tmpImageList, item)">
                    <image :src="item" mode="aspectFill"></image>
                    <view class="cu-tag bg-red" @click.stop="delImageHandler(index)">
                        <text class='cuIcon-close'></text>
                    </view>
                </view>
                <view class="solids" @click="chooseImage" v-if="tmpImageList.length < 4">
                    <text class='cuIcon-cameraadd'></text>
                </view>
            </view>
            
        </view>
        
        
        
        <view class="my-textarea bg-white my-shadow" v-show="textAreaShow">
            <view class="textarea-container align-center">
                <view class="textarea-input">
                    <form>
                        <view class="cu-form-group input-background">
                        	<textarea maxlength="500" v-model="commentForm.content" cursor-spacing="50"
                                      :focus="textAreaShow" @blur="textAreaShow = false" :fixed="true"/>
                        </view>
                    </form>
                </view>
                <view class="textarea-button">
                    <button class="cu-btn bg-green shadow-blur" :disabled="sendBtnLoading" @click="commentBtnClick">发送</button>
                </view>
            </view>
        </view>
        <view :style="{ height: inputBarHeaderHeight + 'px'}"></view>
	</view>
</template>

<script>
    import { stampFormatter } from '../../common/utils.js'
    import { imageUploader } from '../../common/image_uploader.js'
    import ArticleBar from '../../components/article_bar.vue'
    import { POST_article_commentBtnClick, GET_article_mounted } from '../../network/functions.js'
    
	export default {
        components: {
            "article-bar": ArticleBar,
        },
        onLoad(options) {
            this.boardName = options.board_name
            if (this.$store.getters.hasArticle) {
                this.article = this.$store.getters.article
                this.pageLoaded = true
                console.log(this.article)
                this.queryNewComment()
            } else {
                if (this.$store.getters.debug) {
                    console.log("err no article in vuex")
                }
            }
            this.animation = uni.createAnimation({
                duration: 500,
                timingFunction: 'ease'
            })
        },
        onReady() {
            let p1 = new Promise((resolve, reject) => {
                let inputBar = uni.createSelectorQuery().select(".input-bar")
                inputBar.boundingClientRect(data => {
                    this.inputBarHeight = data.height
                }).exec(() => {
                    resolve()
                })
            })
            let p2 = new Promise((resolve, reject) => {
                let inputBarHeader = uni.createSelectorQuery().select(".input-bar-header")
                inputBarHeader.boundingClientRect(data => {
                    this.inputBarHeaderHeight = data.height
                }).exec(() => {
                    resolve()
                })
            })
            
            Promise.all([p1, p2]).then(() => {
                let animation = uni.createAnimation({
                    duration: 0,
                    timingFunction: 'linear'
                })
                let height = this.inputBarHeight - this.inputBarHeaderHeight
                animation.translateY(height).step()
                this.animationData = animation.export()
            })
            
        },
		data() {
			return {
                pageLoaded: false,
                boardName: "看帖",
				article: {},
                
                commentForm: {
                    content: "",
                    images: []
                },
                tmpImageList: [],
                textAreaShow: false,
                sendBtnLoading: false,
                
                pageSize: 10,
                curPage: 0,
                total: -1,
                pageLoading: false,
                loadStatus: "loading",
                
                comments: [],
                queryCommentCDing: false,
                
                animation: {},
                animationData: {},
                inputBarHeight: 0,
                inputBarHeaderHeight: 0,
                isDrug: false
			}
		},
		methods: {
			backClickHandler() {
                this.$refs.nav.backPage()
            },
            slideToBottom() {
                let height = this.inputBarHeight - this.inputBarHeaderHeight
                this.animation.translateY(height).step()
                this.animationData = this.animation.export()
            },
            slideToTop() {
                this.animation.translateY(0).step()
                this.animationData = this.animation.export()
            },
            commentAddIconHandler() {
                if (this.isDrug) {
                    this.slideToBottom()
                } else {
                    this.slideToTop()
                }
                this.isDrug = !this.isDrug
            },
            viewImage(urls, img) {
                uni.previewImage({
                	urls: urls,
                	current: img
                });
            },
            chooseImage() {
            	uni.chooseImage({
            		count: 4 - this.tmpImageList.length, //默认9
            		sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            		sourceType: ['album'], //从相册选择
            		success: (res) => {
            			if (this.tmpImageList.length != 0) {
            				this.tmpImageList = this.tmpImageList.concat(res.tempFilePaths)
            			} else {
            				this.tmpImageList = res.tempFilePaths
            			}
                        for (let imagePath of res.tempFilePaths) {
                            imageUploader(imagePath, callback => {
                                // do something
                            }).then(res => {
                                this.$refs.toast.showToast("图片上传成功")
                                console.log(res.imageURL)
                                this.commentForm.images.push(this.$store.getters.imageDomain+res.key)
                            }).catch(err => {
                                this.$refs.toast.showToast("图片上传失败")
                                if (this.$store.getters.debug) {
                                    console.log("editor uploadImage", err)
                                }
                            })
                        }
            		}
            	});
            },
            delImageHandler(index) {
                this.$refs.dialog.showDialog({
                    title: "提示",
                    content: "是否删除这张图片?",
                    cancelText: "手滑了"
                }).then(() => {
                    this.commentForm.images.splice(index, 1)
                    this.tmpImageList.splice(index, 1)
                    this.$refs.toast.showToast("删除成功")
                }).catch(() => {
                    this.$refs.toast.showToast("取消删除")
                })
            },
            operateHandler() {
                console.log("operate")
            },
            loadMoreHandler() {
                if (!this.queryCommentCDing) {
                    this.queryNewComment()
                }
            },
            commentBtnClick() {
                console.log("click")
                if (this.commentForm.content.length == 0 && this.commentForm.images.length == 0) {
                    this.$refs.toast.showToast("评论内容不能为空!")
                } else if (this.commentForm.images.length != this.tmpImageList.length) {
                    this.$refs.toast.showToast("图片上传中...请稍后再试")
                } else {
                    this.sendBtnLoading = true
                    console.log(this.commentForm)
                    if (this.isDrug) {
                        this.slideToBottom()
                        this.isDrug = false
                    }
                    POST_article_commentBtnClick(this.article.id, this.commentForm).then(res => {
                        console.log(res)
                        this.$refs.toast.showToast("评论成功!")
                        this.commentForm = {
                            content: "",
                            images: []
                        }
                        this.tmpImageList = []
                    }).catch(err => {
                        if (this.$store.getters.debug) {
                            console.log("commentBtnClick", err)
                        }
                        this.$refs.toast.showToast("啊啦...评论失败了呢")
                    }).finally(() => {
                        this.sendBtnLoading = false
                    })
                }
            },
            queryNewComment() {
                this.pageLoading = true
                this.loadStatus = "loading"
                GET_article_mounted(this.queryData).then(res => {
                    this.total = res.data.total
                    if (res.data.comments.length == 0) {
                        this.loadStatus = "over"
                        this.queryCommentCDing = true
                        setTimeout(() => {
                            this.queryCommentCDing = false
                        }, 5000)
                    } else {
                        this.comments.push(...res.data.comments)
                        this.curPage += 1
                    }
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("article mounted", err)
                    }
                    this.loadStatus = "error"
                    this.$refs.toast.showToast("评论加载出错...")
                }).finally(() => {
                    this.pageLoading = false
                })
            }
		},
        computed: {
            userAvatar() {
                return this.$store.getters.userInfo.avatar
            },
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
            },
            inputTextDisplay() {
                if (this.commentForm.content.length > 0) {
                    return " [草稿待发送] "
                } else {
                    return "我有一个Dark胆的想法..."
                }
            },
            noMoreComments() {
                return this.comments.length == this.total
            },
            queryData() {
                if (this.pageLoaded) {
                    let offset = this.curPage * this.pageSize
                    let limit = this.pageSize
                    if (this.total != -1 && offset >= this.total) {
                        return {
                            offset: this.total,
                            limit: limit,
                            article_id: this.article.id
                        }
                    } else {
                        return {
                            offset: offset,
                            limit: limit,
                            article_id: this.article.id
                        }
                    }
                } else {
                    return {}
                }
            },
            fillerHeight() {
                return this.inputBarHeaderHeight + 'px'
            }
        },
        filters: {
            timeFormatter(val) {
                return stampFormatter(val, "Y-m-d")
            }
        }
	}
</script>

<style>
.cu-list.menu-avatar>.cu-item:after, .cu-list.menu>.cu-item:after {
    /* border-bottom: 0rpx; */
}
.my-image {
    width: 100%;
}
.my-container {
    padding: 0rpx 30rpx 0rpx 30rpx;
}
.my-title {
    font-size: 40rpx;
}
.my-article {
    position: relative;
}
.follow-btn {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    z-index: 2;
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
}
.textarea-container {
    height: 100%;
    display: flex;
}
.textarea-input {
    flex: 4;
    margin: 20rpx;
}
.cu-form-group textarea {
    margin: 0;
}
.textarea-button {
    flex: 1;
}
.textarea-button .cu-btn {
    margin: 0 auto;
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
