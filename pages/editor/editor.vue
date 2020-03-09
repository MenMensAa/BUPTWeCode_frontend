<template>
	<view class="editor bg-white">
        <cu-custom bgColor="bg-gradual-blue" :isBack="true" :close="true"
                   :autoBack="false" @backClick="backClickHandler" ref="nav">
            <block slot="backText">放弃编辑</block>
        	<block slot="content">发布</block>
        </cu-custom>

        <button class="cu-btn round sm" @click="testBtnHandler">测试按钮</button>
        <my-dialog ref="dialog"></my-dialog>
		<my-modal ref="modal"></my-modal>
        <my-toast ref="toast"></my-toast>
        
        <form action="">
            <view class="padding-tb-sm padding-lr-xl solid-bottom text-xxl">
                <textarea maxlength="20"
                          placeholder="来个标题吧..." 
                          v-model="articleForm.title" auto-height></textarea>
            </view>
            <view class="margin-top padding-lr-xl">
                <view>
                    <textarea maxlength="-1" 
                              placeholder="请勿发布含有不当内容的帖子..."
                              class="editor-textarea text-xl"
                              v-model="articleForm.content"
                              ></textarea>
                </view>
                <view class="cu-bar margin-top">
                	<view class="action">
                		图片上传
                	</view>
                	<view class="action">
                		{{tmpImageList.length}}/4
                	</view>
                </view>
                <view class="cu-form-group">
                	<view class="grid col-4 grid-square flex-sub">
                		<view class="bg-img" v-for="(item,index) in tmpImageList" :key="index" @click="viewImage(item)">
                            <image :src="item" mode="aspectFill"></image>
                			<view class="cu-tag bg-red" @click.stop="delImageHandler(index)">
                				<text class='cuIcon-close'></text>
                			</view>
                		</view>
                		<view class="solids" @click="chooseImage" v-if="tmpImageList.length < 4">
                			<text class='cuIcon-cameraadd'></text>
                		</view>
                	</view>
                </view>
            </view>
            <button class="cu-btn block bg-green margin-xl lg" type=""
                    :disabled="btnLoading" @click="publishBtnClick">
                <template v-if="btnLoading">
                    <text class="cuIcon-loading2 cuIconfont-spin padding-sm"></text>
                </template>
                发布
            </button>
        </form>
	</view>
</template>

<script>
    import { imageUploader } from '../../common/image_uploader.js'
    import { POST_editor_publishBtnClick } from '../../network/functions.js'
    
	export default {
        onLoad(options) {
            if (!!options.index) {
                this.articleForm = JSON.parse(JSON.stringify(this.$store.getters.drafts[options.index].draft))
                this.draftIndex = options.index
                this.tmpImageList = JSON.parse(JSON.stringify(this.articleForm.imageList))
            }
        },
		data() {
			return {
                articleForm: {
                    title: "",
                    content: "",
                    imageList: []
                },
                tmpImageList: [],
                draftIndex: -1,
                btnLoading: false
			}
		},
		methods: {
            backClickHandler() {
                if (this.hasContent) {
                    this.$refs.dialog.showDialog({
                        title: "提示",
                        content: "是否保存到草稿箱?"
                    }).then(() => {
                        if (this.draftIndex != -1) {
                            this.$store.dispatch({
                                type: 'updateDraft',
                                index: this.draftIndex,
                                draft: this.articleForm
                            })
                        } else {
                            this.$store.dispatch({
                                type: 'addDraft',
                                draft: this.articleForm
                            })
                        }
                        this.$refs.nav.backPage({toast: "保存成功"})
                    }).catch(() => {
                        this.$refs.nav.backPage()
                    })
                } else {
                    this.$refs.nav.backPage()
                }
            },
            chooseImage() {
            	uni.chooseImage({
            		count: 4 - this.tmpImageList.length, //默认9
            		sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
            		sourceType: ['album'], //从相册选择
            		success: (res) => {
            			if (this.tmpImageList.length != 0) {
            				this.tmpImageList = this.tmpImageList.concat(res.tempFilePaths)
            			} else {
            				this.tmpImageList = res.tempFilePaths
            			}
                        for (let imagePath of res.tempFilePaths) {
                            imageUploader(imagePath, callback => {
                                // do something
                            }).then(res => {
                                this.$refs.toast.showToast("图片上传成功")
                                this.articleForm.imageList.push(this.$store.getters.imageDomain+res.imageURL)
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
                	urls: this.articleForm.imageList,
                	current: item
                });
            },
            delImageHandler(index) {
                this.$refs.dialog.showDialog({
                    title: "提示",
                    content: "是否删除这张图片?",
                    cancelText: "手滑了"
                }).then(() => {
                    this.articleForm.imageList.splice(index, 1)
                    this.tmpImageList.splice(index, 1)
                    this.$refs.toast.showToast("删除成功")
                }).catch(() => {
                    this.$refs.toast.showToast("取消删除")
                })
            },
            publishBtnClick() {
                if (this.articleForm.title === "") {
                    this.$refs.modal.showModal("提示", "帖子标题不能为空！")
                } else if (this.articleForm.content === "") {
                    this.$refs.modal.showModal("提示", "帖子内容不能为空")
                } else if (this.articleForm.imageList.length != this.tmpImageList.length) {
                    this.$refs.toast.showToast("图片上传中...")
                } else {
                    this.btnLoading = true
                    POST_editor_publishBtnClick(3, this.articleForm).then(res => {
                        if (this.draftIndex != -1) {
                            this.$store.dispatch({
                                type: "deleteDraft",
                                index: this.draftIndex
                            }).then(() => {
                                console.log("删除已发布草稿成功")
                            }).catch(err => {
                                console.log("删除已发布草稿失败", err)
                            })
                        }
                        this.$refs.nav.backPage({toast: "发布成功!"})
                    }).catch(err => {
                        let type = this.draftIndex == -1 ? "addDraft" : "updateDraft"
                        this.$store.dispatch({
                            type: type,
                            draft: this.articleForm,
                            index: this.draftIndex
                        }).then(res => {
                            this.$refs.dialog.showDialog({
                                title: "提示",
                                content: "发布失败，已将内容存放至草稿箱"
                            }).then(() => {}).catch(() => {}).finally(() => {
                                this.$refs.nav.backPage()
                            })
                        }).catch(err => {
                            console.log('editor publishBtnClick', err)
                            this.$refs.modal.showModal("提示", "发布失败，保存至草稿箱过程中发生错误")
                        })
                        if (this.$store.getters.debug) {
                            console.log('editor publishBtnClick', err)
                        }
                    }).finally(() => {
                        this.btnLoading = false
                    })
                }
            },
            testBtnHandler() {
                console.log(this.articleForm)
                this.$refs.toast.showToast("这是一个测试toast")
            }
		},
        computed: {
            hasContent() {
                if (!!this.articleForm.title || !!this.articleForm.content || this.articleForm.imageList.length > 0) {
                    return true
                } else {
                    return false
                }
            }
        }
	}
</script>

<style>
.editor {
    /* min-height: 100%; */
    overflow: hidden;
}
.editor-textarea {
    width: 100%;
    height: 600rpx
}
</style>
