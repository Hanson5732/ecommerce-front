<script setup>
import GoodsItem from '../Home/components/GoodsItem.vue'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getCategoriesAPI } from '@/apis/category'

const route = useRoute()

// Banner 数据
const bannerList = ref([])

// 获取并组装一级分类下的信息
const categories = ref({})

const fetchCategoryData = async (id) => {
  const res = await getCategoriesAPI(id);

  categories.value = res.data

  // 从 category_data.images 中获取轮播图数据
  if (res.data.images && res.data.images.length > 0) {
    bannerList.value = res.data.images
      .slice(0, 3) // 最多取 3 张图片
      .map((image, index) => ({
        id: index + 1,
        imgUrl: image // 直接使用图片 URL
      }))
  }
}

onMounted(() => {
  fetchCategoryData(route.params.id)
})

watch(() => route.params.id, (newId) => {
  fetchCategoryData(newId)
})
</script>

<template>
  <div class="top-category">
    <div class="container m-top-20">
      <!-- Breadcrumb -->
      <div class="bread-container">
        <el-breadcrumb separator=">">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item>{{ categories.name }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- Carousel -->
      <div class="home-banner">
        <el-carousel height="500px">
          <el-carousel-item v-for="item in bannerList" :key="item.id">
            <img :src="item.imgUrl" alt="">
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="sub-list">
        <h3>Sub-List</h3>
        <ul>
          <li v-for="i in categories.subcate" :key="i.id">
            <RouterLink :to="`/category/sub/${i.id}`">
              <img :src="i.image" />
              <p>{{ i.name }}</p>
            </RouterLink>
          </li>
        </ul>
      </div>
      <div class="ref-goods" v-for="item in categories.subcate" :key="item.id">
        <div class="head">
          <h3>- {{ item.name }} -</h3>
        </div>
        <div class="body">
          <GoodsItem v-for="good in item.products" :goods="good" :key="good.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.top-category {
  h3 {
    font-size: 28px;
    color: #666;
    font-weight: normal;
    text-align: center;
    line-height: 100px;
  }

  .sub-list {
    margin-top: 20px;
    background-color: #fff;

    ul {
      display: flex;
      padding: 0 32px;
      flex-wrap: wrap;

      li {
        width: 168px;
        height: 160px;

        a {
          text-align: center;
          display: block;
          font-size: 16px;

          img {
            width: 100px;
            height: 100px;
          }

          p {
            line-height: 40px;
          }

          &:hover {
            color: $xtxColor;
          }
        }
      }
    }
  }

  .ref-goods {
    background-color: #fff;
    margin-top: 20px;
    position: relative;

    .head {
      .xtx-more {
        position: absolute;
        top: 20px;
        right: 20px;
      }

      .tag {
        text-align: center;
        color: #999;
        font-size: 20px;
        position: relative;
        top: -20px;
      }
    }

    .body {
      display: flex;
      justify-content: space-around;
      padding: 0 40px 30px;
    }
  }

  .bread-container {
    padding: 25px 0;
  }
}

.home-banner {
  width: 1240px;
  height: 500px;
  margin: 0 auto;

  img {
    width: 100%;
    height: 500px;
  }
}
</style>

