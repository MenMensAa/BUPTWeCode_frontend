<template>
	<view>
		<my-nav bgColor="bg-gradual-blue" :isBack="true" class="custom-nav">
		    <block slot="backText">返回</block>
			<block slot="content">板块</block>
		</my-nav>
		
		<my-toast ref="toast"></my-toast>
		
		<scroll-view scroll-y="true" :scroll-top="scrollTop" :scroll-with-animation="true"
		             :style="{ height: scrollViewHeight }" @scroll="scrollHandler"
		             @scrolltolower="loadMoreHandler" class="board-container" show-scrollbar>
		    
		    <view class="cu-bar bg-white solid-bottom">
		    	<view class="action">
		    		<text class="cuIcon-title text-orange"></text>当前标签【{{tag.content}}】
		    	</view>
		    </view>
		    
		    <view>
		        <scroll-view scroll-x class="bg-white nav text-center solid-bottom">
		            <view class="cu-item" :class="index == activeTabbar ? 'text-blue cur' : ''"
		                  v-for="(item,index) in tabbar" :key="index" @click="tabbarClick(index)">
		                {{item}}
		            </view>
		        </scroll-view>
		        
		        <view class="article-card" v-for="(item, index) in articles" :key="index" @click="articleClick(item, index)">
		            <view class="cu-card case">
		                <view class="cu-item shadow">
		                    <view class="cu-list menu-avatar">
		                        <view class="cu-item">
		                            <view class="cu-avatar round lg"
		                                  :style="[{ 'backgroundImage': 'url(' + item.author.avatar + ')'}]">
		                                  <view class="cu-tag badge" :class=" item.author.gender%2 == 0 ? 'cuIcon-female bg-pink': 'cuIcon-male bg-blue' "></view>
		                            </view>
		                            <view class="content flex-sub">
		                                <view class="text-grey">{{item.author.username}}</view>
		                                <view class="text-gray text-sm flex justify-between">
		                                    {{item.created | timeFormatter}}
		                                </view>
		                            </view>
		                            <button class="cu-btn follow-btn round line-red" v-if="item.quality == 1">
		                                <text class="cuIcon-selection"></text>精品贴
		                            </button>
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
		        
		   </view>
		   
		   <view class="cu-load text-gray" :class="[loadStatus]" @click="loadMoreHandler"></view>
		</scroll-view>
	</view>
</template>

<script>
    import { stampFormatter } from '../../common/utils.js'
    import { GET_tag_mounted } from "../../network/functions.js"
    
    export default {
        onLoad(options) {
            this.tag = this.$store.getters.tag
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
                tag: {
                    content: ""
                },
                
                pageLoading: false,
                queryCDing: false,
                loadStatus: "over",
    		}
    	},
    	methods: {
            tagColorHandler(index) {
                return this.ColorList[index].name
            },
            tagClick(tag) {
                if (tag.tag_id != this.tag.tag_id) {
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
                } else {
                    this.$refs.toast.showToast("已经在这个标签上啦")
                }
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
                    GET_tag_mounted(this.queryData).then(res => {
                        this.loadStatus = "over"
                        if (res.data.articles.length == 0) {
                            this.queryCDing = true
                            setTimeout(() => {
                                this.queryCDing = false
                            }, 5000)
                        } else {
                            this.articles.push(...res.data.articles)
                        }
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
                    tag_id: this.tag.tag_id,
                    offset: this.articles.length,
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

<style lang="less">
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
</style>
