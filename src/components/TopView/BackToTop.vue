<template>
  <div v-if="isVisible" class="back-to-top" @click="scrollToTop">
    ↑
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isVisible = ref(false); // 控制组件是否显示

// 处理滚动事件
const handleScroll = () => {
  isVisible.value = window.scrollY > 300; // 当滚动距离超过 300px 时显示组件
};

// 回到顶部
const scrollToTop = () => {
  window.scrollTo({
  top: 0,
  behavior: 'smooth', // 平滑滚动
});
  };

// 组件挂载时监听滚动事件
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});
// 组件销毁前移除事件监听
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>

<style scoped lang="scss">
.back-to-top {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background-color: $xtxColor;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s;
  z-index: 1000;
}

.back-to-top:hover {
  background-color: #33a06f;
}
</style>
