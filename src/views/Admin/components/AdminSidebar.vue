<template>
  <div class="sidebar admin-sidebar">
    <el-menu
      :default-active="activeMenu"
      class="sidebar-menu"
      router
    >
      <div class="logo-container">
        <h2 style="font-family:Georgia, 'Times New Roman', Times, serif; font-size: 18px;">
          Rabbuy system
        </h2>
      </div>

      <el-menu-item index="/admin/order" class="sidebar-item">
        <el-icon><Document /></el-icon>
        <span>Orders</span>
      </el-menu-item>

      <el-menu-item index="/admin/product" class="sidebar-item">
        <el-icon><Goods /></el-icon>
        <span>Product</span>
      </el-menu-item>

      <el-menu-item index="/admin/category" class="sidebar-item">
        <el-icon><Menu></Menu></el-icon>
        <span>Category</span>
      </el-menu-item>

      <el-menu-item index="/admin/subcategory" class="sidebar-item">
        <el-icon><Grid /></el-icon>
        <span>Sub-Category</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { Goods, Grid, Menu, Document } from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = ref(route.path)

</script>

<style scoped lang="scss">
.sidebar {
  width: 240px;
  height: 100vh;
  background-color: #001529;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #001529;
}

.sidebar-menu {
  border-right: none;
  background-color: #001529;
  color: #fff;
}

.sidebar-item {
  color: #fff;
}

/* 点击菜单项时的背景颜色 */
:deep(.el-menu-item.is-active) {
  background-color: $xtxColor !important;
}

/* 鼠标悬浮时的背景颜色 */
:deep(.el-menu-item:hover) {
  background-color: #013d75
}
</style>
