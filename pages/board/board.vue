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
            
            <template v-if="pageLoaded">
                <view class="flex padding-sm shadow bg-white">
                    <view class="flex-sub board-header">
                        <view class="cu-avatar xl bg-red board-avatar"
                             :style="{ backgroundImage: 'url('+board.avatar+')' }">
                        </view>
                    </view>
                    <view class="flex-treble">
                        <view class="board-name">{{board.name}}</view>
                        <view class="board-desc margin-top-sm text-gray">{{'"' + board.desc + '"'}}</view>
                    </view>
                </view>
            </template>
            
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
                                    <view class="cu-avatar round lg" @click.stop="userAvatarClick(item)"
                                          :style="[{ 'backgroundImage': 'url(' + item.author.avatar + ')'}]">
                                          <view class="cu-tag badge" :class=" item.author.gender%2 == 0 ? 'cuIcon-female bg-pink': 'cuIcon-male bg-blue' "></view>
                                    </view>
                                    <view class="content flex-sub">
                                        <view class="text-grey" @click.stop="userAvatarClick(item)">{{item.author.username}}</view>
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
           
           <view class="cu-load text-gray" :class="[loadStatus]"></view>
        </scroll-view>
        
        <button class="cu-btn cuIcon goToTop lg fly-bottom bg-white animation-fade"
                @click.stop="goToTopHandler" v-show="showGoToTop">
        	<text class="cuIcon-top"></text>
        </button>
        <button class="cu-btn cuIcon reload lg fly-bottom bg-white"
                @click.stop="reloadPageHandler" :disabled="pageLoading">
        	<text class="cuIcon-refresh"  :class="{'cuIconfont-spin': pageLoading}"></text>
        </button>
        <button class="cu-btn cuIcon publish lg fly-bottom bg-white" @click.stop="publishHandler">
        	<text class="cuIcon-add"></text>
        </button>
	</view>
</template>

<script>
    import { GET_board_article } from "../../network/functions.js"
    import { stampFormatter } from '../../common/utils.js'
    
	export default {
        onLoad(options) {
            let board_id = Number(options.board_id)
            for (let i = 0; i < this.$store.getters.boardList.length; i++) {
                if (this.$store.getters.boardList[i].board_id === board_id) {
                    this.board = this.$store.getters.boardList[i]
                    this.pageLoaded = true
                    break
                }
            }
            this.queryNewArticle()
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
        onUnload() {
            this.$store.dispatch('setBoardHistory', {
                board: this.board
            })
        },
		data() {
			return {
                pageLoaded: false,
                board: null,
                articles: [],
                
                tabbar: ["最新", "精品"],
                activeTabbar: 0,
                
                scrollTop: 0,
                oldScrollTop: 0,
                loadStatus: "over",
                pageLoading: false,
                queryCDing: false
			}
		},
		methods: {
			tabbarClick(index) {
                if (!this.pageLoading) {
                    this.activeTabbar = index
                    this.reloadPageHandler(false)
                }
            },
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
                        console.log("board article Click", err)
                    }
                })
            },
            viewImage(img, index) {
                uni.previewImage({
                	urls: this.articles[index].images,
                	current: img
                });
            },
            queryNewArticle(reload=false, toast=true) {
                if (!this.pageLoading) {
                    this.pageLoading = true
                    this.loadStatus = "loading"
                    let queryData = { ...this.queryData }
                    if (reload) {
                        queryData.offset = 0
                    }
                    GET_board_article(queryData).then(res => {
                        if (reload) {
                            this.articles = res.data.articles
                            if (toast) {
                                this.$refs.toast.showToast("刷新成功...") 
                            }
                        } else {
                            this.articles.push(...res.data.articles)
                        }
                        if (res.data.articles.length == 0) {
                            this.queryCDing = true
                            setTimeout(() => {
                                this.queryCDing = false
                            }, 5000)
                        }
                        this.loadStatus = "over"
                    }).catch(err => {
                         if (this.$store.getters.debug) {
                             console.log("GET board article", err)
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
                this.$nextTick(function(){
                    this.scrollTop = 0
                })
            },
            reloadPageHandler(toast=true) {
                this.goToTopHandler()
                this.queryNewArticle(true, toast)
            },
            publishHandler() {
                uni.navigateTo({
                    url: '/pages/editor/editor?board_id=' + this.board.board_id + "&board_name=" + this.board.name
                })
            },
            userAvatarClick(item) {
                uni.navigateTo({
                    url: "/pages/zoom/zoom?user_id=" + item.author.author_id
                })
            }
		},
        computed: {
            queryData() {
                if (this.pageLoaded) {
                    let mode = "new"
                    let quality = this.activeTabbar == 1 ? 1:0
                    return {
                        offset: this.articles.length,
                        limit: 10,
                        board_id: this.board.board_id,
                        mode: mode,
                        quality: quality
                    }
                } else {
                    return {}
                }
            },
            showGoToTop() {
                return this.oldScrollTop > 800
            },
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
            },
        },
        filters: {
            timeFormatter(val) {
                return stampFormatter(val, "Y年m月d日")
            }
        }
	}
</script>

<style lang="less">
.cu-list.menu-avatar>.cu-item:after, .cu-list.menu>.cu-item:after {
    border-bottom: 0rpx
}

.board-container {
    width: 100%;
    .board-header {
        position: relative;
    }
    .board-avatar {
        position: absolute;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    .board-name {
        font-size: 45rpx;
    }
    .board-desc {
        font-style: italic;
        margin-top: 25rpx;
        font-size: 30rpx;
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
    .article-card {
        margin: 20rpx;
    }
    .follow-btn {
        position: absolute;
        top: 30rpx;
        right: 30rpx;
        z-index: 2;
    }
}

.cu-card >.cu-item {
    margin: 0;
}


.fly-bottom {
    position: fixed;
    right: 7%;
    z-index: 1;
    box-shadow: 0rpx 0rpx 10rpx rgba(0,0,0,0.2);
    &.goToTop {
        bottom: 21%;
    }
    &.reload {
        bottom: 13%;
    }
    &.publish {
        bottom: 5%;
    }
}
</style>
