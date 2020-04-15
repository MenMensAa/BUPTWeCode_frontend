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

        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }" @scrolltolower="loadMoreHandler">
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
                                    <button class="cu-btn round" :class="'line-blue'" @click="boardClick(item)">{{item.board.name}}</button>
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
                                    <view class="cu-tag light round" :class="['bg-'+tagColorHandler(idx)]">{{tag.content}}</view>
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
        },
		data() {
			return {
                articles: [],
                
                pageSize: 10,
                curPage: 0,
                total: -1,
                
                pageLoading: false,
                queryCDing: false,
                loadStatus: "over",
                
                likeBtnLoading: false
			}
		},
		methods: {
            tagColorHandler(index) {
                return this.ColorList[index].name
            },
			boardClick(item) {
				uni.navigateTo({
					url: '/pages/board/board?board_id=' + item.board.board_id
				})
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
                        item.liked = !item.liked
                        item.likes -= count
                    }).finally(() => {
                        this.likeBtnLoading = false
                    })
                }
			},
            loadMoreHandler() {
                if (!this.queryCDing) {
                    this.queryNewData()
                }
            },
			articleClick(item, index) {
				this.$store.dispatch("setArticle", {
					article: item
				}).then(() => {
					uni.navigateTo({
						url: '/pages/article/article?board_name=' + item.board.name + '&index=' + index
					})
				}).catch(err => {
					this.$refs.toast.showToast("啊哦...好像出错了")
					if (this.$store.getters.debug) {
						console.log("history article Click", err)
					}
				})
			},
            queryNewData() {
                this.pageLoading = true
                this.loadStatus = "loading"
                GET_like_mounted(this.queryData).then(res => {
                    console.log(res.data)
                    this.total = res.data.total
                    this.loadStatus = "over"
                    if (res.data.articles.length == 0) {
                        this.queryCDing = true
                        setTimeout(() => {
                            this.queryCDing = false
                        }, 5000)
                    } else {
                        this.articles.push(...res.data.articles)
                        this.curPage += 1
                    }
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("like", err)
                    }
                    this.loadStatus = "erro"
                }).finally(() => {
                    this.pageLoading = false
                })
            },
			viewImage(img, index) {
				uni.previewImage({
					urls: this.histories[index].images,
					current: img
				});
			},
		},
        computed: {
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
            },
            queryData() {
                let offset = this.curPage * this.pageSize
                let limit = this.pageSize
                if (this.total != -1 && offset >= this.total) {
                    return {
                        offset: this.total,
                        limit: limit,
                    }
                } else {
                    return {
                        offset: offset,
                        limit: limit,
                    }
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
