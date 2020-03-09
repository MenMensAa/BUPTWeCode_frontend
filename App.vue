<script>
    import Vue from 'vue'
    import { GET_me_mounted } from 'network/functions.js'
    
	export default {
		onLaunch: function() {
			console.log('App Launch')
            // if (this.$store.getters.isLogged) {
            //     GET_me_mounted().then(res => {
            //         this.$store.commit({
            //             type: 'updateUser',
            //             userInfo: res.data
            //         })
            //     }).catch(err => {
            //         this.$store.commit({
            //             type: 'clearUser'
            //         })
            //         this.$store.commit({
            //             type: 'unsetToken'
            //         })
            //         this.$refs.modal.showModal("错误", "读取用户信息错误，请重新登陆")
            //         if (this.$store.getters.debug) {
            //             console.log("me mounted", err)
            //         }
            //     })
            // }
            uni.getSystemInfo({
            	success: function(e) {
            		// #ifndef MP
            		Vue.prototype.StatusBar = e.statusBarHeight;
            		if (e.platform == 'android') {
            			Vue.prototype.CustomBar = e.statusBarHeight + 50;
            		} else {
            			Vue.prototype.CustomBar = e.statusBarHeight + 45;
            		};
            		// #endif
            		// #ifdef MP-WEIXIN
            		Vue.prototype.StatusBar = e.statusBarHeight;
            		let custom = wx.getMenuButtonBoundingClientRect();
            		Vue.prototype.Custom = custom;
            		Vue.prototype.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
            		// #endif		
            		// #ifdef MP-ALIPAY
            		Vue.prototype.StatusBar = e.statusBarHeight;
            		Vue.prototype.CustomBar = e.statusBarHeight + e.titleBarHeight;
            		// #endif
            	}
            })
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
    @import "/colorui/main.css";
    @import "/colorui/icon.css";
    @import "/colorui/animation.css";
</style>
