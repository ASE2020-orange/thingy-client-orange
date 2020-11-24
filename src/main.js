import Vue from 'vue'
import App from './App.vue'
import router from './router'

import { BootstrapVue } from "bootstrap-vue"
import "bootstrap/dist/css/bootstrap.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
Vue.use(BootstrapVue)

Vue.config.productionTip = false

Vue.mixin({
  data: function() {
    return {
      get server_adress() {
        return "127.0.0.1:1080";
      },
      get http_prefix(){
        return "http://";
      },
      get ws_prefix(){
        return "ws://";
      }
    }
  }
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
