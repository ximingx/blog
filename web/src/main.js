import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'

import 'element-plus/dist/index.css'

import 'normalize.css/normalize.css'

createApp(App).use(store).use(router).mount('#app')
