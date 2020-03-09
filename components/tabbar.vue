<template>
	<view class="main-tabbar">
        <my-modal ref="modal"></my-modal>
	    <view class="cu-bar tabbar bg-white">
	    	<view :class="['action', activeIndex == 0 ? 'text-blue':'text-gray']"
                  @click="tabbarClick(0)">
	    		<view class="cuIcon-homefill"></view> 首页
	    	</view>
	    	<view :class="['action', activeIndex == 1 ? 'text-blue':'text-gray']"
                  @click="tabbarClick(1)">
	    		<view class="cuIcon-search"></view> 搜索
	    	</view>
	    	<view class="action text-gray add-action">
	    		<button class="cu-btn cuIcon-add bg-blue shadow" @click="addPostHandler"></button>
	    		发布
	    	</view>
	    	<view :class="['action', activeIndex == 2 ? 'text-blue':'text-gray']"
                  @click="tabbarClick(2)">
	    		<view class="cuIcon-message">
	    			<view class="cu-tag badge">99</view>
	    		</view>
	    		消息
	    	</view>
	    	<view :class="['action', activeIndex == 3 ? 'text-blue':'text-gray']"
                  @click="tabbarClick(3)">
	    		<view class="cuIcon-my">
	    			<view class="cu-tag badge"></view>
	    		</view>
	    		Me
	    	</view>
	    </view>
	</view>
</template>

<script>
	export default {
        name: "Tabbar",
		data() {
			return {
				activeIndex: 0,
			};
		},
        methods: {
            tabbarClick(index) {
                if (this.activeIndex != index) {
                    this.activeIndex = index,
                    this.$emit('tabbarClick', index)
                }
            },
            addPostHandler() {
                if (this.$store.getters.isLogged) {
                    uni.navigateTo({
                        url: '/pages/editor/editor'
                    })
                } else {
                    this.$refs.modal.showModal("提示", "请登陆后再发帖哟")
                }
                
            }
        }
	}
</script>

<style>

.main-tabbar {
    position: fixed;
    bottom: 0;
    width: 100%;
}
</style>
