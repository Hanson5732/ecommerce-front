<template>
  <AdminStatus />
  <div class="admin-layout">
    <!-- 左侧导航栏 -->
    <AdminSidebar />

    <!-- 右侧内容区 -->
    <div class="main-content">
      <!-- 顶部标题栏 -->
      <div class="header">
        <h2 class="text-lg">{{ currentPage }}</h2>
      </div>

      <!-- 内容区域 -->
      <div class="content">
        <RouterView />
        <BackToTop />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminStatus from './components/AdminStatus.vue'
import AdminSidebar from './components/AdminSidebar.vue'
import BackToTop from '@/components/TopView/BackToTop.vue'

const route = useRoute()
const currentPage = ref('')

watch(() => route.path, (newPath) => {
  // 根据路径设置页面标题
  const pageMap = {
    '/admin/product': 'Product Management',
    '/admin/category': 'Category Management',
    '/admin/subcategory': 'Sub-Category Management'
  }
  currentPage.value = pageMap[newPath] || 'Backage System'
}, { immediate: true })
</script>

<style scoped lang="scss">
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f0f2f5;
  margin: 0 auto;
}

.admin-layout :deep(.admin-sidebar) {
  position: sticky;
  top: 35px;
  height: calc(100vh - 35px);
  z-index: 99;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 1200px;
  overflow: hidden;
}

.header {
  height: 60px;
  background-color: white;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  min-width: 1200px;
}
</style>
