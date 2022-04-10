import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/store'

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';

// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(githubTheme, {
  Hljs: hljs,
});

import 'element-plus/dist/index.css'

import 'normalize.css/normalize.css'

createApp(App).use(VMdPreview).use(store).use(router).mount('#app')
