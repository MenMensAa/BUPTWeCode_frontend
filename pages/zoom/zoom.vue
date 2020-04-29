<template>
	<view>
		<my-nav bgColor="bg-gradual-blue" :isBack="true" class="custom-nav">
		    <block slot="backText">返回</block>
			<block slot="content">板块</block>
		</my-nav>
		
		<my-toast ref="toast"></my-toast>
        <my-menu ref="menu"></my-menu>
        <my-selector ref="selector"></my-selector>
		
		<scroll-view scroll-y="true" :scroll-with-animation="true" :style="{ height: scrollViewHeight }"
		             @scrolltolower="loadMoreHandler" class="zoom-container" show-scrollbar>
		    
		    <template v-if="pageLoaded">
		        <view class="flex padding-sm shadow bg-white" @click="goToProfile">
                    <button class="cu-btn follow-btn shadow-blur round" @click.stop="followBtnClick" v-if="!isOwner"
                            :class="[user.is_followed ? 'bg-grey':'bg-green']">
                        <text :class="{'cuIcon-add': !user.is_followed}"></text>{{user.is_followed ? '取关':'关注'}}
                    </button>
		            <view class="flex-sub zoom-header">
		                <view class="cu-avatar xl bg-red round zoom-avatar"
		                     :style="{ backgroundImage: 'url('+user.avatar+')' }">
                             <view class="cu-tag badge" :class=" user.gender%2 == 0 ? 'cuIcon-female bg-pink': 'cuIcon-male bg-blue' "></view>
		                </view>
		            </view>
		            <view class="flex-treble">
		                <view class="zoom-name">{{user.username}}</view>
		                <view class="zoom-desc margin-top-sm text-gray">{{'"' + user.signature + '"'}}</view>
                        <view class="margin-top-sm flex justify-between">
                            <view class="text-gray text-df">
                                <text class="padding-right-sm">粉丝: {{user.followers}}</text> 
                                <text class="padding-lr-sm">关注: {{user.followeds}}</text>
                            </view>
                            <view v-if="!isOwner">
                                <text class="cuIcon-more text-gray" @click.stop="userOperate()"></text>
                            </view>
                        </view>
		            </view>
		        </view>
		    </template>
            
            <view class="cu-bar bg-white solid-bottom margin-top">
            	<view class="action">
            		<text class="cuIcon-title text-orange"></text> {{isOwner?'WO':'TA'}}的帖子
            	</view>
            </view>
            
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
	</view>
</template>

<script>
    import { stampFormatter } from '../../common/utils.js'
    import { GET_posts_mounted, GET_zoom_profile, GET_zoom_follow, POST_report } from "../../network/functions.js"
    
	export default {
        onLoad(options) {
            this.user_id = options.user_id
            GET_zoom_profile({
                user_id: this.user_id
            }).then(res => {
                // console.log(res)
                this.user = res.data
                this.pageLoaded = true
                this.queryNewArticle()
            }).catch(err => {
                this.$refs.toast.showToast(err.message)
            })
        },
		data() {
			return {
                user_id: "",
				user: {
                    avatar: "",
                    username: "",
                    gender: 0,
                    signature: "",
                    followers: 0,
                    followeds: 0,
                    is_followed: false
                },
                articles: [],
                
                pageLoaded: false,
                followBtnLoading: false,
                queryCDing: false,
                pageLoading: false,
                
                loadStatus: "over"
			};
		},
        methods: {
            userOperate() {
                this.$refs.menu.showMenu([2]).then(() => {
                    this.reportHandler(1, this.user_id)
                }).catch(() => {})
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
            followBtnClick() {
                if (!this.followBtnLoading) {
                    this.followBtnLoading = true
                    this.user.is_followed = ! this.user.is_followed
                    let toastText = this.user.is_followed ? '关注成功':'取消关注成功'
                    let count = this.user.is_followed ? 1:-1
                    this.user.followers += count
                    GET_zoom_follow({
                        user_id: this.user_id
                    }).then(() => {
                        this.$refs.toast.showToast(toastText)
                    }).catch(err => {
                        this.$refs.toast.showToast('关注失败...')
                        this.user.is_followed = ! this.user.is_followed
                        this.user.followers -= count
                        if (this.$store.getters.debug) {
                            console.log(err)
                        }
                    }).finally(() => {
                        this.followBtnLoading = false
                    })
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
            goToProfile() {
                if (this.isOwner) {
                    uni.navigateTo({
                        url: '/pages/profile/profile'
                    })
                }
            }
        },
        computed: {
            queryData() {
                if (this.pageLoaded) {
                    return {
                        offset: this.articles.length,
                        limit: 10,
                        user_id: this.user_id,
                    }
                } else {
                    return {}
                }
            },
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
            },
            isOwner() {
                return this.$store.getters.userInfo.uid == this.user_id
            }
        },
        filters: {
        	timeFormatter(val) {
        		return stampFormatter(val, "m/d")
        	}
        }
	}
</script>

<style lang="less">
.zoom-container {
    width: 100%;
    .zoom-header {
        position: relative;
    }
    .zoom-avatar {
        position: absolute;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    .zoom-name {
        font-size: 45rpx;
    }
    .zoom-desc {
        font-style: italic;
        margin-top: 25rpx;
        font-size: 30rpx;
    }
    .follow-btn {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
        z-index: 2;
    }
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

.board-name {
    margin: 8px;
}
</style>
