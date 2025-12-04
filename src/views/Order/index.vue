<!-- src/views/Order/index.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getOrderByUserIdAPI,
  updateOrderAPI,
} from '@/apis/checkout'
import LayoutHeader  from '@/views/Layout/components/LayoutHeader.vue'
import LayoutStatus from '@/views/Layout/components/LayoutStatus.vue'
import { markNotificationAPI } from '@/apis/home'

const userStore = useUserStore()

// 订单状态映射
const stateMap = {
  '0': 'Unpaid',
  '1': 'Paid',
  '2': 'Cancelled',
}

// 标签页配置
const tabTypes = [
  { name: "all", label: "All Orders" },
  { name: "0", label: "Unpaid" },
  { name: "1", label: "Pending" },
  { name: "2", label: "Cancelled" },
  { name: "9", label: "Hold" },
  { name: "3", label: "Shipped" },
  { name: "4", label: "Delivered" },
  { name: "5", label: "Received" },
  { name: "6", label: "Refund Pending" },
  { name: "7", label: "Refunded" },
  { name: "8", label: "Done" }
]

const orderList = ref([])
const total = ref(0)
const currentPage = ref(1)
const activeTab = ref('all')

// 获取订单数据
const fetchOrders = async () => {
  try {
    const params = {
      userId: userStore.userInfo.id,
      itemStatus: activeTab.value === 'all' ? undefined : activeTab.value.toString(), page: currentPage.value,
      page_size: 5
}

    const { data } = await getOrderByUserIdAPI(params)

    orderList.value = data.data.map(order => ({
      id: order.id,
      createTime: order.createdTime || '无记录时间',
      status: order.status,
      skus: order.items.filter(item => activeTab.value === 'all' || item.item_status === activeTab.value).map(item => ({
        id: item.id,
        createdTime: item.createdTime,
        updatedTime: item.updatedTime,
        image: item.image || '/placeholder.svg',
        status: item.itemStatus,
        name: item.name,
        attrsText: item.specs ? Object.entries(item.specs)
          .map(([k, v]) => `${k}:${v}`).join(' ') : '无规格',
        realPay: item.price,
        quantity: item.quantity
      })),
      payMoney: order.totalPrice,
      postFee: order.postFee || 0
    }))
    total.value = data.totalItems
  } catch (error) {
    ElMessage.error(error)
  }
}


// Tab切换
const tabChange = (type) => {
  activeTab.value = type
  currentPage.value = 1
  fetchOrders()
}

