<template>
	<view class="index">
        <cu-custom bgColor="bg-gradual-blue" :isBack="false">
            <block slot="content">微码小窝</block>
        </cu-custom>
        
        <my-toast ref="toast"></my-toast>
        
        <template v-if="activeIndex == 0">
            <home-view></home-view>
        </template>
        <template v-else-if="activeIndex == 1">
            <board-view></board-view>
        </template>
        <template v-else-if="activeIndex == 2">
            <message-view></message-view>
        </template>
        <template v-else>
            <me-view></me-view>
        </template>
        <tab-bar @tabbarClick="tabbarClick"></tab-bar>
        <view class="tabbar-filler"></view>
	</view>
</template>

<script>
    import Tabbar from '../../components/tabbar.vue'
    import Home from '../../views/home.vue'
    import Me from '../../views/me.vue'
    import Message from '../../views/message.vue'
    import Board from '../../views/board.vue'
    
	export default {
		data() {
			return {
				activeIndex: 0
			}
		},
        components: {
            'tab-bar': Tabbar,
            'home-view': Home,
            'me-view': Me,
            'message-view': Message,
            'board-view': Board
        },
		onLoad(options) {
            
		},
        onShow() {
            if (this.$store.getters.hasNewMsg) {
                let message = this.$store.getters.msg
                if (!!message.toast) {
                    this.$refs.toast.showToast(message.toast)
                    this.$store.dispatch({
                        type: 'clearMessage'
                    })
                }
            }
        },
		methods: {
            tabbarClick(index) {
                this.activeIndex = index
            }
		}
	}
</script>

<style>
.index {
    position: relative;
    min-height: 100%;
}
.tabbar-filler {
    height: 140rpx;
}
</style>
