import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getCategories } from '@/apis/category'

export const useCategoryStore = defineStore('category', () => {

  const categoryList = ref([])

  const getCategory = async () => {
    const res = await getCategories()
    categoryList.value = res.data
  }

  return {
    categoryList,
    getCategory,
  }
}, {
  persist: true
})
