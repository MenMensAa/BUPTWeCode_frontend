import Vue from 'vue'
import App from './App'
import store from './store/index.js'
import Modal from './components/modals/modal.vue'
import Dialog from './components/modals/dialog.vue'
import Toast from './components/modals/toast.vue'
import Selector from './components/modals/selector.vue'
import Menu from './components/modals/menu.vue'
import cuCustom from './colorui/components/cu-custom.vue'


Vue.config.productionTip = false
Vue.prototype.$store = store

App.mpType = 'app'

Vue.component('my-modal', Modal)
Vue.component('my-dialog', Dialog)
Vue.component('my-nav',cuCustom)
Vue.component('my-toast', Toast)
Vue.component('my-selector', Selector)
Vue.component('my-menu', Menu)

const app = new Vue({
    ...App
})
app.$mount()
