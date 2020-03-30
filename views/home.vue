<template>
    <view>
        This is Home view
        <my-menu ref="menu"></my-menu>
        <button type="default" @click="testMenuClick">测试menu</button>
    </view>
</template>

<script>
    export default {
        name: "Home",
        methods: {
            testMenuClick() {
                this.$refs.menu.showMenu([2]).then(index => {
                    console.log(index)
                }).catch(() => {
                    console.log("cancel")
                })
            }
        }
    }
</script>

<style>
</style>
