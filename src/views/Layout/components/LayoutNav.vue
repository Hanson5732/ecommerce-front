<script setup>
import { onMounted } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'

const categoryStore = useCategoryStore()

onMounted(() => {
  categoryStore.getCategory()
})

</script>

<template>
  <!-- Navigation Bar -->
  <div class="nav-section">
    <div class="container">
      <ul class="app-header-nav">
        <li class="home">
          <RouterLink to="/" exact-active-class="active">Home</RouterLink>
        </li>
        <li v-for="category in categoryStore.categoryList" :key="category?.id">
          <RouterLink :to="`/category/${category?.id}`" exact-active-class="active">{{ category?.name }}</RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav-section {
  background: #f5f5f5;
  border-bottom: 1px solid #e7e7e7;
}

.app-header-nav {
  height: 40px;
  display: flex;
  align-items: center;
  padding-left: 40px;

  li {
    margin-right: 40px;

    a {
      font-size: 14px;
      line-height: 40px;
      display: inline-block;

      &:hover {
        color: $xtxColor;
      }
    }

    .active {
      color: $xtxColor;
      border-bottom: 1px solid $xtxColor;
    }

    &.home {
      a {
        font-weight: 500;
      }
    }
  }
}
</style>

