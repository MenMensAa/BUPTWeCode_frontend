<template>
	<view>
		<my-nav bgColor="bg-gradual-blue" :isBack="true" ref="nav">
			<block slot="backText">返回</block>
			<block slot="content">赞过的帖子</block>
		</my-nav>
        
		<my-dialog ref="dialog"></my-dialog>
		<my-modal ref="modal"></my-modal>
		<my-toast ref="toast"></my-toast>
        
        <view class="cu-bar bg-white solid-bottom">
        	<view class="action">
        		<text class="cuIcon-title text-orange"></text> 最近赞过的帖子都会展示在这里哟
        	</view>
        </view>

        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }"
                     @scrolltolower="loadMoreHandler" style="width: 100%;" show-scrollbar>
            <view v-for="(item, index) in articles" :key="index" @click="articleClick(item, index)">
                <view class="cu-card case">
                    <view class="cu-item shadow">
                        <view class="cu-list menu-avatar">
                            <view class="cu-item">
                                <view class="cu-avatar round lg" :style="[{ 'backgroundImage': 'url(' + item.author.avatar + ')'}]">
                                    <view class="cu-tag badge" :class=" item.author.gender%2 == 0 ? 'cuIcon-female bg-pink': 'cuIcon-male bg-blue' "></view>
                                </view>
                                <view class="content flex-sub">
                                    <view class="text-grey">{{item.author.username}}</view>
                                    <view class="text-gray text-sm flex justify-between">
                                        {{item.created | timeFormatter}}
                                    </view>
                                </view>
                                <view class="board-name">
                                    <button class="cu-btn round" :class="[item.quality == 1 ? 'line-red':'line-blue']" @click="boardClick(item)">
                                        <text v-if="item.quality == 1" class="cuIcon-selection"></text>{{item.board.name}}
                                    </button>
                                </view>
                                <view class="draft-card-del" :class="[item.liked ? 'cuIcon-likefill text-red':'cuIcon-like']" @click.stop="likeArticle(item)"></view>
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
                            
                        </view>

                        <view class="padding-tb-sm padding-lr">
                            <view class="title">
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
    </view>
</template>

<script>
	import { stampFormatter } from '../../common/utils.js'
    import { GET_like_mounted, GET_article_likeArticle } from "../../network/functions.js"

	export default {
        onLoad() {
            this.queryNewData()
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
            let deleteCount = 0
            for (let item of this.articles) {
                if (!item.liked) {
                    deleteCount += 1
                }
            }
            this.deleteCount = deleteCount
        },
		data() {
			return {
                articles: [],
                
                pageLoading: false,
                queryCDing: false,
                loadStatus: "over",
                
                likeBtnLoading: false,
                deleteCount: 0
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
			boardClick(item) {
				uni.navigateTo({
					url: '/pages/board/board?board_id=' + item.board.board_id
				})
			},
            loadMoreHandler() {
                if (!this.queryCDing) {
                    this.queryNewData()
                }
            },
			likeArticle(item) {
                if (!this.likeBtnLoading) {
                    let data = {
                        article_id: item.article_id
                    }
                    let count = item.liked ? -1 : 1
                    item.liked = !item.liked
                    item.likes += count
                    this.likeBtnLoading = true
                    GET_article_likeArticle(data).then(() => {
                        if (item.liked) {
                            this.$refs.toast.showToast("谢谢你的赞~")
                            this.deleteCount -= 1
                        } else {
                            this.$refs.toast.showToast("取消赞成功")
                            this.deleteCount += 1
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
                        item.liked = !item.liked
                        item.likes -= count
                    }).finally(() => {
                        this.likeBtnLoading = false
                    })
                }
			},
			articleClick(item, index) {
				this.$store.dispatch("setArticle", {
					article: item
				}).then(() => {
					uni.navigateTo({
						url: '/pages/article/article?index=' + index
					})
				}).catch(err => {
					this.$refs.toast.showToast("啊哦...好像出错了")
					if (this.$store.getters.debug) {
						console.log("history article Click", err)
					}
				})
			},
            queryNewData() {
                if (!this.pageLoading) {
                    this.pageLoading = true
                    this.loadStatus = "loading"
                    GET_like_mounted(this.queryData).then(res => {
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
                            console.log("like", err)
                        }
                        this.loadStatus = "erro"
                    }).finally(() => {
                        this.pageLoading = false
                    })
                }
            },
			viewImage(img, index) {
				uni.previewImage({
					urls: this.articles[index].images,
					current: img
				});
			},
		},
        computed: {
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
            },
            queryData() {
                return {
                    offset: this.articles.length - this.deleteCount,
                    limit: 10
                }
            }
        },
		filters: {
			timeFormatter(val) {
				return stampFormatter(val, "Y年m月d日")
			}
		}
	}
</script>

<style>
.board-name {
    margin: 8px;
}
.cu-card>.cu-item {
    margin: 15rpx;
}
.draft-card-del {
    margin: 30rpx;
    z-index: 2;
}
.title {
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
</style>
