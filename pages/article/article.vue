<template>
	<view v-if="pageLoaded">
		<my-nav bgColor="bg-gradual-blue" :isBack="true" ref="nav">
		    <block slot="backText">返回</block>
			<block slot="content">{{boardName}}</block>
		</my-nav>
        
        <my-toast ref="toast"></my-toast>
        <my-dialog ref="dialog"></my-dialog>
        <my-menu ref="menu"></my-menu>
        <my-selector ref="selector"></my-selector>
        
        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }"
                     @scrolltolower="loadMoreHandler" style="width: 100%;" show-scrollbar>
                     
            <view class="my-article">
                <button class="cu-btn follow-btn round line-red" v-if="article.quality == 1">
                    <text class="cuIcon-selection"></text>精品贴
                </button>
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
                		<view class="article-container">
                			<view class="article-title margin-tb-sm">{{article.title}}</view>
                			<view>{{article.content}}</view>
                		</view>
                		<view class="grid flex-sub padding-lr col-1">
                            <image v-for="(img, index) in article.images" :key="index" class="my-image margin-tb-sm"
                                   :src="img" mode="widthFix" @click="viewImage(article.images, img)"></image>
                		</view>
                        
                        <view class="flex flex-wrap margin-tb" v-if="article.tags.length > 0">
                            <view class="action">
                            	<button class="cu-btn cuIcon bg-white">
                            		<text class="cuIcon-tag text-grey"></text>
                            	</button>
                            </view>
                            <view class="padding-xs" v-for="(tag, idx) in article.tags" :key="idx">
                                <view class="cu-tag light round" :class="['bg-'+tagColorHandler(idx)]" @click.stop="tagClick(tag)">
                                    {{tag.content}}
                                </view>
                            </view>
                        </view>
                        
                        <article-bar @operate="articleOperate" @like="likeArticle" :comments.sync="article.comments"
                                     :likes.sync="article.likes" :views="article.views" :liked.sync="article.liked"></article-bar>
                    </view>
                </view>
                
                <view class="cu-bar bg-white margin-top">
                	<view class="action">
                		<text class="cuIcon-title text-green"></text>
                		<text>评论区</text>
                	</view>
                </view>
                
                <view class="cu-list menu-avatar comment solids-top">
                	<view class="cu-item" v-for="(item, index) in comments" :key="index" @click="viewCommentClick(item, index)">
                		<view class="cu-avatar round"
                		      :style="[{ 'backgroundImage': 'url(' + item.author.avatar + ')'}]">
                		</view>
                        <view class="comment-rate action text-grey" @click.stop="rateComment(item, index)">
                            {{item.rates}} <text class="cuIcon-appreciatefill padding-lr-xs text-red" v-if="item.rated"></text>
                            <text class="cuIcon-appreciate padding-lr-xs" v-else></text>
                        </view>
                        <view class="content">
                			<view class="text-grey">{{item.author.username}}</view>
                			<view class="text-gray text-content text-df">
                				{{item.content}}
                			</view>
                            <view class="grid flex-sub padding-lr col-1">
                                <image v-for="(img, idx) in item.images" :key="idx" class="my-image margin-tb-sm"
                                       :src="img" mode="widthFix" @click.stop="viewImage(item.images, img)"></image>
                            </view>
                			<view class="text-blue bg-blue light padding-xs radius margin-top-xs  text-sm" v-if="item.sub_comments != 0">
                				<view>查看{{item.sub_comments}}条回复►</view>
                			</view>
                			<view class="margin-top-sm flex justify-between">
                				<view class="text-gray text-df">{{index+1}}楼 {{item.created | timeFormatter}}</view>
                				<view>
                					<text class="cuIcon-more text-gray" @click.stop="commentOperate(item, index)"></text>
                				</view>
                			</view>
                            <view class="my-signatrue">
                                {{'"' + item.author.signature + '"'}}
                            </view>
                		</view>
                	</view>
                </view>
                
            </view>

            <view class="cu-load text-gray" :class="[loadStatus]" @click="loadMoreHandler"></view>
        </scroll-view>
        
        
        <view class="input-bar my-shadow" :animation="animationData" v-show="!textAreaShow"
              :style="{ 'opacity': inputBarOpacity }">
            <view class="cu-bar input input-bar-header">
                <view class="cu-avatar round"
                      :style="[{ 'backgroundImage': 'url(' + userInfo.avatar + ')'}]">
                </view>
            	<view class="action" @click="commentAddIconHandler">
            		<text class="cuIcon-roundaddfill text-grey"></text>
            	</view>
            	<input :adjust-position="false" class="input-background" :placeholder="inputTextDisplay" placeholder-class="text-gray"
                       maxlength="300" :disabled="true" @click="textAreaShow = true"></input>
                <view class="action" @click="likeArticle">
                	<text class="cuIcon-likefill text-red" v-if="article.liked"></text>
                	<text class="cuIcon-like text-grey" v-else></text>
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
    import { POST_article_commentBtnClick, GET_article_mounted, GET_article_rateComment, POST_report,
            GET_article_likeArticle, GET_article_deleteComment, GET_article_delBtnClick, GET_article_quality } from '../../network/functions.js'
    
	export default {
        components: {
            "article-bar": ArticleBar,
        },
        onLoad(options) {
            if (this.$store.getters.hasArticle) {
                this.articleIndex = options.index
                this.article = this.$store.getters.article
                this.boardName = this.article.board.name
                this.pageLoaded = true
                this.queryNewComment()
                this.animation = uni.createAnimation({
                    duration: 200,
                    timingFunction: 'ease'
                })
                this.$store.dispatch({
                    type: 'addArticleHistory',
                    article: this.article,
                }).then(() => {}).catch(err => {
                    console.log("err in article backpage", err)
                })
            } else {
                console.log("err no article in vuex")
            }
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
                this.slideToBottom()
                setTimeout(() => {
                    this.inputBarOpacity = 1
                }, 250)
            })
            
        },
        onShow() {
            if (this.$store.getters.hasNewMsg) {
                let message = this.$store.getters.msg
                if (!!message.delete) {
                    this.comments.splice(index, 1)
                    this.article.comments -= 1
                    this.$store.dispatch({
                        type: 'clearMessage'
                    })
                }
                if (!!message.toast) {
                    this.$refs.toast.showToast(message.toast)
                }
            }
        },
		data() {
			return {
                pageLoaded: false,
                boardName: "看帖",
				article: {},
                articleIndex: 0,
                
                commentForm: {
                    content: "",
                    images: []
                },
                tmpImageList: [],
                textAreaShow: false,
                sendBtnLoading: false,
                likeBtnLoading: false,
                rateBtnLoading: false,
                
                pageLoading: false,
                loadStatus: "loading",
                
                comments: [],
                queryCommentCDing: false,
                
                animation: {},
                animationData: {},
                inputBarHeight: 0,
                inputBarHeaderHeight: 0,
                isDrug: false,
                inputBarOpacity: 0
			}
		},
		methods: {
            tagColorHandler(index) {
                return this.ColorList[index].name
            },
            tagClick(tag) {
                this.$store.dispatch({
                    type: "setTag",
                    tag: tag
                }).then(() => {
                    uni.navigateTo({
                        url: "/pages/tag/tag"
                    })
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("home tagClick", err)
                    }
                })
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
            likeArticle() {
                if (!this.likeBtnLoading) {
                    let data = {
                        article_id: this.article.article_id
                    }
                    let count = this.article.liked ? -1 : 1
                    this.article.liked = !this.article.liked
                    this.article.likes += count
                    this.likeBtnLoading = true
                    GET_article_likeArticle(data).then(() => {
                        if (this.article.liked) {
                            this.$refs.toast.showToast("谢谢你的赞~")
                        } else {
                            this.$refs.toast.showToast("取消赞成功")
                        }
                    }).catch(err => {
                        if (err.code == 404) {
                            this.$refs.toast.showToast("该文章已被删除...")
                        } else {
                            if (this.$store.getters.debug) {
                                console.log("article favor", err)
                            }
                            this.$refs.toast.showToast("出错了...")
                        }
                        this.article.liked = !this.article.liked
                        this.article.likes -= count
                    }).finally(() => {
                        this.likeBtnLoading = false
                    })
                }
            },
            qualityArticle() {
                if (this.isOperator) {
                    GET_article_quality({
                        article_id: this.article.article_id
                    }).then(() => {
                        this.article.quality = 1 - this.article.quality
                        let toast = this.article.quality == 1 ? "加精成功":"取消加精成功"
                        this.$refs.toast.showToast(toast)
                    }).catch(err => {
                        this.$refs.toast.showToast("加精失败...")
                        if (this.$store.getters.debug) {
                            console.log("quality Article")
                        }
                    })
                }
            },
            rateComment(item, index) {
                if (!this.rateBtnLoading) {
                    let data = {
                        comment_id: item.comment_id
                    }
                    let count = item.rated ? -1 : 1
                    item.rated = !item.rated
                    item.rates += count
                    this.rateBtnLoading = true
                    GET_article_rateComment(data).then(() => {
                        
                    }).catch(err => {
                        item.rated = !item.rated
                        item.rates -= count
                        if (err.code == 404) {
                            this.$refs.toast.showToast("该评论不存在...")
                        } else {
                            this.$refs.toast.showToast("出错了...")
                            if (this.$store.getters.debug) {
                                console.log("rate comment", err)
                            }
                        }
                    }).finally(() => {
                        this.rateBtnLoading = false
                    })
                } else {
                    this.$refs.toast.showToast("手速太快了...慢点")
                }
            },
            commentAddIconHandler() {
                if (this.isDrug) {
                    this.slideToBottom()
                } else {
                    this.slideToTop()
                }
                this.isDrug = !this.isDrug
            },
            viewCommentClick(item, index) {
                this.$store.dispatch("setComment", {
                    comment: item
                }).then(() => {
                    let floor = index + 1
                    let host = this.userInfo.uid == this.article.author.author_id
                    uni.navigateTo({
                        url: '/pages/comment/comment?floor=' + floor + '&host=' + host
                    })
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("err in article")
                    }
                    this.$refs.toast.showToast("好像出了点小错误...")
                })
            },
            commentOperate(item, index) {
                if (item.author.author_id == this.userInfo.uid || this.isOperator) {
                    this.$refs.menu.showMenu([3]).then(() => {
                        this.$refs.dialog.showDialog({
                            content: "是否删除该评论?"
                        }).then(() => {
                            this.deleteComment(item, index)
                        }).catch(() => {})
                    }).catch(() => {})
                } else if (this.isHoster) {
                    this.$refs.menu.showMenu([2, 3]).then(res => {
                        if (res == 0) {
                            this.reportHandler(4, item.comment_id)
                        } else {
                            this.$refs.dialog.showDialog({
                                content: "是否删除该评论?"
                            }).then(() => {
                                this.deleteComment(item, index)
                            }).catch(() => {})
                        }
                    }).catch(() => {})
                } else {
                    this.$refs.menu.showMenu([2]).then(() => {
                        this.reportHandler(4, item.comment_id)
                    }).catch(() => {})
                }
            },
            deleteComment(item, index) {
                GET_article_deleteComment({
                    comment_id: item.comment_id
                }).then(res => {
                    this.$refs.toast.showToast("删除评论成功")
                    this.comments.splice(index, 1)
                    this.article.comments -= 1
                }).catch(err => {
                    this.$refs.toast.showToast("删除评论失败...")
                    if (this.$store.getters.debug) {
                        console.log("article deleteComment", err)
                    }
                })
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
            		// sourceType: ['album'], //从相册选择
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
            articleOperate() {
                if (this.isOperator) {
                    let isQuality = this.article.quality != 1 ? 4:5
                    this.$refs.menu.showMenu([0, 3, isQuality]).then(res => {
                        if (res == 0) {
                            this.$refs.toast.showToast("该功能开发中...")
                        } else if (res == 1) {
                            this.deleteArticle()
                        } else {
                            this.qualityArticle()
                        }
                    }).catch(() => {})
                } else if (this.isHoster) {
                    this.$refs.menu.showMenu([0, 3]).then(res => {
                        if (res == 0) {
                            this.$refs.toast.showToast("该功能开发中...")
                        } else {
                            this.deleteArticle()
                        }
                    }).catch(() => {})
                } else {
                    this.$refs.menu.showMenu([0, 2]).then(res => {
                        if (res == 0) {
                            this.$refs.toast.showToast("该功能开发中...")
                        } else {
                            this.reportHandler(2, this.article.article_id)
                        }
                    }).catch(() => {})
                }
            },
            reportHandler(category, link_id) {
                this.$refs.selector.showSelector({
                    datas: [
                        {
                            id: 1,
                            name: "违规信息"
                        },
                        {
                            id: 2,
                            name: "水贴"
                        },
                        {
                            id: 3,
                            name: "攻击辱骂"
                        },
                        {
                            id: 4,
                            name: "广告内容"
                        },
                        {
                            id: 5,
                            name: "其他"
                        }
                    ],
                    displayStr: "name",
                    checkedStr: "id"
                }).then(res => {
                    POST_report({
                        link_id: link_id,
                        category: category,
                        reason: res.name
                    }).then(() => {
                        this.$refs.toast.showToast("举报成功")
                    }).catch(err => {
                        if (err.code == 403) {
                            this.$refs.toast.showToast("您已经举报过了...")
                        } else {
                            this.$refs.toast.showToast("举报失败...")
                            if (this.$store.getters.debug) {
                                console.log("reportHandler", err)
                            }
                        }
                    })
                }).catch(() => {})
            },
            deleteArticle() {
                this.$refs.dialog.showDialog({
                	"title": "提示",
                	"content": "是否删除该文章？"
                }).then(() => {
                    let data = {
                    	article_id: this.article.article_id
                    }
                	GET_article_delBtnClick(data).then(res => {
                		this.$refs.nav.backPage({
                            delete: true,
                            index: this.articleIndex,
                            toast: "删除成功..."
                        })
                	}).catch(err => {
                		this.$refs.modal.showModal("提示", "删除失败...")
                		if (this.$store.getters.debug) {
                			console.log('management delBtnClick', err)
                		}
                	})
                }).catch(() => {})
            },
            loadMoreHandler() {
                if (!this.queryCommentCDing) {
                    this.queryNewComment()
                }
            },
            commentBtnClick() {
                if (this.commentForm.content.length == 0 && this.commentForm.images.length == 0) {
                    this.$refs.toast.showToast("评论内容不能为空!")
                } else if (this.commentForm.images.length != this.tmpImageList.length) {
                    this.$refs.toast.showToast("图片上传中...请稍后再试")
                } else {
                    this.sendBtnLoading = true
                    if (this.isDrug) {
                        this.slideToBottom()
                        this.isDrug = false
                    }
                    POST_article_commentBtnClick(this.article.article_id, this.commentForm).then(res => {
                        this.$refs.toast.showToast("评论成功!")
                        this.commentForm = {
                            content: "",
                            images: []
                        }
                        this.tmpImageList = []
                        this.article.comments += 1
                        this.queryNewComment()
                    }).catch(err => {
                        if (err.code == 404) {
                            this.$refs.toast.showToast("该文章已被删除...")
                        } else {
                            if (this.$store.getters.debug) {
                                console.log("commentBtnClick", err)
                            }
                            this.$refs.toast.showToast("啊啦...评论失败了呢")
                        }
                    }).finally(() => {
                        this.sendBtnLoading = false
                    })
                }
            },
            queryNewComment() {
                if (!this.pageLoading) {
                    this.pageLoading = true
                    this.loadStatus = "loading"
                    GET_article_mounted(this.queryData).then(res => {
                        if (res.data.comments.length == 0) {
                            this.queryCommentCDing = true
                            setTimeout(() => {
                                this.queryCommentCDing = false
                            }, 5000)
                        } else {
                            this.comments.push(...res.data.comments)
                        }
                        this.loadStatus = "over"
                    }).catch(err => {
                        if (err.code == 404) {
                            this.$refs.nav.backPage({
                                delete: true,
                                index: this.articleIndex,
                                toast: "该文章已被删除..."
                            })
                        } else {
                            if (this.$store.getters.debug) {
                                console.log("article mounted", err)
                            }
                            this.loadStatus = "erro"
                            this.$refs.toast.showToast("评论加载出错...")
                        }
                    }).finally(() => {
                        this.pageLoading = false
                    })
                }
            }
		},
        computed: {
            userInfo() {
                return this.$store.getters.userInfo
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
            queryData() {
                if (this.pageLoaded) {
                    return {
                        offset: this.comments.length,
                        limit: 10,
                        article_id: this.article.article_id
                    }
                } else {
                    return {}
                }
            },
            fillerHeight() {
                return this.inputBarHeaderHeight + 'px'
            },
            isHoster() {
                if (this.pageLoaded) {
                    return this.article.author.author_id == this.userInfo.uid
                } else {
                    return false
                }
            },
            isOperator() {
                return this.$store.getters.isOperator
            }
        },
        filters: {
            timeFormatter(val) {
                return stampFormatter(val, "Y-m-d")
            }
        }
	}
</script>

<style lang="less">
.my-article {
    position: relative;
    .my-image {
        width: 100%;
    }
    .article-container {
        padding: 0rpx 30rpx 0rpx 30rpx;
        .article-title {
            font-size: 40rpx;
        }
    }
    .follow-btn {
        position: absolute;
        top: 30rpx;
        right: 30rpx;
        z-index: 2;
    }
    .comment-rate {
        position: absolute;
        top: 30rpx;
        font-size: 30rpx;
        z-index: 2;
    }
    .my-signatrue {
        color: #d5d5d5;
        font-style: italic;
        font-size: 24rpx;
    }
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
