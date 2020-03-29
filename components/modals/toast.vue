<template>
    <view v-show="isShow">
        <view class="toast animation-fade" v-if="!isReverse">
            {{content}}
        </view>
        <view class="toast animation-reverse animation-fade" v-else>
            {{content}}
        </view>
    </view>
    
</template>
 
<script>
    export default {
        data() {
            return {
                isShow: false,
                isReverse: false,
                content: "",
                startTimer: null,
                endTimer: null
            };
        },
        methods: {
            clear() {
                this.isShow = false
                if (!!this.startTimer) {
                    clearTimeout(this.startTimer)
                }
                if (!!this.endTimer) {
                    clearTimeout(this.endTimer)
                }
                this.isReverse = false
            },
            showToast(content, duration=1400) {
                this.clear()
                this.content = content
                this.isShow = true
                this.startTimer = setTimeout(() => {
                    this.isReverse = true
                }, 800+duration)
                this.endTimer = setTimeout(() => {
                    this.isReverse = false
                    this.isShow = false
                }, 1600+duration)
            }
        }
    };
</script>
 
<style scoped>
.toast {
    position: fixed;
    top: 75%;
    left: 0;
    color: #fff;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 999;
    padding: 15rpx 20rpx;
    font-size: 28rpx;
    border-radius: 29rpx;
    right: 0;
    margin: auto;
    width: 350rpx;
}

</style>