// 分页切换
const pageChange = (page) => {
  currentPage.value = page
  fetchOrders()
}
// 取消订单
const handleCancelOrder = async (orderId) => {
  ElMessageBox.confirm(
    'Are you sure to cancel this order? This operation cannot be undone.',
    'Confirmation',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then( async () => {
    const res = await updateOrderAPI({
      orderStatus: '2',
      orderId: orderId,
    })
    if (res.code === 1) {
      ElMessage.success('Order cancelled successfully')
      await fetchOrders()
    } else {
      ElMessage.error('Error: ' + res.msg)
    }
  })
}

// 初始化获取数据
onMounted(async () => {
  await fetchOrders()
  await markNotificationAPI(userStore.userInfo.id)
})

// 添加时间格式化方法
const formatDateTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`
// 状态显示格式化
}
</script>

<template>
  <LayoutStatus />
  <LayoutHeader />
  <div class="order-container">
    <el-tabs v-model="activeTab" @tab-change="tabChange">
      <el-tab-pane
        v-for="item in tabTypes"
        :key="item.name"
        :label="item.label"
        :name="item.name"
      />
      <div class="main-container">
        <div class="holder-container" v-if="orderList.length === 0">
          <el-empty description="No orders found" />
        </div>
        <div v-else>
          <!-- 订单列表 -->
          <div
            class="order-item"
            v-for="order in orderList"
            :key="order.id"
          >
            <div class="head">
              <span>Order Time: {{ formatDateTime(order.createTime) }}</span>
              <span>Order ID: {{ order.id }}</span>
              <span class="filter-tip" v-if="activeTab !== 'all'">
                Current filter: {{ tabTypes.find(t => t.name === activeTab)?.label }}
              </span>
            </div>
            <div class="body">
              <div class="column goods">
                <div v-if="order.skus.length <= 8" class="goods-list-wrap">
                  <ul class="goods-list">
                    <li v-for="(item, index) in order.skus.slice(0, 8)" :key="item.id">
                      <img :src="item.image" alt="" class="goods-image" />
                      <div v-if="index === 7 && order.skus.length > 8" class="more-overlay" @click="$router.push(`/order/detail/${order.id}`)">
                        More
                      </div>
                    </li>
                  </ul>
                </div>
                <div v-else class="goods-list-container">
                  <ul class="goods-list">
                    <li v-for="(item, index) in order.skus.slice(0, 8)" :key="item.id">
                      <img :src="item.image" alt="" class="goods-image" />
                      <div v-if="index === 7 && order.skus.length > 8" class="more-overlay" @click="$router.push(`/order/detail/${order.id}`)">
                        More
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="column state">
                <p>{{ stateMap[order.status] }}</p>
                <p v-if="order.status === '4'">
                  <a class="green">Track Shipping</a>
                </p>
              </div>
              <div class="column amount" v-if="['all', '0'].includes(activeTab)">
                <p class="red">¥{{ (order.payMoney + order.postFee).toFixed(2) }}</p>
                <p v-if="order.postFee > 0">(Shipping: ¥{{ order.postFee.toFixed(2) }})</p>
              </div>
              <div class="column action">
                <div class="button-group">
                  <el-button
                    v-if="order.status === '0'"
                    type="primary"
                    size="small"
                    @click="$router.push(`/pay/${order.id}`)"
                  >
                    Pay Now
                  </el-button>

                  <el-button
                    v-if="order.status === '0'"
                    type="danger"
                    size="small"
                    @click="handleCancelOrder(order.id)"
                  >
                    Cancel Order
                  </el-button>
                </div>
                <p><a @click="$router.push(`/order/detail/${order.id}`)">View Details</a></p>
                <p v-if="[3,4,5].includes(order.status)">
                  <a>Buy Again</a>
                </p>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              :total="total"
              :current-page="currentPage"
              :page-size="5"
              background
              layout="prev, pager, next"
              @current-change="pageChange"
            />
          </div>
        </div>
      </div>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
/* 保持原有样式不变 */
.order-container {
  padding: 10px 20px;

  .pagination-container {
    display: flex;
    justify-content: center;
  }

  .main-container {
    min-height: 500px;

    .holder-container {
      min-height: 500px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}

.order-item {
  margin-bottom: 20px;
  border: 1px solid #f5f5f5;
  margin-left: 0;
  .head {
    height: 50px;
    line-height: 50px;
    background: #f5f5f5;
    padding: 0 20px;
    overflow: hidden;

    span {
      margin-right: 20px;

      &.down-time {
        margin-right: 0;
        float: right;

        i {
          vertical-align: middle;
          margin-right: 3px;
        }

        b {
          vertical-align: middle;
          font-weight: normal;
        }
      }

      &.filter-tip {
        margin-right: 0;
        float: right;
        color: #666;
        font-size: 12px;
      }
    }
  }

  .body {
    display: flex;
    align-items: stretch;

    .column {
      border-left: 1px solid #f5f5f5;
      text-align: center;
      padding: 20px;
      > p {
        padding-top: 10px;
      }
      &:first-child {
        border-left: none;
      }

      &.goods {
        flex: 1;
        padding: 0;
        align-self: flex-start;
      }

      &.state {
        width: 120px;

        .green {
          color: $xtxColor;
          cursor: pointer;
        }
      }

      &.amount {
        width: 200px;

        .red {
          color: $priceColor;
        }
      }

      &.action {
        width: 140px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        justify-content: center;

        .button-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;

          .el-button {
            width: 100%;
            min-width: 0;
            margin: 0 !important;
          }
        }

        a {
          display: block;
          cursor: pointer;

          &:hover {
            color: $xtxColor;
          }
        }
      }
    }
  }
}

.info {
  position: relative;
  .status-tag {
    position: absolute;
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 15px;
  }

  p.time {
    color: #666;
    font-size: 12px;
    margin-top: 5px;
  }
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  justify-content: flex-start;

  li {
    list-style: none;
    position: relative;
    text-align: left;
  }

  .goods-image {
    width: 70px;
    height: 70px;
    border: 1px solid #f5f5f5;
    border-radius: 4px;
    display: block;
  }

  .more-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
}

.goods-list-wrap {
  overflow-x: auto;
  white-space: nowrap;
  padding: 10px;
  text-align: left;
}

.goods-list-container {
  overflow-x: auto;
  white-space: nowrap;
  padding: 10px;
  text-align: left;
}
</style>
