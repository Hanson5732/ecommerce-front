<script setup>
import HomeCategory from './components/HomeCategory.vue'
import HomeBanner from './components/HomeBanner.vue'
import HomeId from './components/HomeId.vue'
import HomeNew from './components/HomeNew.vue'
import HomeHot from './components/HomeHot.vue'
import HomeProduct from './components/HomeProduct.vue'
</script>

<template>
  <div class="container">
    <HomeCategory />
    <HomeBanner />
    <HomeId class="id"/>
  </div>
  
  <HomeNew />
  <HomeHot />
  <HomeProduct />
</template>

<style scoped>
.container {
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: space-between; /* 在主轴上均匀分布 */
  padding: 20px; /* 添加一些内边距 */
}
.id {
  margin-left: 8px;
}
</style>