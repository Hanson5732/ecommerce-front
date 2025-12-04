import { defineStore } from 'pinia'
import { ref } from 'vue';
import { loginAPI, signupAPI } from '@/apis/user';

export const useUserStore = defineStore('user', () => {
    const userInfo = ref({})

    const getUserInfo = async ({ username, password }) => {
        const res = await loginAPI({ username, password })
        const loginData = res.data
        const mappedUserInfo = {
            ...loginData.user,
            access: loginData.access,
            refresh: loginData.refresh
        }
        userInfo.value = mappedUserInfo
        return mappedUserInfo
    }

    const clearUserInfo = () => {
        userInfo.value = {}
    }

    const register = async ({ username, email, firstName, lastName, password, confirmPwd }) => {
        const res = await signupAPI({ username, email, firstName, lastName, password, confirmPwd })
        const registeredUser = {
            ...res.data.user,
            access: res.data.access,
            refresh: res.data.refresh
        }
        return registeredUser
    }

    const setAccessToken = (newAccess) => {
      userInfo.value.access = newAccess
    }

    return {
        userInfo,
        getUserInfo,
        clearUserInfo,
        register,
        setAccessToken
    }
}, {
    persist: true,
})
