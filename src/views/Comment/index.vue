<script setup>
import LayoutStatus from '../Layout/components/LayoutStatus.vue';
import LayoutHeader from '../Layout/components/LayoutHeader.vue';
import LayoutFooter from '../Layout/components/LayoutFooter.vue';
</script>

<template>
  <LayoutStatus />
  <LayoutHeader />
  <RouterView />
  <LayoutFooter />
</template>

<style lang="scss" scoped></style>
