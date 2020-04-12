<template>
	<view>
        <my-nav bgColor="bg-gradual-blue" :isBack="true" ref="nav">
        	<block slot="backText">返回</block>
        	<block slot="content">资料</block>
        </my-nav>
		This is Profile Page
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
