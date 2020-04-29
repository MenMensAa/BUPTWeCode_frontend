<template>
	<view>
		<my-nav bgColor="bg-gradual-blue" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">帖子管理</block>
		</my-nav>
		<my-dialog ref="dialog"></my-dialog>
		<my-modal ref="modal"></my-modal>
		<my-toast ref="toast"></my-toast>

		<view v-if="this.articels.length == 0">
			<view class="tips text-gray margin-tb-sm text-center">
				吾有帖哉？无帖也。
			</view>
		</view>

		<scroll-view scroll-y="true" :scroll-top="scrollTop" :scroll-with-animation="true" :style="{ height: scrollViewHeight+'px' }"
		 @scroll="scrollHandler" @scrolltolower="loadMoreHandler" show-scrollbar>
			<view class="article-card" v-for="(item, index) in articles" :key="index" @click="myArticleClick(item, index)">
				<view class="cu-card case">
					<view class="cu-item shadow">
						<view class="cu-list menu-avatar">
							<view class="cu-item">
								<view class="cu-avatar lg" 
									:style="{ backgroundImage: 'url('+item.board.avatar+')' }">
								</view>
								<view class="content flex-sub">								
									<view class="text-black">发布到{{item.board.name}}</view>
									<view class="text-gray text-sm flex justify-between boardName">
										 {{item.created | timeFormatter}}
									</view>
                                    
								</view>
                                <view class="board-name" v-if="item.quality == 1">
                                	<button class="cu-btn round line-red">
                                	    <text class="cuIcon-selection"></text>精品贴
                                	</button>
                                </view>
                                <view class="draft-card-del cuIcon-delete" @click.stop="delArticleClick(index)"></view>
							</view>
						</view>
                        
                        <view class="flex flex-wrap" v-if="item.tags.length > 0">
                            <view class="action">
                                <button class="cu-btn cuIcon bg-white">
                                    <text class="cuIcon-tag text-grey"></text>
                                </button>
                            </view>
                            <view class="padding-xs" v-for="(tag, idx) in item.tags" :key="idx">
                                <view class="cu-tag light round" :class="['bg-'+tagColorHandler(idx)]" @click.stop="tagClick(tag)">
                                    {{tag.content}}
                                </view>
                            </view>
                        </view>

						<view class="padding-tb-sm padding-lr">
							<view class="article-title">
								{{item.title}}
							</view>
							<view class="article-content text-gray">
								{{item.content}}
							</view>
						</view>

						<view class="grid col-4 grid-square flex-sub bg-white padding-lr-sm" v-if="item.images.length > 0">
							<view class="bg-img" v-for="(img,idx) in item.images" :key="idx" @click.stop="viewImage(img, index)">
								<image :src="img" mode="aspectFill"></image>
							</view>
						</view>

						<view class="text-gray text-sm text-right padding">
						    <text class="cuIcon-attentionfill margin-lr-xs"></text> {{item.views}}
						    <text class="cuIcon-likefill margin-lr-xs" :class="{ 'text-red': item.liked }"></text> {{item.likes}}
						    <text class="cuIcon-messagefill margin-lr-xs"></text> {{item.comments}}
						</view>
					</view>
				</view>
			</view>
			<view class="cu-load text-gray" :class="[loadStatus]" @click="loadMoreHandler"></view>
		</scroll-view>

		<button class="cu-btn cuIcon goToTop lg fly-bottom bg-white animation-fade" @click.stop="goToTopHandler" v-show="showGoToTop">
			<text class="cuIcon-top"></text>
		</button>

	</view>
</template>

<script>
	import { stampFormatter } from '../../common/utils.js'
	import { GET_posts_mounted, GET_article_delBtnClick } from "../../network/functions.js"

	export default {
		onLoad() {
			this.queryNewArticle()
		},
		onReady() {
			let res = uni.getSystemInfoSync()//获取系统信息
			this.scrollViewHeight = res.windowHeight - 64
		},
        onShow() {
            if (this.$store.getters.hasNewMsg) {
                let message = this.$store.getters.msg
                if (!!message.delete) {
                    let index = Number(message.index)
                    this.articles.splice(index, 1)
                } 
                if (!!message.toast) {
                    this.$refs.toast.showToast(message.toast)
                }
                this.$store.dispatch({
                    type: 'clearMessage'
                })
            }
        },
		data() {
			return {
				articles: [],

				scrollViewHeight: 0,
				scrollTop: 0,
				oldScrollTop: 0,
				loadStatus: "over",
                
                queryCDing: false,
                pageLoading: false
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
			delArticleClick(index) {
				this.$refs.dialog.showDialog({
					"title": "提示",
					"content": "是否删除该文章？"
				}).then(() => {
                    let data = {
                    	article_id: this.articles[index].article_id
                    }
					GET_article_delBtnClick(data).then(() => {
						this.$refs.toast.showToast("删除成功")
						this.articles.splice(index, 1)
					}).catch(err => {
						this.$refs.modal.showModal("提示", "删除失败...")
						if (this.$store.getters.debug) {
							console.log('management delBtnClick', err)
						}
					})
				}).catch(() => {})
			},
			myArticleClick(item, index) {
				this.$store.dispatch("setArticle", {
					article: item
				}).then(() => {
					uni.navigateTo({
						url: '/pages/article/article?index=' + index
					})
				}).catch(err => {
					this.$refs.toast.showToast("啊哦...好像出错了")
					if (this.$store.getters.debug) {
						console.log("my article Click", err)
					}
				})
			},
			viewImage(img, index) {
				uni.previewImage({
					urls: this.articles[index].images,
					current: img
				});
			},
			queryNewArticle() {
                if (!this.pageLoading) {
                    this.loadStatus = "loading"
                    this.pageLoading = true
                    GET_posts_mounted(this.queryData).then(res => {
                        if (res.data.articles.length == 0) {
                            this.queryCDing = true
                            setTimeout(() => {
                                this.queryCDing = false
                            }, 5000)
                        } else {
                            this.articles.push(...res.data.articles)
                        }
                    	this.loadStatus = "over"
                    }).catch(err => {
                    	if (this.$store.getters.debug) {
                    		console.log("GET my article", err)
                    	}
                    	this.loadStatus = "erro"
                    }).finally(() => {
                        this.pageLoading = false
                    })
                }
			},
			loadMoreHandler() {
				if (!this.queryCDing) {
					this.queryNewArticle()
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
		},
		computed: {
            userId() {
                return this.$store.getters.userInfo.uid
            },
			queryData() {
                return {
                    offset: this.articles.length,
                    limit: 10,
                    user_id: this.userId
                }	
			},
			showGoToTop() {
				return this.oldScrollTop > 800
			},
		},
		filters: {
			timeFormatter(val) {
				return stampFormatter(val, "m/d")
			}
		}
	}
</script>

<style>
.cu-card>.cu-item {
    margin: 0;
}

.article-card {
    margin: 20rpx;
}

.article-title {
    font-size: 35rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.article-content {
    margin-top: 5rpx;
    font-size: 28rpx;
    color: #888;
    max-height: 4.8em;
    overflow: hidden;
    line-height: 1.6;
}

.fly-bottom {
    position: fixed;
    right: 7%;
    z-index: 1;
    box-shadow: 0rpx 0rpx 10rpx rgba(0, 0, 0, 0.2);
}

.goToTop {
    bottom: 10%;
}

.board-name {
    margin: 8px;
}

.draft-card-del {
    margin: 30rpx;
    z-index: 2;
}
</style>

