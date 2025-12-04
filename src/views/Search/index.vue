<script setup>
import { getSearchResultsAPI } from '@/apis/search';
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import GoodsItem from '../Home/components/GoodsItem.vue';

const route = useRoute()

// 获取搜索结果
const searchResults = ref([])
const requestData = ref({
  q: route.query.q, // 从路由中获取搜索关键词
  category: route.query.category,
  page: 1,
  pageSize: 10,
  sortField: 'default', // 默认按数据库默认排序
  sortMin: null,
  sortMax: null,
})

const fetchSearchResults = async (sort) => {
  requestData.value.sortField = sort
  const res = await getSearchResultsAPI(requestData.value)
  searchResults.value = res.data.data || []
}

onMounted(async () => {
  await fetchSearchResults('default')
})

const min = ref(null)
const max = ref(null)
const intervalActive = ref(false)
const filterByPrice = () => {
  if(min.value != null) requestData.value.sortMin = Number(min.value)
  if(max.value != null) requestData.value.sortMax = Number(max.value)
  if(max.value != null || min.value != null) {
    intervalActive.value = true
  } else {
    intervalActive.value = false
  }
  fetchSearchResults(requestData.value.sortField)
}

const resetPriceFilter = () => {
  min.value = null
  max.value = null
  requestData.value.sortMin = null
  requestData.value.sortMax = null
}

// 监听路由的 query 参数变化
watch(
  () => route.query, // 监听 route.query
  (newQuery) => {
    // 更新 requestData 中的搜索参数
    requestData.value = {
      q: newQuery.q,
      category: newQuery.category,
      page: 1, // 重置页码
      sortField: 'default', // 重置排序方式
      sortMin: null,
      sortMax: null,    // 重置最小值和最大值
    }
    fetchSearchResults() // 重新获取搜索结果
  }
)

// 分页加载更多
const disabled = ref(false)

const load = async () => {
  // 获取下一页数据
  requestData.value.page++
  const res = await getSearchResultsAPI(requestData.value)
  const newProducts = res.data.data || []
  searchResults.value = [...searchResults.value, ...newProducts]

  // 加载完毕，停止监听
  if(newProducts.length === 0) {
    disabled.value = true
  }
}

const validateInput = (type) => {
  const value = type === 'min' ? min.value : max.value;
  // 使用正则表达式验证输入是否为数字或浮点数
  if (!/^\d*\.?\d*$/.test(value)) {
    if (type === 'min') min.value = value.slice(0, -1); // 删除最后一个字符
    else max.value = value.slice(0, -1); // 删除最后一个字符
  }
};
</script>

<template>
  <div class="container">
    <!-- 面包屑 -->
    <div class="bread-container">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item>Search Results</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="sub-container">
      <div class="filter-bar">
        <div class="left">
          <a
            :class="['filter-item', requestData.sortField === 'default' ? 'active' : '']"
            @click="fetchSearchResults('default')"
          >Default</a>
          <a
            :class="['filter-item', requestData.sortField === 'created_time' ? 'active' : '']"
            @click="fetchSearchResults('created_time')"
          >Newest</a>
          <a
            :class="['filter-item', requestData.sortField === 'product_rating' ? 'active': '']"
            @click="fetchSearchResults('product_rating')"
          >Hotest
          </a>
          <el-dropdown @command="fetchSearchResults" popper-class="dropdown">
            <a :class="['price-filter-item',
              requestData.sortField === 'price' ||
              requestData.sortField === '-price' ? 'active' : '']">
              Price
              <el-icon><ArrowDown /></el-icon>
            </a>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="price"
                  :class="{ 'is-active': requestData.sortField === 'price' }"
                >
                  Low to high
                </el-dropdown-item>
                <el-dropdown-item command="-price"
                  :class="{ 'is-active': requestData.sortField === '-price' }"
                >High to low</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-popover
            placement="bottom-start"
            :width="200"
          >
            <template #reference>
              <a :class="['filter-item',
                intervalActive ? 'active' : '']">
                Interval
                <el-icon><ArrowDown /></el-icon>
              </a>
            </template>
            <div class="price-range-filter">
              <div class="input-row">
                <el-input
                  v-model="min"
                  placeholder="￥ Min"
                  @input="validateInput('min')"
                  style="width: 70px"
                />
                <span>&nbsp;-&nbsp;</span>
                <el-input
                  v-model="max"
                  placeholder="￥ Max"
                  @input="validateInput('max')"
                  style="width: 70px"
                />
              </div>
              <div class="button-row">
                <el-button @click="resetPriceFilter" size="small">Reset</el-button>
                <el-button type="primary" @click="filterByPrice" size="small">Confirm</el-button>
              </div>
            </div>
          </el-popover>
        </div>
      </div>

      <div class="body" v-infinite-scroll="load" :infinite-scroll-disabled="disabled">
         <!-- 商品列表-->
         <GoodsItem v-for="good in searchResults" :goods="good" :key="good.id" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bread-container {
  padding: 25px 0;
  color: #666;
}

.sub-container {
  padding: 20px 10px;
  background-color: #fff;
  flex-direction: row;

  .filter-bar {
    display: flex;
    align-items: center;
    padding: 0 25px;
    margin-bottom: 20px;

    .left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filter-item {
      position: relative;
      cursor: pointer;
      color: #333;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;

      &:hover, &.active, &.active::after {
        color: $xtxColor;
        border: 1px solid $xtxColor;
      }
    }

    .price-filter-item {
      position: relative;
      cursor: pointer;
      color: #333;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 7px 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;

      &:hover, &.active, &.active::after {
        color: $xtxColor;
        border: 1px solid $xtxColor;
      }
    }

    .price-range-filter {
      display: flex;
      flex-direction: column;

      .input-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

    }
  }

  .body {
    display: flex;
    flex-wrap: wrap;
    padding: 0 10px;
  }

  .goods-item {
    display: block;
    width: 220px;
    margin-right: 20px;
    padding: 20px 30px;
    text-align: center;

    img {
      width: 160px;
      height: 160px;
    }

    p {
      padding-top: 10px;
    }

    .name {
      font-size: 16px;
    }

    .desc {
      color: #999;
      height: 29px;
    }

    .price {
      color: $priceColor;
      font-size: 20px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

:deep(.button-row) {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 10px 5px 0px 5px;
}

:deep(.is-active) {
  background-color: rgba($xtxColor, 0.2);
  color: $xtxColor;
}
</style>
