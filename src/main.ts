import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/css/global.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from './utils/axios'
import Echarts from 'vue-echarts'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $http: typeof axios
    $message: typeof ElMessage
    $echarts: typeof echarts
  }
}

const app = createApp(App)

app.config.globalProperties.$message = ElMessage
app.component('v-chart', Echarts)
app.config.globalProperties.$echarts = echarts
app.use(router)
//app.config.globalProperties.$http = axios
app.use(ElementPlus)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
