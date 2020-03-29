<template>
	<view>
        <cu-custom bgColor="bg-gradual-blue" :isBack="true" class="custom-nav">
            <block slot="backText">返回</block>
        	<block slot="content">板块</block>
        </cu-custom>
        
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
                
                <view class="article-card" v-for="(item, index) in articles" :key="index" @click="articleClick(item)">
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
                                </view>
                            </view>
                            
                            <view class="padding-tb-sm padding-lr">
                                <view class="title">
                                    {{item.title}}
                                </view>
                                <view class="content text-gray">
                                    {{item.content}}
                                </view>
                            </view>
                            
                            
                            <view class="grid col-4 grid-square flex-sub bg-white padding-lr-sm" v-if="item.images.length > 0">
                                 <view class="bg-img" v-for="(img,idx) in item.images" :key="idx" @click.stop="viewImage(img, index)">
                                      <image :src="img" mode="aspectFill"></image>
                                 </view>
                            </view>
                            
                            <view class="text-gray text-sm text-right padding">
                                <text class="cuIcon-attentionfill margin-lr-xs"></text> 10
                                <text class="cuIcon-likefill margin-lr-xs"></text> 20
                                <text class="cuIcon-messagefill margin-lr-xs"></text> 30
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
            console.log(this.board)
            this.queryNewArticle()
        },
        onShow() {
            if (this.$store.getters.hasNewMsg) {
                let message = this.$store.getters.msg
                if (!!message.toast) {
                    this.$refs.toast.showToast(message.toast)
                    this.$store.dispatch({
                        type: 'clearMessage'
                    })
                }
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
                
                pageSize: 10,
                curPage: 0,
                total: -1,
                tabbar: ["最新", "精品"],
                activeTabbar: 0,
                
                scrollTop: 0,
                oldScrollTop: 0,
                loadStatus: "loading",
                pageLoading: false
			}
		},
		methods: {
			tabbarClick(index) {
                this.activeTabbar = index
            },
            articleClick(item) {
                this.$store.dispatch("setArticle", {
                    article: item
                }).then(() => {
                    uni.navigateTo({
                        url: '/pages/article/article?board_name=' + this.board.name
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
            queryNewArticle(reload=false) {
                this.loadStatus = "loading"
                this.pageLoading = true
                GET_board_article(this.queryData).then(res => {
                    // console.log(res)
                    if (reload) {
                        this.articles = res.data.articles
                    } else {
                        this.articles.push(...res.data.articles) 
                    }
                    this.total = res.data.total
                    console.log(this.articles)
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("GET board article", err)
                    }
                    this.loadStatus = "error"
                }).finally(() => {
                    if (reload) {
                        this.$refs.toast.showToast("刷新成功...")
                    }
                    this.pageLoading = false
                })
            },
            loadMoreHandler() {
                console.log("loadMore")
                if (!this.noMoreContent) {
                    this.curPage += 1
                    this.queryNewArticle()
                } else {
                    this.loadStatus = "over"
                    this.$refs.toast.showToast("没有更多帖子")
                }
            },
            scrollHandler(e) {
                // console.log(e)
                this.oldScrollTop = e.detail.scrollTop
            },
            goToTopHandler() {
                console.log("gototop")
                this.scrollTop = this.oldScrollTop
                this.$nextTick(function(){
                    this.scrollTop = 0
                })
            },
            reloadPageHandler() {
                console.log("reload page")
                this.goToTopHandler()
                this.curPage = 0
                this.queryNewArticle(true)
            },
            publishHandler() {
                console.log("publish article")
                uni.navigateTo({
                    url: '/pages/editor/editor?board_id=' + this.board.board_id + "&board_name=" + this.board.name
                })
            }
		},
        computed: {
            queryData() {
                if (this.pageLoaded) {
                    let mode = "new"
                    if (this.activeTabbar == 1) {
                        mode = "hot"
                    }
                    let offset = this.curPage * this.pageSize
                    let limit = this.pageSize
                    return {
                        offset: offset,
                        limit: limit,
                        board_id: this.board.board_id,
                        mode: mode
                    }
                } else {
                    return {}
                }
            },
            noMoreContent() {
                return this.articles.length == this.total
            },
            showGoToTop() {
                return this.oldScrollTop > 800
            },
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
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
.title {
    font-size: 35rpx;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
.content {
    margin-top: 5rpx;
    font-size: 28rpx;
    color: #888;
    height: 4.8em;
    overflow: hidden;
    line-height: 1.6;
}
.board-container {
    width: 100%;
}
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
.cu-card >.cu-item {
    margin: 0;
}
.article-card {
    margin: 30rpx;
}
.fly-bottom {
    position: fixed;
    right: 7%;
    z-index: 1;
    box-shadow: 0rpx 0rpx 10rpx rgba(0,0,0,0.2);
}
.goToTop {
    bottom: 21%;
}
.reload {
    bottom: 13%;
}
.publish {
    bottom: 5%;
}
</style>
