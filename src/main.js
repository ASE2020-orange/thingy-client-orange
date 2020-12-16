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
      get server_address() {
        return process.env.VUE_APP_SERVER_ADDRESS;
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
