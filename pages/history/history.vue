<template>
	<view>
		<my-nav bgColor="bg-gradual-blue" :isBack="true" ref="nav">
			<block slot="backText">返回</block>
			<block slot="content">浏览历史</block>
		</my-nav>
        
		<my-dialog ref="dialog"></my-dialog>
		<my-modal ref="modal"></my-modal>
		<my-toast ref="toast"></my-toast>
        
        <view class="cu-bar bg-white solid-bottom">
        	<view class="action">
        		<text class="cuIcon-title text-orange"></text> 最近浏览
        	</view>
            <view class="action">
                <button class='cu-btn bg-green shadow' @click="clearHistories">清空</button>
            </view>
        </view>

		<view v-for="(item, index) in histories" :key="index">
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
							<view class="draft-card-del cuIcon-delete" @click.stop="delHistoryClick(index)"></view>
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

					<view class="padding-tb-sm padding-lr" @click="historyClick(item, index)">
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
	</view>
</template>

<script>
	import { stampFormatter } from '../../common/utils.js'
    import { GET_notify_pointedArticle } from '../../network/functions.js'

	export default {
        onShow() {
            if (this.$store.getters.hasNewMsg) {
                let message = this.$store.getters.msg
                if (!!message.delete) {
                    let index = Number(message.index)
                    this.$store.dispatch({
                    	type: 'deleteArticleHistory',
                    	index: index
                    }).then(() => {}).catch(err => {
                        if (this.$store.getters.debug) {
                            console.log("history onshow", err)
                        }
                    	this.$refs.modal.showModal("提示", "删除失败...")
                    })
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
			clearHistories() {
				this.$refs.dialog.showDialog({
					"title": "提示",
					"content": "是否清空历史记录？"
				}).then(() => {
					this.$store.dispatch({
						type: 'clearArticleHistory',
					}).then(() => {
						this.$refs.toast.showToast("删除成功")
					}).catch(err => {
						console.log(err)
						this.$refs.modal.showModal("提示", "删除失败...")
					})
				}).catch(() => {})
			},
			boardClick(item) {
				uni.navigateTo({
					url: '/pages/board/board?board_id=' + item.board.board_id
				})
			},
			delHistoryClick(index) {
				this.$refs.dialog.showDialog({
					"title": "提示",
					"content": "是否删除该记录？"
				}).then(() => {
					this.$store.dispatch({
						type: 'deleteArticleHistory',
						index: index
					}).then(() => {
						this.$refs.toast.showToast("删除成功")
					}).catch(err => {
						console.log(err)
						this.$refs.modal.showModal("提示", "删除失败...")
					})
				}).catch(() => {})
			},
			historyClick(item, index) {
                GET_notify_pointedArticle({
                    article_id: item.article_id
                }).then(res => {
                    this.$store.dispatch("setArticle", {
                        article: res.data.article
                    }).then(() => {
                        uni.navigateTo({
                            url: '/pages/article/article?index=' + index
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
			viewImage(img, index) {
				uni.previewImage({
					urls: this.histories[index].images,
					current: img
				});
			},
		},
		computed: {
			histories() {
				return this.$store.getters.articleHistories
			},
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
