<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getOrderDetailAPI, updateOrderStatusAPI } from '@/apis/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const orderDetail = ref(null)
const defaultAddress = ref(null)

// 完整状态映射
const statusMap = {
  '0': { text: 'Unpaid', type: 'warning' },
  '1': { text: 'Pending', type: 'success' },
  '2': { text: 'Cancelled', type: 'info' },
  '3': { text: 'Shipped', type: 'primary' },
  '4': { text: 'Delivered', type: '' },
  '5': { text: 'Received', type: 'success' },
  '6': { text: 'Refund Pending', type: 'danger' },
  '7': { text: 'Refunded', type: 'info' },
  '8': { text: 'Done', type: 'success' },
  '9': { text: 'Hold', type: 'success' }
}

// 修改状态转换规则
const getAvailableStatuses = (currentStatus) => {
  switch (currentStatus) {
    case '1': return ['9', '7']  // 待处理 -> 可改为暂挂或退款
    case '9': return ['3']       // 暂挂 -> 可改为已发货
    case '3': return ['4']       // 已发货 -> 可改为已送达
    case '6': return ['7']       // 退款中 -> 可改为已退款
    default: return []           // 其他状态不可修改
  }
}

// 修改时间格式化函数
const formatDateTime = (isoString, withLineBreak = false) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const dateStr = date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  return withLineBreak ? `${dateStr}<br/>${timeStr}` : `${dateStr} ${timeStr}`
}

// 添加地址格式化函数
const formatFullLocation = (address) => {
  if (!address) return ''
  return address.province === address.city
    ? `${address.district}, ${address.province}`
    : `${address.district}, ${address.city}, ${address.province}`
}

const fetchOrderDetail = async () => {
  try {
    const orderId = route.params.id
    const res = await getOrderDetailAPI(orderId)
    const productList = res.data.products || [];

    orderDetail.value = {
      id: res.data.id,
      orderStatus: res.data.orderStatus, // 注意：DTO使用驼峰，检查后端返回是否被转换为下划线，通常Java Record默认输出驼峰
      userid: res.data.userId,
      username: res.data.username,
      address: res.data.address,
      // 修改此处：
      items: productList.map(item => ({
        id: item.itemId, // 注意 DTO 中的字段名
        product: {
          id: item.id,   // ProductSnapshot id
          name: item.name,
          image: item.image,
          count: item.count
        },
        itemStatus: item.itemStatus,
        quantity: item.count,
        price: item.price,
        // 这里的 createdTime/updatedTime 需确保 DTO 中存在，OrderItemResponseDto 中只有 updatedTime
        updatedTime: item.updatedTime
      }))
    }
    defaultAddress.value = res.data.address
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 更新商品状态
const updateStatus = async (itemId, oldStatus, newStatus) => {
  try {
    if (oldStatus === newStatus) return

    if (!getAvailableStatuses(oldStatus).includes(newStatus)) {
      ElMessage.error('Ilegal status transformation')
      return
    }

    await ElMessageBox.confirm(
      `Do you confirm to transform '${statusMap[oldStatus].text}' into '${statusMap[newStatus].text}' ?`,
      'Warning',
      { confirmButtonText: 'OK', cancelButtonText: 'Cancel', type: 'warning' }
    )

    await updateOrderStatusAPI(itemId, { status: newStatus })
    ElMessage.success('Status update successfully')
    fetchOrderDetail() // 刷新数据
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('Update error: ' + error.message)
  }
}

// 添加计算总金额的方法
const calculateTotalPrice = (items) => {
  if (!items || !items.length) return 0
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<template>
  <div class="order-detail" v-if="orderDetail">
    <!-- 订单头 -->
    <div class="header">
      <h2>Order ID: {{ orderDetail.id }}</h2>
    </div>

    <!-- 基本信息 -->
    <el-descriptions border :column="1" class="order-info">
      <el-descriptions-item label="order time">
        {{ formatDateTime(orderDetail.items[0]?.createdTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="total amount">
        ¥{{ calculateTotalPrice(orderDetail.items)?.toFixed(2) }}
      </el-descriptions-item>
      <el-descriptions-item label="user ID">
        {{ orderDetail.userid }}
      </el-descriptions-item>
      <el-descriptions-item label="username">
        {{ orderDetail.username }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 地址显示 -->
    <h3 class="section-title">Address Info</h3>
    <el-descriptions border :column="1" class="order-info">
      <el-descriptions-item label="recipient">
        {{ orderDetail.address?.recipient }}
      </el-descriptions-item>
      <el-descriptions-item label="phone">
        {{ orderDetail.address?.phone }}
      </el-descriptions-item>
      <el-descriptions-item label="address">
        {{ formatFullLocation(orderDetail.address) }}
      </el-descriptions-item>
      <el-descriptions-item label="additional address">
        {{ orderDetail.address?.additional_address }}
      </el-descriptions-item>
      <el-descriptions-item label="postal code" v-show="orderDetail.address?.postal_code !== '000000'">
        {{ orderDetail.address?.postal_code }}
      </el-descriptions-item>
    </el-descriptions>

    <!-- 商品列表 -->
    <el-card class="goods-list">
      <template #header>
        <h3>{{ orderDetail.items?.length || 0 }} item(s) in total</h3>
      </template>

      <el-table :data="orderDetail.items" border>
        <el-table-column label="image" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.product.image"
              style="width: 80px; height: 80px"
              :preview-src-list="[row.product.image]"
            />
          </template>
        </el-table-column>

        <el-table-column prop="product.name" label="product name" min-width="180" />

        <el-table-column label="quantity" width="100" align="center">
          <template #default="{ row }">{{ row.quantity }}</template>
        </el-table-column>

        <el-table-column label="unit price" width="120" align="right">
          <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
        </el-table-column>

        <el-table-column label="subtotal" width="120" align="right">
          <template #default="{ row }">
            ¥{{ (row.price * row.quantity).toFixed(2) }}
          </template>
        </el-table-column>

        <el-table-column label="current status" width="150" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.itemStatus].type">
              {{ statusMap[row.itemStatus].text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="update time" width="120" align="center">
          <template #default="{ row }">
            <span v-html="formatDateTime(row.updatedTime, true)" />
          </template>
        </el-table-column>

        <el-table-column label="status operations" width="200" align="center">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                v-for="status in getAvailableStatuses(row.itemStatus)"
                :key="status"
                :type="statusMap[status].type"
                size="small"
                @click="updateStatus(row.id, row.itemStatus, status)"
              >
                {{ statusMap[status].text }}
              </el-button>
            </el-button-group>
            <el-tag v-if="!getAvailableStatuses(row.itemStatus).length" type="info">
              inconvertible
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.order-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 30px;

    h2 {
      margin: 0;
      font-size: 24px;
    }
  }

  .order-info {
    margin-bottom: 30px;

    :deep(.el-descriptions__body) {
      background-color: #f8f9fa;
    }
  }

  .goods-list {
    :deep(.el-card__header) {
      background-color: #f8f9fa;
      h3 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }
    }

    .el-table {
      margin-top: 10px;
    }

    .el-button-group {
      .el-button {
        margin: 0 2px;
      }
    }
  }

  .el-tag {
    min-width: 90px;
    text-align: center;
  }

  .el-image {
    border-radius: 4px;
    overflow: hidden;
  }
}
</style>
