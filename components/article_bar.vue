<template>
		<view class="box">
			<view class="cu-bar tabbar bg-white">
				<view class="action">
					<view class="cuIcon-attention"></view>
					{{views}}
				</view>
				<view class="action">
					<view class="cuIcon-like"></view>
					{{likes}}
				</view>
				<view class="action">
					<view class="cuIcon-message"></view>
					{{comments}}
				</view>
				<view class="action">
					<view class="cuIcon-forwardfill" @click="operateClickHandler"></view>
					操作
				</view>
			</view>
        </view>
</template>

<script>
	export default {
		name: "ArticleBar",
        props: {
            views: {
                type: Number,
                default: 0
            },
            likes: {
                type: Number,
                default: 0
            },
            comments: {
                type: Number,
                default: 0
            }
        },
        methods: {
            operateClickHandler() {
                this.$emit("operate")
            }
        }
	}
</script>

<style>

</style>
