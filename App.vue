<script>
    import Vue from 'vue'
    import { GET_me_mounted } from 'network/functions.js'
    
	export default {
		onLaunch: function() {
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
            
            Vue.prototype.ColorList = [{
            		title: '嫣红',
            		name: 'red',
            		color: '#e54d42'
            	},
            	{
            		title: '桔橙',
            		name: 'orange',
            		color: '#f37b1d'
            	},
            	{
            		title: '橄榄',
            		name: 'olive',
            		color: '#8dc63f'
            	},
            	{
            		title: '海蓝',
            		name: 'blue',
            		color: '#0081ff'
            	},
            	{
            		title: '姹紫',
            		name: 'purple',
            		color: '#6739b6'
            	},
            	{
            		title: '木槿',
            		name: 'mauve',
            		color: '#9c26b0'
            	},
            	{
            		title: '桃粉',
            		name: 'pink',
            		color: '#e03997'
            	},
            	{
            		title: '棕褐',
            		name: 'brown',
            		color: '#a5673f'
            	},
            	{
            		title: '玄灰',
            		name: 'grey',
            		color: '#8799a3'
            	},
            	{
            		title: '草灰',
            		name: 'gray',
            		color: '#aaaaaa'
            	},
            	{
            		title: '墨黑',
            		name: 'black',
            		color: '#333333'
            	},
            	{
            		title: '雅白',
            		name: 'white',
            		color: '#ffffff'
            	},
            ]
		},
		onShow: function() {
			// console.log('App Show')
		},
		onHide: function() {
			// console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
    @import "/colorui/main.css";
    @import "/colorui/icon.css";
    @import "/colorui/animation.css";
</style>
