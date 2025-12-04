<script setup>
import HomePanel from './HomePanel.vue'
import { onMounted, ref } from 'vue'
import { findHotAPI } from '@/apis/home';

const hotList = ref([])

const getHotList = async () => {
  const res = await findHotAPI()
  hotList.value = res.data
}

onMounted(() => {
  getHotList()
})

</script>

<template>
  <HomePanel title="Hot" sub-title="Too pop to miss">
    <ul class="goods-list">
      <li v-for="item in hotList" :key="item.id">
        <RouterLink :to="`/product/${item.id}`">
          <img :src="item.image" alt="" />
          <p class="name">{{ item.name }}</p>
          <p class="desc">{{ item.price }}</p>
        </RouterLink>
      </li>
    </ul>
  </HomePanel>
</template>

<style scoped lang='scss'>
.goods-list {
  display: flex;
  justify-content: space-between;
  height: 426px;

  li {
    width: 306px;
    height: 406px;
    transition: all .5s;

    &:hover {
      transform: translate3d(0, -3px, 0);
      box-shadow: 0 3px 8px rgb(0 0 0 / 20%);
    }

    img {
      width: 306px;
      height: 306px;
    }

    p {
      font-size: 22px;
      padding-top: 12px;
      text-align: center;
    }

    .desc {
      color: $priceColor;
    }
  }
}
</style>

