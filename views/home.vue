<template>
    <view>
        <view class="cu-bar search bg-white">
            <view class="search-form round">
                <text class="cuIcon-search"></text>
                <input :adjust-position="false" type="text" maxlength="15"
                       placeholder="搜索帖子" v-model="searchContent"></input>
            </view>
            <view class="action">
                <button class="cu-btn bg-green shadow-blur round" @click="searchBtnClick">搜索</button>
            </view>
        </view>
        <view class="text-grey margin-top" style="text-align: center;" v-if="searchHistories.length == 0">搜索历史最多保存十条</view>
        
        <view class="flex flex-wrap margin-lr">
            <view class="padding-xs" v-for="(item, index) in searchHistories" :key="index">
                <view class="cu-capsule round">
                	<view class="cu-tag bg-grey">
                		{{item}}
                	</view>
                	<view class="cu-tag line-grey" @click="delSearchHistory(index)">
                		<text class="cuIcon-close"></text>
                	</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    export default {
        name: "Home",
        data() {
            return {
                searchContent: ""
            }
        },
        methods: {
            searchBtnClick() {
                this.$store.dispatch({
                    type: "addSearchHistory",
                    content: this.searchContent
                }).then(res => {
                    console.log(this.searchContent)
                    this.searchContent = ""
                }).catch(err => {
                    console.log("searchBtnClick", err)
                })
            },
            delSearchHistory(index) {
                this.$store.dispatch({
                    type: "deleteSearchHistory",
                    index: index
                }).then(() => {}).catch(err => {
                    console.log("delSearchHistory", err)
                })
            }
        },
        computed: {
            searchHistories() {
                return this.$store.getters.searchHistories
            }
        }
    }
</script>

<style>
</style>
