<template>
	<view class="about-container bg-white">
        
        <image src="../../static/logo.png" mode="widthFix" class="logo animation-fade" v-if="logoFlag"></image>
        <image src="../../static/text_logo.png" mode="widthFix" class="text-logo animation-fade" v-if="logoFlag"></image>
        <image src="../../static/xiaochuan.png" mode="widthFix" class="bg-image animation-slide-bottom" v-if="bgImageFlag"></image>

        <view class="desc text-gray animation-scale-down" v-if="descFlag">
            <ul>
                <li class="github-links">开源地址</li>
                <li class="github-links">
                    <text class="cuIcon-github"></text>
                    MenMensAa/BUPTWeCode_frontend
                </li>
                <li class="github-links">
                    <text class="cuIcon-github"></text>
                    MenMensAa/BUPTWeCode_backend
                </li>
                <li class="logos">
                    <image src="../../static/uni-app.png" mode="widthFix" class="other-logo"></image>
                    <image src="../../static/color-ui.png" mode="widthFix" class="other-logo"></image>
                    <image src="../../static/flask-icon.png" mode="widthFix" class="other-logo"></image>
                </li>
                <li>v1.0.0</li>
            </ul>
        </view>
        <template v-if="btnFlag">
            <button class="cu-btn margin-xl login-btn round animation-scale-up" @click="backPage">
                <text class="cuIcon-back"></text>
            </button>
        </template>
	</view>
</template>

<script>
	export default {
		onReady() {
		    setTimeout(() => {
		        this.bgImageFlag = true
		    }, 1000)
		    setTimeout(() => {
		        this.logoFlag = true
		    }, 2000)
		    setTimeout(() => {
		        this.descFlag = true
		    }, 3000)
		    setTimeout(() => {
		        this.btnFlag = true
		    }, 4000)
		},
		data() {
			return {
				btnLoading: false,
		        
		        bgImageFlag: false,
		        logoFlag: false,
		        descFlag: false,
		        btnFlag: false
			}
		},
        methods: {
            backPage() {
                uni.navigateBack({
                	delta: 1
                });
            }
        }
	}
</script>

<style lang="less">
.about-container {
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: #fff6e6;
    .bg-image {
        width: 100%;
        position: fixed;
        bottom: 0;
        left: 0;
    }
    .logo {
        height: 200rpx;
        width: 200rpx;
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        top: 15%;
    }
    .text-logo {
        height: 120rpx;
        width: 316rpx;
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        top: 30%;
    }
    .desc {
        position: absolute;
        top: 40%;
        text-align: center;
        width: 100%;
        li {
            margin-top: 50rpx;
        }
        .logos {
            display: flex;
            margin: 100rpx 200rpx 0rpx 200rpx;
            .other-logo {
                flex: 1;
                justify-content: space-around;
                height: 64rpx;
                width: 64rpx;
                padding: 0rpx 20rpx;
            }
        }
    }
    .login-btn {
        background-color: #dbd4cb;
        position: absolute;
        left: 0;
        top: 0;
    }
}
</style>

