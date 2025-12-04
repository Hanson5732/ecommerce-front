<script setup>
import LayoutHeader from './LayoutHeader.vue';

import { useScroll } from '@vueuse/core';
const {y} = useScroll(window)

</script>


<template>
  <div class="layout-sticky" :class="{ show: y > 90 }">
    <LayoutHeader />
  </div>
</template>

<style scoped lang="scss">
.layout-sticky {
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 999;
  background-color: #fff;
  border-bottom: 1px solid #e4e4e4;

  transform: translateY(-100%);
  opacity: 0;

  &.show {
    transition: all 0.2s linear;
    transform: none;
    opacity: 1;
  }
}
</style>
