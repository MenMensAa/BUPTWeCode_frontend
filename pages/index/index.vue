<template>
	<view class="index">
        <my-nav bgColor="bg-gradual-blue" :isBack="false">
            <block slot="content">微码小窝</block>
        </my-nav>
        
        <my-toast ref="toast"></my-toast>
        <my-modal ref="modal"></my-modal>
        
        <template v-if="activeIndex === 0">
            <home-view></home-view>
        </template>
        <template v-else-if="activeIndex === 1">
            <board-view></board-view>
        </template>
        <template v-else-if="activeIndex === 2">
            <notify-view @change="countChangeHandler"></notify-view>
        </template>
        <template v-else>
            <me-view></me-view>
        </template>
        <!-- <home-view :class="{ hidden: activeIndex != 0 }"></home-view>
        <board-view :class="{ hidden: activeIndex != 1 }"></board-view>
        <notify-view :class="{ hidden: activeIndex != 2 }" @change="countChangeHandler"></notify-view>
        <me-view :class="{ hidden: activeIndex != 3 }"></me-view> -->
        
        <view class="main-tabbar">
            <view class="cu-bar tabbar bg-white">
            	<view :class="['action', activeIndex == 0 ? 'text-blue':'text-gray']"
                      @click="tabbarClick(0)">
            		<view class="cuIcon-homefill"></view> 首页
            	</view>
            	<view :class="['action', activeIndex == 1 ? 'text-blue':'text-gray']"
                      @click="tabbarClick(1)">
            		<view class="cuIcon-similar"></view> 分类
            	</view>
            	<view class="action text-gray add-action">
            		<button class="cu-btn cuIcon-add bg-blue shadow" @click="addPostHandler"></button>
            		发布
            	</view>
            	<view :class="['action', activeIndex == 2 ? 'text-blue':'text-gray']"
                      @click="tabbarClick(2)">
            		<view class="cuIcon-message">
            			<view class="cu-tag badge"  v-if="newCount > 0">{{newCount}}</view>
            		</view>
            		消息
            	</view>
            	<view :class="['action', activeIndex == 3 ? 'text-blue':'text-gray']"
                      @click="tabbarClick(3)">
            		<view class="cuIcon-my"></view>
            		Me
            	</view>
            </view>
        </view>
        
        <view :style="{ height: fillerHeight + 'px' }"></view>
	</view>
</template>

<script>
    import Home from '../../views/home.vue'
    import Me from '../../views/me.vue'
    import Notify from '../../views/notify.vue'
    import Board from '../../views/board.vue'
    import { GET_notify_rotation } from '../../network/functions.js'
    
	export default {
		data() {
			return {
				activeIndex: 0,
                fillerHeight: 0,
                newCount: 0,
                timer: null
			}
		},
        components: {
            'home-view': Home,
            'me-view': Me,
            'notify-view': Notify,
            'board-view': Board
        },
		onLoad(options) {
            // console.log("load")
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
            GET_notify_rotation().then(res => {
                this.newCount = res.data.new
            }).catch(err => {
                console.log(err)
            })
        },
        onUnload() {
            console.log("unload")
        },
        onHide() {
            console.log("onhide")
            // if (this.timer != null) {
            //     clearInterval(this.timer)
            // }
        },
        onReady() {
            let tabbar = uni.createSelectorQuery().select(".main-tabbar")
            tabbar.boundingClientRect(data => {
                this.fillerHeight = data.height
            }).exec()
        },
		methods: {
            tabbarClick(index) {
                this.activeIndex = index
            },
            addPostHandler() {
                if (this.$store.getters.isLogged) {
                    uni.navigateTo({
                        url: '/pages/editor/editor'
                    })
                } else {
                    this.$refs.modal.showModal("提示", "请登陆后再发帖哟")
                }
            },
            countChangeHandler(newCount) {
                this.newCount = newCount
            }
		},
        computed: {

        }
	}
</script>

<style>
.index {
    position: relative;
    min-height: 100%;
}
.hidden {
    display: none;
}
.main-tabbar {
    position: fixed;
    bottom: 0;
    width: 100%;
}
</style>
