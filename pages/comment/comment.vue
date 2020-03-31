<template>
	<view v-if="pageLoaded">
        <my-nav bgColor="bg-gradual-blue" :isBack="true"
                   :autoBack="false" @backClick="backClickHandler" ref="nav">
            <block slot="backText">返回</block>
        	<block slot="content">第{{commentFloor}}楼的评论</block>
        </my-nav>
        
        <my-menu ref="menu"></my-menu>
		
        <scroll-view scroll-y="true" :style="{ height: scrollViewHeight }"
                     @scrolltolower="loadMoreHandler" style="width: 100%;" show-scrollbar>
            
            <view class="cu-list menu-avatar comment solids-top">
            	<view class="cu-item">
            		<view class="cu-avatar round"
            		      :style="[{ 'backgroundImage': 'url(' + comment.author.avatar + ')'}]">
            		</view>
                    <view class="content">
            			<view class="text-grey">{{comment.author.username}}</view>
            			<view class="text-gray text-content text-df">
            				{{comment.content}}
            			</view>
                        <view class="grid flex-sub padding-lr col-1">
                            <image v-for="(img, idx) in comment.images" :key="idx" class="my-image margin-tb-sm"
                                   :src="img" mode="widthFix" @click.stop="viewImage(comment.images, img)"></image>
                        </view>
            			<view class="margin-top-sm flex justify-between">
            				<view class="text-gray text-df">{{comment.created | timeFormatter}}</view>
            				<view>
            					<text class="cuIcon-more text-gray" @click.stop="commentOperate(item)"></text>
            				</view>
            			</view>
            		</view>
            	</view>
            </view>
            
            <view class="cu-load text-gray" :class="[loadStatus]"></view>
        </scroll-view>
        
        <view class="input-bar my-shadow" v-show="!textAreaShow">
            <view class="cu-bar input input-bar-header">
                <view class="cu-avatar round"
                      :style="[{ 'backgroundImage': 'url(' + userInfo.avatar + ')'}]">
                </view>
            	<input :adjust-position="false" class="input-background" :placeholder="inputTextDisplay" placeholder-class="text-gray"
                       maxlength="300" :disabled="true" @click="textAreaShow = true"></input>
            	<button class="cu-btn bg-green shadow-blur" :disabled="sendBtnLoading" @click="subCommentBtnClick">发送</button>
            </view>
        </view>
        
        
        
        <view class="my-textarea bg-white my-shadow" v-show="textAreaShow">
            <view class="textarea-container align-center">
                <view class="textarea-input">
                    <form>
                        <view class="cu-form-group input-background">
                        	<textarea maxlength="500" v-model="subCommentForm.content" cursor-spacing="50"
                                      :focus="textAreaShow" @blur="textAreaShow = false" :fixed="true"/>
                        </view>
                    </form>
                </view>
                <view class="textarea-button">
                    <button class="cu-btn bg-green shadow-blur" :disabled="sendBtnLoading" @click="subCommentBtnClick">发送</button>
                </view>
            </view>
        </view>
        <view :style="{ height: inputBarHeaderHeight + 'px'}"></view>
	</view>
</template>

<script>
    import { stampFormatter } from '../../common/utils.js'
    
	export default {
        onLoad(options) {
            console.log(options)
            if (this.$store.getters.hasComment) {
                this.comment = this.$store.getters.comment
                this.commentFloor = options.floor
                this.isHoster = options.hoster == "true"
                this.pageLoaded = true
            } else {
                console.log("no comment in Vuex")
            }
        },
        onReady() {
            let inputBarHeader = uni.createSelectorQuery().select(".input-bar-header")
            inputBarHeader.boundingClientRect(data => {
                this.inputBarHeaderHeight = data.height
            }).exec()
        },
		data() {
			return {
                pageLoaded: false,
				inputBarHeaderHeight: 0,
                isHoster: false,
                
                comment: {},
                commentFloor: 0,
                targetComment: {},
                subCommentForm: {
                    content: ""
                },
                textAreaShow: false,
                sendBtnLoading: false,
                
                pageSize: 10,
                curPage: 0,
                total: -1,
                pageLoading: false,
                loadStatus: "loading",
			};
		},
        methods: {
            backClickHandler() {
                this.$store.dispatch({
                    type: "clearComment"
                }).then(() => {
                    this.$refs.nav.backPage()
                }).catch(err => {
                    console.log("err in comment backpage")
                })
                
            },
            loadMoreHandler() {
                console.log("load more")
            },
            subCommentBtnClick() {
                console.log("send")
            },
            viewImage(urls, img) {
                uni.previewImage({
                	urls: urls,
                	current: img
                });
            },
            commentOperate(item) {
                if (this.isHoster || this.comment.author.author_id == this.userInfo.uid) {
                    this.$refs.menu.showMenu([2, 3]).then(res => {
                        if (res == 0) {
                            console.log("report")
                        } else {
                            console.log("delete")
                        }
                    }).catch(() => {})
                } else {
                    this.$refs.menu.showMenu([3]).then(() => {
                        console.log("report")
                    }).catch(() => {})
                }
            },
        },
        computed: {
            scrollViewHeight() {
                return this.$store.getters.windowHeight + 'px'
            },
            userInfo() {
                return this.$store.getters.userInfo
            }
        },
        filters: {
            timeFormatter(val) {
                return stampFormatter(val, "Y-m-d")
            }
        }
	}
</script>

<style lang="less">
.my-image {
    width: 100%;
}

.input-bar {
    position: fixed;
    bottom: 0;
    width: 100%;
}

.my-textarea {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 170rpx;
    z-index: 10;
    .textarea-container {
        height: 100%;
        display: flex;
        .textarea-input {
            flex: 4;
            margin: 20rpx;
            textarea {
                margin: 0;
            }
        }
        .textarea-button {
            flex: 1;
            .cu-btn {
                margin: 0 auto;
            }
        }
    }
    
}

.my-shadow {
    box-shadow: 0rpx 0rpx 15rpx rgba(0, 0, 0, 0.15);
}
.input-background {
    border-radius: 10rpx;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 5rpx 10rpx;
}
</style>
