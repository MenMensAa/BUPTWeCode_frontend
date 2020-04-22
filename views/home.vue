<template>
    <view>
        <my-toast ref="toast"></my-toast>
        
        <view class="cu-bar search bg-white">
            <view class="search-form round">
                <text class="cuIcon-search"></text>
                <input :adjust-position="false" type="text" maxlength="15"
                       placeholder="搜索帖子" v-model="searchContent"></input>
            </view>
            <view class="action">
                <button class="cu-btn bg-green shadow-blur round" @click="searchBtnClick">搜索</button>
            </view>
        </view>
        <view class="text-grey margin-top" style="text-align: center;" v-if="searchHistories.length == 0">搜索历史最多保存十条</view>
        
        <view class="flex flex-wrap margin-lr margin-top">
            <view class="padding-xs" v-for="(item, index) in searchHistories" :key="index" @click="searchHistoryClick(item)">
                <view class="cu-capsule round">
                	<view class="cu-tag bg-grey">
                		{{item}}
                	</view>
                	<view class="cu-tag line-grey" @click.stop="delSearchHistory(index)">
                		<text class="cuIcon-close"></text>
                	</view>
                </view>
            </view>
        </view>
        
        <view class="cu-bar bg-white solid-bottom margin-top">
        	<view class="action">
        		<text class="cuIcon-title text-orange"></text> 今日热帖
        	</view>
        </view>
        
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
                            
                            <view class="board-name">
                                <button class="cu-btn round" :class="[item.quality == 1 ? 'line-red':'line-blue']" @click="boardClick(item)">
                                    <text v-if="item.quality == 1" class="cuIcon-selection"></text>{{item.board.name}}
                                </button>
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
</template>

<script>
    import { GET_board_article } from "../network/functions.js"
    import { stampFormatter } from '../common/utils.js'
    
    export default {
        name: "Home",
        mounted() {
            this.queryHotArticle()
        },
        data() {
            return {
                searchContent: "",
                articles: []
            }
        },
        methods: {
            searchBtnClick() {
                if (!!this.searchContent) {
                    uni.navigateTo({
                        url: '/pages/search/search?keyword=' + this.searchContent
                    })
                } else {
                    this.$refs.toast.showToast("搜索内容不能为空...")
                }
            },
            delSearchHistory(index) {
                this.$store.dispatch({
                    type: "deleteSearchHistory",
                    index: index
                }).then(() => {}).catch(err => {
                    console.log("delSearchHistory", err)
                })
            },
            searchHistoryClick(item) {
                uni.navigateTo({
                    url: '/pages/search/search?keyword=' + item
                })
            },
            tagColorHandler(index) {
                return this.ColorList[index].name
            },
            boardClick(item) {
                console.log(item)
            	uni.navigateTo({
            		url: '/pages/board/board?board_id=' + item.board.board_id
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
            			console.log("history article Click", err)
            		}
            	})
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
            queryHotArticle() {
                GET_board_article({ mode: "hot" }).then(res => {
                    this.articles = res.data.articles
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log("home", err)
                    }
                })
            },
            viewImage(img, index) {
            	uni.previewImage({
            		urls: this.articles[index].images,
            		current: img
            	});
            },
        },
        computed: {
            searchHistories() {
                return this.$store.getters.searchHistories
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
