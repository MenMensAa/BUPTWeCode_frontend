<template>
    <view class="cu-modal" :class="{show: isShow}">
    	<view class="cu-dialog">
    		<view class="cu-bar bg-white justify-end">
    			<view class="content">
                    <text class="cuIcon-info"></text>{{modalData.title}}
                </view>
    			<view class="action" @click="hideModal">
    				<text class="cuIcon-close text-red"></text>
    			</view> 
    		</view>
    		<view class="padding-xl">
    			{{modalData.content}}
    		</view>
    	</view>
    </view>
</template>

<script>
    export default {
        name: "Modal",
        // props: {
        //     title: String,
        //     content: String
        // },
        data() {
            return {
                isShow: false,
                modalData: {
                    title: "",
                    content: ""
                }
            }
        },
        methods: {
            showModal(title, content) {
                this.modalData.title = " " + title
                this.modalData.content = content
            	this.isShow = true
            },
            hideModal() {
            	this.isShow = false
            },
        }
    }
</script>

<style>
</style>
