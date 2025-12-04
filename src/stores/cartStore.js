import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { saveCartAPI, getCartAPI } from "@/apis/cart"

export const useCartStore = defineStore("cart", () => {
  const cartList = ref([])

  const totalType = computed(() => {
    return cartList.value.filter(item => item.status).reduce(acc => acc + 1, 0)
  })

  const totalCount = computed(() => {
    return cartList.value.filter(item => item.status).reduce((acc, item) => acc + item.count, 0)
  })

  const totalPrice = computed(() => {
    return cartList.value.filter(item => item.status).reduce((acc, item) => acc + item.count * item.price, 0)
  })

  const addToCart = (item) => {
    const existingItem = cartList.value.find((i) => i.id === item.id)
    if (existingItem) {
      existingItem.count += item.count
    } else {
      cartList.value.push({ ...item, count: item.count })
    }
  }

  const deleteCart = (id) => {
    const index = cartList.value.findIndex((item) => item.id === id)
    if (index !== -1) {
      cartList.value.splice(index, 1)
    }
  }

  // 获取用户购物车数据
  const getCart = async () => {
    const res = await getCartAPI()
    return res.data.products

  }

  // 将用户数据保存到数据库
  const saveCart = async (data) => {
    try {
      await saveCartAPI(data)
    } catch (error) {
      console.error('Error saving cart:', error)
    }
  }

  // 清除购物车数据
  const clearCart = () => {
    cartList.value = []
  }

  return {
    cartList,
    totalType,
    totalCount,
    totalPrice,
    addToCart,
    deleteCart,
    getCart,
    saveCart,
    clearCart
  }
}, {
  persist: true
})
