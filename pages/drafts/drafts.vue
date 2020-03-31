<template>
	<view>
		<my-nav bgColor="bg-gradual-blue" :isBack="true">
		    <block slot="backText">返回</block>
			<block slot="content">草稿箱</block>
		</my-nav>
        <my-dialog ref="dialog"></my-dialog>
        <my-modal ref="modal"></my-modal>
        <my-toast ref="toast"></my-toast>
        
        <view class="tips text-gray margin-tb-sm">
            草稿箱仅展示本地内容
        </view>
        
        <view class="cu-card article" v-for="(item, index) in drafts" :key="index" @click="draftClick(index)">
        	<view class="cu-item shadow draft-card">
        		<view class="title">
                    <view class="text-cut">{{item.draft.title | titleFilter}}</view>
                </view>
        		<view class="content">
                    <template v-if="item.draft.images.length > 0">
                        <image :src="item.draft.images[0]" mode="aspectFill"></image>
                    </template>
        			<view :class="{ desc: item.draft.images.length > 0 }">
        				<view class="text-content">{{item.draft.content | contentFilter}}</view>
        			</view>
        		</view>
                <view class="draft-card-time">{{item.created | timeFormatter}}</view>
                <view class="draft-card-del cuIcon-delete" @click.stop="delDraftClick(index)"></view>
        	</view>
        </view>
	</view>
</template>

<script>
    import { stampFormatter } from '../../common/utils.js'
    
	export default {
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
			draftClick(index) {
                uni.navigateTo({
                    url: '/pages/editor/editor' + '?index=' + index
                })
            },
            delDraftClick(index) {
                this.$refs.dialog.showDialog({
                    "title": "提示",
                    "content": "是否删除该草稿？"
                }).then(() => {
                    this.$store.dispatch({
                        type: 'deleteDraft',
                        index: index
                    }).then(() => {
                        // this.$refs.modal.showModal("提示", "删除成功")
                        this.$refs.toast.showToast("删除成功")
                    }).catch(err => {
                        console.log(err)
                        this.$refs.modal.showModal("提示", "删除失败...")
                    })
                }).catch(() => {})
            },
		},
        filters: {
            titleFilter(val) {
                return val === "" ? "没有标题" : val
            },
            contentFilter(val) {
                return val === "" ? "没有内容" : val
            },
            timeFormatter(value) {
                return stampFormatter(value/1000, "Y-m-d")
            }
        },
        computed: {
            drafts() {
                return this.$store.getters.drafts
            }
        },
	}
</script>

<style lang="less">
.draft-card {
    position: relative;
    .draft-card-time {
        position: absolute;
        bottom: 4px;
        right: 10px;
        font-size: 12px;
        font-style: italic;
    }
    .draft-card-del {
        position: absolute;
        right: 5px;
        top: 4px;
        font-size: 16px;
    }
}

.tips {
    text-align: center;
    font-size: 34rpx;
}
</style>
