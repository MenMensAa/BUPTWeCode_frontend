<template>
	<view>
        <my-nav bgColor="bg-gradual-blue" :isBack="true" ref="nav">
        	<block slot="backText">返回</block>
        	<block slot="content">赞过的帖子</block>
        </my-nav>
		This is Like Page
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		}
	}
</script>

<style lang="less">

</style>
