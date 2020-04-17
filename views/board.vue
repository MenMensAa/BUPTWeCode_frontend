<template>
    <view class="bg-white">
        <view class="cu-bar bg-white solid-bottom">
        	<view class="action">
        		<text class="cuIcon-title text-orange"></text> 最近浏览
        	</view>
            <view class="action">
                <button class='cu-btn bg-green shadow' @click="clearBtnHandler">清除</button>
            </view>
        </view>
        <view class="margin-top-xs">
            <template v-if="boardHistory.length === 0">
                <view class="text-grey" style="text-align: center;">最近浏览过的历史会出现在这里哟</view>
            </template>
            <template v-else>
                <scroll-view scroll-x="true" class="board-history-view">
                    <view class="board-history-view-item margin-lr-xs margin-top-xs"
                          v-for="(item, index) in boardHistory" :key="index" @click="boardClick(item)">
                        <view class="cu-avatar radius history-avatar" :style="{'background-image': 'url('+item.avatar+')'}"></view>
                        <view class="text-gray history-name"><text>{{item.name}}</text></view>
                    </view>
                </scroll-view>
            </template>
        </view>
        <view class="cu-bar solid-bottom margin-top-xs">
        	<view class="action">
        		<text class="cuIcon-title text-orange"></text> 所有板块
        	</view>
            <view class="action">
                <switch class='switch-sex' @click="swichBtnHandler" :class="isSwitch?'checked':''" :checked="isSwitch?true:false"></switch>
            </view>
        </view>
        <template v-if="isSwitch">
            <view class="cu-list menu sm-border">
                <view class="cu-item" v-for="(item, index) in boardList" :key="index" @click="boardClick(item)">
                    <view class="content">
                        <image :src="item.avatar" mode="aspectFill"></image>
                        <text class="text-grey">{{item.name}}</text>
                    </view>
                </view>
            </view>
        </template>
        
        <template v-else>
            <view class="cu-list grid col-4">
                <view class="cu-item" v-for="(item,index) in boardList" :key="index" @click="boardClick(item)">
                    <view class="cu-avatar radius board-avatar" :style="{'background-image': 'url('+item.avatar+')'}"></view>
                    <text>{{item.name}}</text>
                </view>
            </view>
        </template>
        
    </view>
</template>

<script>
    import { GET_board_mounted } from '../network/functions.js'
    
    export default {
        name: "Board",
        mounted() {
            if (!this.$store.getters.boardLoaded) {
                GET_board_mounted().then(res => {
                    this.$store.dispatch("setBoardList", {
                        boards: res.data.boards
                    })
                }).catch(err => {
                    if (this.$store.getters.debug) {
                        console.log('board mounted', err)
                    }
                })
            }
        },
        methods: {
            swichBtnHandler() {
                this.$store.dispatch({
                    type: 'setBoardStyle'
                })
            },
            boardClick(item) {
                uni.navigateTo({
                    url: '/pages/board/board?board_id=' + item.board_id
                })
            },
            clearBtnHandler() {
                this.$store.dispatch({
                    type: "clearBoardHistory"
                })
            }
        },
        computed: {
            isSwitch() {
                return this.$store.getters.boardStyle
            },
            boardList() {
                return this.$store.getters.boardList
            },
            boardHistory() {
                return this.$store.getters.boardHistory
            }
        }
    }
</script>

<style lang="less">
.board-avatar {
    margin: 0 auto;
    display: block;
}
.history-avatar {
    .board-avatar;
    position: absolute;
    left: 0;
    right: 0;
    top: 20%;

}
.switch-sex::after {
	content: "\e700";
}
.switch-sex::before {
	content: "\e729";
}

.board-history-view {
    height: 250rpx;
    white-space: nowrap;
    width: 100%;
    .board-history-view-item {
        width: 24%;
        height: 92%;
        display: inline-block;
        vertical-align: top;
        position: relative;
        border-radius: 13rpx;
        box-shadow: 0rpx 0rpx 15rpx rgba(0,0,0,0.1)
    }
}

.history-name {
    text-align: center;
    position: absolute;
    left: 0;
    right: 0;
    top: 67%;
}
</style>
