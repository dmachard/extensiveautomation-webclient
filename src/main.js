import Vue from 'vue'
import '@mdi/font/css/materialdesignicons.css' 
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'

Vue.config.productionTip = false

export const EventBus = new Vue();

new Vue({ 
  vuetify,
  router,
  render: h => h(App),
}).$mount('#app')


