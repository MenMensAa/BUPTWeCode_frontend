<template>
    <view class="cu-modal bottom-modal" :class="{ 'show': isShow }" @click="hideSelector">
    	<view class="cu-dialog" @click.stop="">
    		<view class="cu-bar bg-white">
    			<view class="action text-blue" @click="hideSelector">取消</view>
    			<view class="action text-green" @tap="confirmSelector">确定</view>
    		</view>
    		<view class="grid padding-sm" :class="['col-'+grim]">
    			<view v-for="(item,index) in datas" class="padding-xs" :key="index">
    				<button class="cu-btn blue lg block" @click="btnClickHandler(item)"
                            :class="[boxClass(item)]"> 
                        {{item[displayStr]}}
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
                datas: [],
                grim: 3,
                displayStr: "name",
                checkedStr: "id",
                selectedItem: {},
                currentAction: {}
            }
        },
        methods: {
            showSelector(options={}) {
                this.datas = options.datas || []
                this.grim = options.grim || 3
                this.displayStr = options.displayStr || "name"
                this.checkedStr = options.checkedStr || "id"
                this.isShow = true
                if (!!options.recommand) {
                    this.selectedItem = this.datas[options.recommand]
                }
                return new Promise((resolve, reject) => {
                    this.currentAction = { resolve, reject }
                })
            },
            hideSelector() {
                this.isShow = false
                this.currentAction.reject()
            },
            btnClickHandler(item) {
                this.selectedItem = item
            },
            confirmSelector() {
                this.isShow = false
                if (this.hasSelectedItem) {
                    this.currentAction.resolve(this.selectedItem)
                } else {
                    this.currentAction.reject()
                }
            },
            boxClass(item) {
                if (item[this.checkedStr] == this.selectedItem[this.checkedStr]) {
                    return 'bg-blue'
                }
                return 'line-blue'
            }
        },
        computed: {
            hasSelectedItem() {
                return JSON.stringify(this.selectedItem) != "{}"
            }
        }
    }
</script>

<style>
</style>
