import Vue from 'vue'
import '@mdi/font/css/materialdesignicons.css' 
import './plugins/vuetify'
import App from './App.vue'
import router from './router';

Vue.config.productionTip = false

export const EventBus = new Vue();

new Vue({ 
  router,
  render: h => h(App),
}).$mount('#app')


