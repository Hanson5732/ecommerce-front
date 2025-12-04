<script setup>
import { computed, ref } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { ElMessage } from 'element-plus'

const cartStore = useCartStore()

const cartList = computed(() => cartStore.cartList)
const totalCount = computed(() => cartStore.totalCount)
const totalPrice = computed(() => cartStore.totalPrice)

// 初始化选中商品列表
const selectedItems = ref(cartList.value.filter(item => item.status))

// 判断是否全选
const isAllSelected = computed(() => {
  const availableItems = cartList.value.filter(item => item.status===true)
  return availableItems.length > 0 && selectedItems.value.length === availableItems.length
})

const selectedCount = computed(() => {
  return selectedItems.value.reduce((total, item) => total + item.count, 0)
})

const selectedPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => total + item.price * item.count, 0)
})

// 切换单个商品选中状态
const toggleItemSelection = (item) => {
  // 如果商品已禁用，移除
  if (item.status === false){
    selectedItems.value.pop(item)
    return;
  }
  const index = selectedItems.value.findIndex(selectedItem => selectedItem.id === item.id)
  if (index === -1) {
    item.selected = true
    selectedItems.value.push(item)
  } else {
    item.selected = false
    selectedItems.value.splice(index, 1)
  }
}

// 切换全选状态
const toggleAllSelection = () => {
  if (isAllSelected.value) {
    selectedItems.value = []
  } else {
    // 只选择可用的商品
    selectedItems.value = cartList.value.filter(item => item.status===true)
  }
}

// Existing code
const removeItem = (id) => {
  const index = cartList.value.findIndex(item => item.id === id)
  if (index !== -1) {
    const removedItem = cartList.value[index]
    cartStore.deleteCart(id)
    // Manually update the total count and price
    totalCount.value -= removedItem.count
    totalPrice.value -= removedItem.price * removedItem.count
    // Remove from selected items if present
    const selectedIndex = selectedItems.value.findIndex(item => item.id === id)
    if (selectedIndex !== -1) {
      selectedItems.value.splice(selectedIndex, 1)
    }
    ElMessage.success('Delete successfully')
  }
}

const updateCount = (id, count) => {
  const item = cartList.value.find(item => item.id === id)
  if (item) {
    const oldCount = item.count
    item.count = count
    // Manually update the total count and price
    totalCount.value += count - oldCount
    totalPrice.value += item.price * (count - oldCount)
    // Update selected items if present
    const selectedItem = selectedItems.value.find(selectedItem => selectedItem.id === id)
    if (selectedItem) {
      selectedItem.count = count
    }
  }
}
</script>

<template>
  <div class="xtx-cart-page">
    <div class="container m-top-20">
      <div class="cart">
        <table>
          <thead>
            <tr>
              <th width="120">
                <el-checkbox :model-value="isAllSelected" @change="toggleAllSelection">Select All</el-checkbox>
              </th>
              <th width="400">Product name</th>
              <th width="220">Price per unit</th>
              <th width="180">Quantity</th>
              <th width="180">Amount</th>
              <th width="140">Operations</th>
            </tr>
          </thead>
          <!-- 商品列表 -->
          <tbody>
            <tr v-for="item in cartList" :key="item.id" :class="{'disabled-item': !item.status}">
              <td>
                <el-checkbox
                  :model-value="selectedItems.some(selectedItem => selectedItem.id === item.id)"
                  @change="() => toggleItemSelection(item)"
                  :disabled="!item.status"
                />
              </td>
              <td>
                <div class="goods">
                  <RouterLink :to="`/product/${item.id}`"><img :src="item.image" alt="" /></RouterLink>
                  <div>
                    <p class="name ellipsis">
                      {{ item.name }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="tc">
                <p>&yen;{{ Number(item.price).toFixed(2) }}</p>
              </td>
              <td class="tc">
                <el-input-number
                  v-model="item.count"
                  @change="(value) => updateCount(item.id, value)"
                  :min="1"
                  :disabled="!item.status"
                />
              </td>
              <td class="tc">
                <p class="f16 red">&yen;{{ (Number(item.price) * item.count).toFixed(2) }}</p>
              </td>
              <td class="tc">
                <p>
                  <el-popconfirm title="Are you sure to delete?" confirm-button-text="Confirm" cancel-button-text="Cancel" @confirm="removeItem(item.id)">
                    <template #reference>
                      <a href="javascript:;">Delete</a>
                    </template>
                  </el-popconfirm>
                </p>
              </td>
            </tr>
            <tr v-if="cartList.length === 0">
              <td colspan="6">
                <div class="cart-none">
                  <el-empty description="There is nothing in your cart">
                    <el-button type="primary" @click="$router.push('/')">Continue shopping</el-button>
                  </el-empty>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- 操作栏 -->
      <div class="action">
        <div class="batch">
          <span>{{ totalCount }}</span> items in total, <span>{{ selectedCount }}</span> items have been seleted. Total Amount:
          <span class="red">¥ {{ Number(selectedPrice).toFixed(2) }} </span>
        </div>
        <div class="total">
          <el-button size="large" type="primary" @click="$router.push('/checkout')">Check out</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.xtx-cart-page {
  margin-top: 20px;

  .cart {
    background: #fff;
    color: #666;

    table {
      border-spacing: 0;
      border-collapse: collapse;
      line-height: 24px;

      th,
      td {
        padding: 10px;
        border-bottom: 1px solid #f5f5f5;

        &:first-child {
          text-align: left;
          padding-left: 30px;
          color: #999;
        }
      }

      th {
        font-size: 16px;
        font-weight: normal;
        line-height: 50px;
      }
    }
  }

  .cart-none {
    text-align: center;
    padding: 120px 0;
    background: #fff;

    p {
      color: #999;
      padding: 20px 0;
    }
  }

  .tc {
    text-align: center;

    a {
      color: $xtxColor;
    }

    .xtx-numbox {
      margin: 0 auto;
      width: 120px;
    }
  }

  .red {
    color: $priceColor;
  }

  .green {
    color: $xtxColor;
  }

  .f16 {
    font-size: 16px;
  }

  .goods {
    display: flex;
    align-items: center;

    img {
      width: 100px;
      height: 100px;
    }

    >div {
      width: 280px;
      font-size: 16px;
      padding-left: 35px;

      .attr {
        font-size: 14px;
        color: #999;
      }
    }
  }

  .action {
    display: flex;
    background: #fff;
    margin-top: 20px;
    height: 80px;
    align-items: center;
    font-size: 16px;
    justify-content: space-between;
    padding: 0 30px;

    .xtx-checkbox {
      color: #999;
    }

    .batch {
      a {
        margin-left: 20px;
      }

      span {
        font-size: 18px;
        color: $priceColor;
      }
    }

    .red {
      font-size: 18px;
      margin-right: 20px;
      font-weight: bold;
    }
  }

  .tit {
    color: #666;
    font-size: 16px;
    font-weight: normal;
    line-height: 50px;
  }
}

.disabled-item {
  background-color: #f0f0f0;
  color: #999;

  .goods img {
    filter: grayscale(100%);
    opacity: 0.6;
  }

  .el-checkbox,
  .el-input-number,
  .el-popconfirm {
    pointer-events: none;
    opacity: 0.6;
  }

  .red {
    color: #999 !important;
  }
}
</style>

