<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" :isBack="true" ref="nav">
			<block slot="backText">返回</block>
			<block slot="content">反馈</block>
		</cu-custom>
		<my-dialog ref="dialog"></my-dialog>
		<my-modal ref="modal"></my-modal>
		<my-toast ref="toast"></my-toast>

		<!-- 第一界面 -->

		<view v-if="isContentShow">
			<view class="cu-bar bg-white solid-bottom margin-top">
				<view class="action">
					<text class="cuIcon-title text-orange"></text> 请选择反馈类型
				</view>
			</view>
			<view class="tips text-gray margin-tb-sm text-center">
				您的反馈将发送给小程序开发者
			</view>
			<view class="cu-list menu sm-border card-menu margin-top">
				<template v-for="(val, index) in feedbackList">
					<view :key="val.id" class="cu-item arrow" @click="feedbackClick(index)">
						<view class="content">
							<text class="text-black">{{val.name}}</text>
						</view>
					</view>
				</template>
			</view>
		</view>

		<!-- 第二界面 -->

		<form v-else>
			<view class="cu-form-group">问题描述</view>
			<view class="cu-form-group">
				<textarea placeholder="请详细描述您遇到的问题,我们将尽快给予您反馈(请输入最少10字)" class="editor-textarea text-xl" v-model="feedbackForm.content"
				 id="text" />
				</view>
				
				<view class="cu-bar bg-white">
					<view class="action">
						图片上传
					</view>
					<view class="action">
						{{tmpImages.length}}/4
					</view>
				</view>
				<view class="cu-form-group">
					<view class="grid col-4 grid-square flex-sub">
						<view class="bg-img" v-for="(item,index) in tmpImages" :key="index" @click="viewImage(item)">
							<image :src="item" mode="aspectFill"></image>
							<view class="cu-tag bg-red" @click.stop="delImageHandler(index)">
								<text class='cuIcon-close'></text>
							</view>
						</view>
						<view class="solids" @click="chooseImage" v-if="tmpImages.length < 4">
							<text class='cuIcon-cameraadd'></text>
						</view>
					</view>
				</view>
				
				<view class="cu-form-group margin-top">
					<text class="title">邮箱联系方式</text>
					<input type="email" v-model="feedbackForm.email" placeholder="请输入邮箱以便我们与您取得联系" />
				</view>
				
				<view class="padding">
					<button class="cu-btn block bg-green margin-tb-sm lg" 
									:disabled="btnLoading"
									@click="submitBtnClick">
									提交</button>
				</view>
			</form>
	</view>
</template>

<script>
	import { imageUploader } from '../../common/image_uploader.js'
	import { POST_feedback_submitBtnClick } from '../../network/functions.js'
	export default {
		data() {
			return {
				isContentShow: 1,
				btnLoading: false,
				feedbackList: [
					{ name: "功能异常"},
					{ name: "账号异常"},
					{ name: "产品建议"},
				],
				feedbackForm: {
					email:"",
				    content: "",
				    images: [],
					category: ""
				},
				tmpImages: [],
				isDisabled: false
			}
		},
		methods: {
				feedbackClick(index) {
				    this.isContentShow--;
					if (index === 0) this.feedbackForm.category = "useFeedback"
					else if (index === 1) this.feedbackForm.category = "accountFeedback"
					else if (index === 2) this.feedbackForm.category = "adviceFeedback"
					// console.log(this.feedbackForm.category)
				},
				chooseImage() {
					uni.chooseImage({
						count: 4 - this.tmpImages.length, //默认9
						sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
						sourceType: ['album'], //从相册选择
						success: (res) => {
							if (this.tmpImages.length != 0) {
								this.tmpImages = this.tmpImages.concat(res.tempFilePaths)
							} else {
								this.tmpImages = res.tempFilePaths
							}
				            for (let imagePath of res.tempFilePaths) {
				                imageUploader(imagePath, callback => {
				                    // do something
				                }).then(res => {
				                    this.$refs.toast.showToast("图片上传成功")
				                    this.feedbackForm.images.push(this.$store.getters.imageDomain+res.imageURL)
				                }).catch(err => {
				                    this.$refs.toast.showToast("图片上传失败")
				                    if (this.$store.getters.debug) {
				                        console.log("editor uploadImage", err)
				                    }
				                })
				            }
						}
					});
				},
				viewImage(item) {
				    uni.previewImage({
				    	urls: this.feedbackForm.images,
				    	current: item
				    });
				},
				delImageHandler(index) {
				    this.$refs.dialog.showDialog({
				        title: "提示",
				        content: "是否删除这张图片?",
				        cancelText: "手滑了"
				    }).then(() => {
				        this.feedbackForm.images.splice(index, 1)
				        this.tmpImages.splice(index, 1)
				        this.$refs.toast.showToast("删除成功")
				    }).catch(() => {
				        this.$refs.toast.showToast("取消删除")
				    })
				},
				submitBtnClick() {
					if (this.feedbackForm.content.length < 10) {
				        this.$refs.modal.showModal("提示", "请提交10字及以上的内容~")
				    } else if (this.feedbackForm.images.length != this.tmpImages.length) {
						this.$refs.toast.showToast("图片上传中...")
                    } else if (this.feedbackForm.email.length === 0){
                        this.$refs.modal.showModal("提示", "请输入联系邮箱")
                    } else {
                        this.btnLoading = true
                        POST_feedback_submitBtnClick(this.feedbackForm).then(res => { 
                            this.$refs.nav.backPage({toast: "提交成功，感谢您的反馈!"})
                        }).catch(err => {
                            this.$refs.modal.showModal("提示", err.message)
                            if (this.$store.getters.debug) {
                                console.log('feedback submitBtnClick', err)
                            }
                        }).finally(() => {
                            this.btnLoading = false
                        })																
                    }
			},
				
	},
}	
</script>

<style>
.cu-form-group .title {
    min-width: calc(4em + 15px);
}
</style>
