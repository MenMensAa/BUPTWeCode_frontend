<template>
    <view class="cu-bar tabbar bg-white">
        <view class="action">
            <view class="cuIcon-attention"></view>
            {{views}}
        </view>
        <view class="action" @click="likeClick">
            <view class="cuIcon-like" v-if="!liked"></view>
            <view class="cuIcon-likefill text-red" v-else></view>
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
            liked: {
                type: Boolean,
                default: false
            },
            comments: {
                type: Number,
                default: 0
            }
        },
        methods: {
            operateClickHandler() {
                this.$emit("operate")
            },
            likeClick() {
                this.$emit("like")
            }
        }
	}
</script>

<style>

</style>
