<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" :isBack="true"
		           :autoBack="false" @backClick="backClickHandler" ref="nav">
		    <block slot="backText">返回</block>
			<block slot="content">{{boardName}}</block>
		</cu-custom>
        
        <view class="my-article">
            <button class="cu-btn bg-green shadow follow-btn">关注</button>
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
            		<view class="my-container">
            			<view class="my-title margin-tb-sm">{{article.title}}</view>
            			<view class="my-content">{{article.content}}</view>
            		</view>
            		<view class="grid flex-sub padding-lr col-1">
                        <image v-for="(img, index) in article.images" :key="index" class="my-image margin-tb-sm"
                               :src="img" mode="widthFix" @click="viewImage(img)"></image>
            		</view>
                    <article-bar @operate="operateHandler"></article-bar>
                </view>
            </view>
        </view>
        
        
        <view class="cu-bar input input-bar" v-if="pageLoaded">
            <view class="cu-avatar round"
                  :style="[{ 'backgroundImage': 'url(' + userAvatar + ')'}]">
            </view>
        	<view class="action">
        		<text class="cuIcon-roundaddfill text-grey"></text>
        	</view>
        	<input :adjust-position="false" class="solid-bottom" maxlength="300" cursor-spacing="10"></input>
            <view class="action">
            	<text class="cuIcon-favor text-grey"></text>
            </view>
        	<button class="cu-btn bg-green shadow-blur">发送</button>
        </view>
        <view class="input-bar-filler"></view>
	</view>
</template>

<script>
    import { stampFormatter } from '../../common/utils.js'
    import ArticleBar from '../../components/article_bar.vue'
    
	export default {
        components: {
            "article-bar": ArticleBar
        },
        onLoad(options) {
            this.boardName = options.board_name
            if (this.$store.getters.hasArticle) {
                this.article = this.$store.getters.article
                this.pageLoaded = true
                console.log(this.article)
            } else {
                if (this.$store.getters.debug) {
                    console.log("err no article in vuex")
                }
            }
        },
		data() {
			return {
                pageLoaded: false,
				article: {},
                boardName: "看帖"
			}
		},
		methods: {
			backClickHandler() {
                this.$refs.nav.backPage()
            },
            viewImage(img) {
                uni.previewImage({
                	urls: this.article.images,
                	current: img
                });
            },
            operateHandler() {
                console.log("operate")
            }
		},
        computed: {
            userAvatar() {
                return this.$store.getters.userInfo.avatar
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
.cu-list.menu-avatar>.cu-item:after, .cu-list.menu>.cu-item:after {
    border-bottom: 0rpx;
}
.my-image {
    width: 100%;
}
.my-container {
    padding: 0rpx 30rpx 0rpx 30rpx;
}
.my-title {
    font-size: 40rpx;
}
.my-article {
    position: relative;
}
.follow-btn {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    z-index: 2;
}
.input-bar-filler {
    height: 50rpx;
}
.input-bar {
    position: fixed;
    bottom: 0;
    width: 100%;
}
</style>
