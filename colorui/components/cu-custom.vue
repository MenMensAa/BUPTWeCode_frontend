<template>
	<view>
		<view class="cu-custom" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar fixed" :style="style" :class="[bgImage!=''?'none-bg text-white bg-img':'',bgColor]">
				<view class="action" @click="backClick" v-if="isBack">
                    <template v-if="close">
                        <text class="cuIcon-close"></text>
                    </template>
                    <template v-else>
                        <text class="cuIcon-back"></text>
                    </template>
					<slot name="backText"></slot>
				</view>
				<view class="content" :style="[{top:StatusBar + 'px'}]">
					<slot name="content"></slot>
				</view>
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				StatusBar: this.StatusBar,
				CustomBar: this.CustomBar
			};
		},
		name: 'cu-custom',
		computed: {
			style() {
				var StatusBar= this.StatusBar;
				var CustomBar= this.CustomBar;
				var bgImage = this.bgImage;
				var style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
				if (this.bgImage) {
					style = `${style}background-image:url(${bgImage});`;
				}
				return style
			}
		},
		props: {
			bgColor: {
				type: String,
				default: ''
			},
			isBack: {
				type: [Boolean, String],
				default: false
			},
			bgImage: {
				type: String,
				default: ''
			},
            autoBack: {
                type: Boolean,
                default: true
            },
            close: {
                type: Boolean,
                default: false
            }
		},
		methods: {
            backClick() {
                if (this.autoBack) {
                    this.backPage()
                } else {
                    this.$emit("backClick")
                }
            },
			backPage(payload={}) {
				if (getCurrentPages().length < 2 && 'undefined' !== typeof __wxConfig) {
					let url = '/' + __wxConfig.pages[0]
					return uni.redirectTo({url})
				}
                if (Object.keys(payload).length > 0) {
                    this.$store.dispatch('setMessage', payload).then(() => {
                        
                    }).catch(err => {
                        
                    }).finally(() => {
                        uni.navigateBack({
                        	delta: 1
                        });
                    })
                } else {
                    uni.navigateBack({
                    	delta: 1
                    });
                }
			}
		}
	}
</script>

<style>

</style>
