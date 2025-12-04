import axios from "axios";
import 'element-plus/theme-chalk/el-message.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from "@/stores/user"
import { useCartStore } from "@/stores/cartStore";
import router from '@/router/index'

const httpInstance = axios.create({
    baseURL: '/api/',
    timeout: 5000,
    headers: { 'Content-Type': 'application/json',
              'Cache-Control': 'max-age=3600'
    },
    withCredentials: true
})

let isRefreshing = false; // 标记是否正在刷新token
let refreshSubscribers = []; // 存储需要重新发送的请求

// axios request interceptor
httpInstance.interceptors.request.use(config => {
    const userStore = useUserStore()
    if(config.url !== '/user/token-refresh/') {
      const token = userStore.userInfo.access;
      if(token) {
          config.headers.Authorization = `Bearer ${userStore.userInfo.access}`;
      }
    }
    const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config
}, e => Promise.reject(e))

// axios response interceptor
httpInstance.interceptors.response.use(res => res.data, async e => {
  const userStore = useUserStore();
  const cartStore = useCartStore();
  const refreshToken = userStore.userInfo.refresh;

  if (e.status === 401 && refreshToken) {
    if (!isRefreshing) {
      try {
        isRefreshing = true; // 标记正在刷新token
        const response = await axios.post('/api/user/token-refresh/', {
          refresh: refreshToken
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.code !== 1) {
          throw new Error('Token refresh failed');
        }

        const access = response.data.data.access
        userStore.setAccessToken(access);
        isRefreshing = false; // 刷新完成，取消标记

        // 重新发送之前失败的请求
        refreshSubscribers.forEach(subscriber => subscriber(response.access));
        refreshSubscribers = [];

        // 重新发起当前请求
        e.config.headers.Authorization = `Bearer ${response.access}`;
        return httpInstance(e.config);
      } catch (refreshError) {
        ElMessage.error('Token refresh failed. Please log in again.');
        isRefreshing = false; // 刷新失败，取消标记
        userStore.clearUserInfo()
        cartStore.clearCart()
        ElMessageBox.confirm(
          'User authentication expired, please log in again.',
          'Warning',
          {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            type: 'warning',
          }
        ).then(() => {
          router.push('/login');
        }).catch(() => {
          router.push('/');
        });
        return Promise.reject(refreshError);
      }
    } else {
      // 如果正在刷新token，将当前请求加入队列
      return new Promise((resolve, reject) => {
        refreshSubscribers.push((newToken) => {
          if (newToken) {
            e.config.headers.Authorization = `Bearer ${newToken}`;
            resolve(httpInstance(e.config)); // 重新发起请求
          } else {
            reject(e);
          }
        });
      });
    }
  } else if(e.status === 404) {
    router.replace({ path: '/404' })
    return Promise.reject(e)
  } else if(e.status === 403) {
    router.replace({ path: '/403' })
    return Promise.reject(e)
  } else if(e.status === 500) {
    router.replace({ path: '/500' })
  } else {
    if(e.response.data?.msg){
      ElMessage.warning(e.response.data.msg);
    } else {
      ElMessage.error('Network Error');
    }
    return Promise.reject(e);
  }
});


export default httpInstance
