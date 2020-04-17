<template>
    <view class="cu-modal bottom-modal" :class="{ show: isShow }" @click="hideMenu">
    	<view class="cu-dialog">
            <view class="container bg-white">
                <view class="menu-box">
                        <view class="menu-box-item" v-for="(item, index) in showList" :key="index"
                              @click.stop="menuClick(index)">
                        	<view class="item-icon" :class="[item.bg]">
                                <text :class="item.icon"></text>
                            </view>
                            <view class="item-text">{{item.text}}</view>
                        </view>
                </view>
                <view class="solids-top button-box" @click="hideMenu">取消</view>
            </view>
    	</view>
    </view>
</template>

<script>
    // 0: 分享   1: 收藏(不使用)   2: 举报   3: 删除  4: 加精  5: 取消加精
    export default {
        name: "Menu",
        data() {
            return {
                isShow: false,
                rawList: [
                    {
                        text: "分享",
                        icon: "cuIcon-share",
                        bg: "bg-green"
                    },
                    {
                        text: "收藏",
                        icon: "cuIcon-favor",
                        bg: "bg-yellow"
                    },
                    {
                        text: "举报",
                        icon: "cuIcon-attentionforbid",
                        bg: "bg-grey"
                    },
                    {
                        text: "删除",
                        icon: "cuIcon-delete",
                        bg: "bg-red"
                    },
                    {
                        text: "加精",
                        icon: "cuIcon-selection",
                        bg: "bg-yellow"
                    },
                    {
                        text: "取消加精",
                        icon: "cuIcon-selection",
                        bg: "bg-yellow"
                    }
                ],
                currentAction: {},
                choices: []
            }
        },
        methods: {
            hideMenu() {
                this.isShow = false
                this.currentAction.reject()
            },
            showMenu(choices=[0, 1, 2, 3]) {
                this.choices = choices
                this.isShow = true
                return new Promise((resolve, reject) => {
                    this.currentAction = { resolve, reject }
                })
            },
            menuClick(index) {
                // console.log(index)
                this.isShow = false
                this.currentAction.resolve(index)
            }
        },
        computed: {
            showList() {
                let res = []
                for (let i of this.choices) {
                    res.push(this.rawList[i])
                }
                return res
            }
        }
    }
</script>

<style lang="less">
.cu-dialog {
    background-color: transparent !important;
    .container {
        border-radius: 20rpx 20rpx 0rpx 0rpx;
        .menu-box {
            height: 200rpx;
            padding: 10rpx 30rpx;
            display: flex;
            .menu-box-item {
                flex: 1;
                padding-top: 20rpx;
                .item-icon {
                    width: 96rpx;
                    height: 96rpx;
                    border-radius: 15rpx;
                    margin: 0 auto;
                    position: relative;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text {
                        font-size: 45rpx;
                        color: white;
                    }
                }
                .item-text {
                    margin-top: 10rpx;
                }
            }
        }
        .button-box {
            height: 85rpx;
            line-height: 85rpx;
        }
    }
}
</style>
