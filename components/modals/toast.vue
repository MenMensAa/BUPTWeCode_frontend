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
            };
        },
        methods: {
            showToast(content, duration=1400) {
                this.content = content
                this.isShow = true
                setTimeout(() => {
                    this.isReverse = true
                }, 800+duration)
                setTimeout(() => {
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
/* 
.toast-enter-active,
.toast-leave-active {
    transition: 2s ease-out;
}
 
.toast-enter {
    opacity: 0;
    transform: scale(1.2);
}
 
.toast-leave-to {
    opacity: 0;
    transform: scale(0.8);
} */
</style>
