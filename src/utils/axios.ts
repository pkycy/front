// src/utils/axios.ts
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  //baseURL: '/http://110.64.87.29:8080',
  timeout: 60000000,
  //headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use(
  (config) => {
    const token = window.sessionStorage.getItem('token')
    //if (token) {
    // config.headers.Authorization = token
    //} else {
    // // console.warn('Token 未找到，请求可能无法授权')
    //}
    config.headers['token'] = `${token}`
    console.log('请求拦截器', config)
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // 清除 token
      window.sessionStorage.removeItem('token')
      // 跳转到登录页面
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    }
    return Promise.reject(error)
  },
)

export default instance // 导出自定义的 axios 实例
