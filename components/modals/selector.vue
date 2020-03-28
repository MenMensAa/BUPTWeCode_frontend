<template>
    <view class="cu-modal bottom-modal" :class="{ 'show': isShow }" @click="hideSelector">
    	<view class="cu-dialog" @click.stop="">
    		<view class="cu-bar bg-white">
    			<view class="action text-blue" @click="cancelSelector">取消</view>
    			<view class="action text-green" @tap="confirmSelector">确定</view>
    		</view>
    		<view class="grid padding-sm" :class="['col-'+grim]">
    			<view v-for="(item,index) in datas" class="padding-xs" :key="index">
    				<button class="cu-btn blue lg block" @click="btnClickHandler(item)"
                            :class="[boxClass(item)]"> 
                        {{item[display]}}
    				</button>
    			</view>
    		</view>
    	</view>
    </view>
</template>

<script>
    export default {
        name: "Selector",
        data() {
            return {
                isShow: false,
                firstClick: false,
                selectedItem: {}
            }
        },
        props: {
            datas: {
                type: Array,
                default: []
            },
            display: String,
            checked: String,
            grim: {
                type: Number,
                default: 3
            }
        },
        methods: {
            showSelector() {
                this.isShow = true
            },
            hideSelector() {
                this.isShow = false
            },
            cancelSelector() {
                this.isShow = false
                this.$emit("cancel")
            },
            btnClickHandler(item) {
                this.firstClick = true
                this.selectedItem = item
            },
            confirmSelector() {
                this.isShow = false
                this.$emit("confirm", this.selectedItem)
            },
            setSelectedItem(item) {
                this.selectedItem = item
            },
            boxClass(item) {
                if (this.firstClick) {
                    if (item[this.checked] == this.selectedItem[this.checked]) {
                        return 'bg-blue'
                    }
                }
                return 'line-blue'
            }
        },
    }
</script>

<style>
</style>
