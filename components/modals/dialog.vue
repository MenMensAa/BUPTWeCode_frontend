<template>
    <view class="cu-modal" :class="{show: isShow}">
    	<view class="cu-dialog">
    		<view class="cu-bar bg-white justify-end">
    			<view class="content">
                    <text class="cuIcon-info"></text>{{title}}
                </view>
    			<view class="action" @click="cancelHandler">
    				<text class="cuIcon-close text-red"></text>
    			</view> 
    		</view>
    		<view class="padding-xl">
    			{{content}}
    		</view>
            <view class="cu-bar bg-white justify-center">
                <view class="action">
                    <button class="cu-btn line-green text-green" @click="cancelHandler" :disabled="cancelLoading">
                        <template v-if="cancelLoading">
                            <text class="cuIcon-loading2 cuIconfont-spin padding-sm"></text>
                        </template>
                        {{cancelText}}
                    </button>
                    <button class="cu-btn bg-green margin-left" @click="confirmHandler" :disabled="confirmLoading">
                        <template v-if="confirmLoading">
                            <text class="cuIcon-loading2 cuIconfont-spin padding-sm"></text>
                        </template>
                        {{confirmText}}
                    </button>
                </view>
            </view>
    	</view>
    </view>
</template>

<script>
    export default {
        name: "Dialog",
        props: {
            cancelWait: {
                type: Boolean,
                default: false
            },
            confirmWait: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                isShow: false,
                confirmLoading: false,
                cancelLoading: false,
                
                title: "提示",
                content: "内容",
                cancelText: "取消",
                confirmText: "确认",
                currentAction: {}
            }
        },
        methods: {
            showDialog(params) {
                this.title = params.title || "提示"
                this.content = params.content || "内容"
                this.cancelText = params.cancelText || "取消"
                this.confirmText = params.confirmText || "确认"
                this.isShow = true
                return new Promise((resolve, reject) => {
                    this.currentAction = { resolve, reject }
                })
            },
            cancelHandler() {
                if (this.cancelWait) {
                    this.$emit("cancel")
                } else {
                    this.reject()
                }
            },
            confirmHandler() {
                if (this.confirmWait) {
                    this.$emit("confirm")
                } else {
                    this.resolve()
                }
            },
            enableBtn() {
                this.btnLoading = false
            },
            resolve() {
                this.isShow = false
                this.currentAction.resolve()
            },
            reject() {
                this.isShow = false
                this.currentAction.reject()
            }
        }
    }
</script>

<style>
</style>
