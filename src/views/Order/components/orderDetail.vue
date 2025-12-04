<script setup>
  import { ref, onMounted, watch, watchEffect } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { getOrderByIdAPI, updateOrderItemAPI } from '@/apis/checkout'
  import { getAddressAPI } from '@/apis/address'
  import { useUserStore } from '@/stores/user'
  import { getProductStatusAPI } from '@/apis/detail'

  const route = useRoute()
  const router = useRouter()
  const order = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const userStore = useUserStore()
  const defaultAddress = ref(null)

  const statusMap = {
    '0': { text: 'Unpaid', type: 'warning' },
    '1': { text: 'Paid', type: 'success' },
    '2': { text: 'Cancel', type: 'info' },
  }

  const itemStateMap = {
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
  };

  const productStatusMap = ref({})

  const fetchOrderDetail = async () => {
    try {
      const orderId = route.params.id

      const res = await getOrderByIdAPI(orderId)
      const data = res.data

      // 根据接口返回结构调整映射关系
      order.value = {
        id: data.id,
        // 修改：后端返回的是驼峰命名 orderStatus
        orderStatus: data.orderStatus,
        // 修改：后端返回的是 userId
        userid: data.userId,
        username: data.username,

        // 修改：地址字段手动映射，兼容前端模板的 snake_case 写法
        address: data.address ? {
          ...data.address,
          additional_address: data.address.additionalAddr, // 映射 additionalAddr -> additional_address
          postal_code: data.address.postalCode             // 映射 postalCode -> postal_code
        } : null,

        // 核心修复：后端字段名为 products，且需要重组结构
        items: (data.products || []).map(item => ({
          // 映射：操作状态时需要的唯一ID (对应 JSON 中的 itemId)
          id: item.itemId,

          // 重组 product 对象以匹配模板 <el-table> 中的 row.product.name 等调用
          product: {
            id: item.id,       // 商品ID
            name: item.name,
            image: item.image,
            count: item.count
          },

          itemStatus: item.itemStatus, // 驼峰命名
          quantity: item.count,        // 后端用 count 表示数量
          price: item.price,
          updatedTime: item.updatedTime,
          // 后端商品项里没有 createdTime，可以使用订单创建时间兜底，防止报错
          createdTime: data.createdTime
        }))
      }
      loading.value = false
    } catch (err) {
      ElMessage.error(err.response?.data?.message || err.message)
      loading.value = false
    }
  }
  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-')
  }

  const formatFullLocation = (address) => {
    if (!address) return ''
    return address.province === address.city
      ? `${address.district}, ${address.province}`
      : `${address.district}, ${address.city}, ${address.province}`
  }

  const fetchDefaultAddress = async () => {
    try {
      const res = await getAddressAPI(userStore.userInfo.id)
      const addresses = res.data || []
      defaultAddress.value = addresses.find(addr => addr.is_default) || null
    } catch (error) {
      ElMessage.error('Failed to fetch address: ' + error.message)
    }
  }

  // Confirm receipt
  const handleConfirmReceipt = async (itemId, itemStatus) => {
    try {
      const res = await updateOrderItemAPI({
        itemId: itemId,
        oldStatus: itemStatus,
        newStatus: '5'
      });

      if (res.code === 200) {
        ElMessage.success('Receipt confirmed successfully');
        await fetchOrderDetail(); // Refresh order details
      } else {
        ElMessage.error(`Operation failed: ${res.message || 'Unknown error'}`);
      }
    } catch (error) {
      ElMessage.error(`Operation failed: ${error.response?.data?.message || error.message}`);
    }
  };

  // Handle refund
  const handleRefund = async (itemId) => {
    try {
      const currentItem = order.value.skus.find(item => item.id === itemId);

      if (!currentItem) {
        ElMessage.error('未找到对应订单项');
        return;
      }

      const isApplying = currentItem.status !== '6';
      const actionName = isApplying ? 'request refund' : 'cancel refund';

      await ElMessageBox.confirm(
        `Are you sure to ${actionName}?`,
        'Confirmation',
        {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }
      );

      const targetStatus = isApplying ? '6' : '7';
      const res = await updateOrderItemAPI({
        itemId: itemId,
        oldStatus: currentItem.status,
        newStatus: targetStatus
      });

      if (res.code === 200) {
        ElMessage.success(`${actionName} successful`);
        await fetchOrderDetail(); // Refresh order details
      }
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(`Operation failed: ${error.response?.data?.message || error.message}`);
      }
    }
  };

const getProductStatus = async(id) => {
  const res = await getProductStatusAPI(id);
  return res?.data?.status
}

  const batchCheckProducts = async () => {
    if (!order.value?.skus) return

    const checkRequests = order.value.skus.map(item =>
      getProductStatus(item.product_id)
        .then(status => ({ id: item.product_id, status }))
        .catch(() => ({ id: item.product_id, status: false }))
    )

    const results = await Promise.all(checkRequests)
    results.forEach(({ id, status }) => {
      productStatusMap.value[id] = status
    })
  }

  const setupStatusChecker = () => {
    let intervalId

    watchEffect((onCleanup) => {
      batchCheckProducts()

      intervalId = setInterval(batchCheckProducts, 300000)

      onCleanup(() => {
        clearInterval(intervalId)
        productStatusMap.value = {}
      })
    })
  }

  watch(() => order.value, (newVal) => {
    if (newVal) setupStatusChecker()
  })

  onMounted(async () => {
    await fetchOrderDetail()
    await fetchDefaultAddress()
  })
</script>

<template>
  <div class="order-detail">
    <!-- 返回按钮 -->
    <el-button
      type="text"
      @click="router.push({ path: '/order' })"
      class="back-btn"
    >
      <i class="el-icon-arrow-left"></i>
      Return
    </el-button>

    <!-- 订单主体内容 -->
    <div v-if="order" class="content">
      <!-- 订单头 -->
      <div class="header">
        <h2>Order ID: {{ order.id }}</h2>
        <el-tag :type="statusMap[order.status]?.type || 'info'">
          {{ statusMap[order.status]?.text || '未知状态' }}
        </el-tag>
      </div>
      <!-- 地址显示 -->
      <div class="address-section">
        <h3 class="section-title">Address</h3>
        <div class="address-content" v-if="defaultAddress">
          <p><span class="label">Recipient:</span>{{ defaultAddress.recipient }}</p>
          <p><span class="label">Contact:</span>{{ defaultAddress.phone }}</p>
          <p><span class="label">Address:</span>
            {{ defaultAddress.additional_addr }},
            {{ formatFullLocation(defaultAddress) }}
          </p>
        </div>
        <div class="empty-address" v-else>
          <el-empty description="No default address found" :image-size="60" />
        </div>
      </div>
      <!-- 商品列表 -->
      <div class="goods-list">
        <div
          v-for="item in order.skus"
          :key="item.id"
          class="goods-item"
        >
          <RouterLink
            :to="`/product/${item.product_id}`"
            v-if="productStatusMap[item.product_id] === true"
          >
            <el-image :src="item.image" class="goods-img" />
          </RouterLink>
          <el-image :src="item.image" class="goods-img-disabled" v-else />
          <div class="goods-info">
            <RouterLink
              :to="`/product/${item.product_id}`"
              v-if="productStatusMap[item.product_id] === true"
            >
              <h3 class="active">{{ item.name }}</h3>
            </RouterLink>
            <h3  class="disabled" v-else>{{ item.name }}</h3>
            <p class="spec">{{ item.attrsText }}</p>
            <div class="price-line">
              <span class="price">¥{{ item.realPay }}</span>
              <span class="quantity">x{{ item.quantity }}</span>
              <span class="subtotal">¥{{ item.subtotal.toFixed(2) }}</span>
            </div>
            <el-tag
              :type="itemStateMap[item.status]?.type"
              size="small"
              class="status-tag"
            >
              {{ itemStateMap[item.status]?.text || 'Unknown status' }}
            </el-tag>
            <p class="time" v-if="item.updatedTime">
              Last updated: {{ formatDateTime(item.updatedTime) }}
            </p>
            <p class="time" v-else>
              Last updated: Unknown
            </p>
            <div class="action">
              <el-button
                v-if="item.status === '4'"
                type="success"
                size="small"
                @click="handleConfirmReceipt(item.id, item.status)"
              >
                Confirm Receipt
              </el-button>
              <el-button
                v-if="['1', '3', '4', '5', '9'].includes(item.status)"
                type="warning"
                size="small"
                @click="handleRefund(item.id)"
              >
                {{ item.status === '6' ? 'Cancel Refund' : 'Request Refund' }}
              </el-button>
              <el-button
                v-if="item.status === '5'"
                type='primary'
                size='small'
                @click="$router.push({ path: `/order/comment/add/${item.id}` })"
              >
                Comment Now
              </el-button>
              <el-button
                v-if="item.status === '8'"
                type='default'
                size='small'
                @click="$router.push({ path: `/order/comment/review/${item.id}` })"
              >
                View my comment
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <el-descriptions
        title="Order Info"
        border
        :column="2"
        class="order-info"
      >
        <el-descriptions-item label="Order created at">
          {{ formatDateTime(order.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="Account Paid">
          ¥{{ order?.payMoney.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="Post Fee">
          ¥{{ order.postFee }}
        </el-descriptions-item>
        <el-descriptions-item label="Total Quantity">
          {{ order.totalQuantity }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" :rows="5" animated />

    <!-- 错误提示 -->
    <el-empty v-if="error" :description="error" />
  </div>
</template>

<style lang="scss" scoped>
.order-detail {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);

  .back-btn {
    margin-bottom: 20px;
    padding-left: 0;
    i {
      margin-right: 5px;
    }
  }

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;

    h2 {
      margin: 0;
      margin-right: 20px;
      font-size: 24px;
    }
  }

  .goods-list {
    margin: 30px 0;
    border: 1px solid #eee;
    border-radius: 8px;

    .goods-item {
      display: flex;
      padding: 20px;
      border-bottom: 1px solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .goods-img {
        width: 120px;
        height: 120px;
        margin-right: 20px;
        border-radius: 4px;
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }

        &:active {
          transform: translateY(0);
          opacity: 0.9;
        }
      }

      .goods-img-disabled {
        width: 120px;
        height: 120px;
        margin-right: 20px;
        border-radius: 4px;
      }

      .goods-info {
        flex: 1;
        h3.active {
          margin: 0 0 10px;
          font-size: 16px;
          transition: color 0.2s ease;
          cursor: pointer;
          max-width: fit-content;

          &:hover {
            color: var(--el-color-primary);
          }

          &:active {
            color: var(--el-color-primary-dark-2);
          }
        }

        h3.disabled {
          margin: 0 0 10px;
          font-size: 16px;
        }

        .spec {
          color: #666;
          margin-bottom: 8px;
        }

        .price-line {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .price {
            color: #333;
            font-size: 16px;
            font-weight: bold;
          }

          .quantity {
            color: #666;
          }

          .subtotal {
            color: #e4393c;
            font-size: 16px;
            font-weight: bold;
          }
        }

        .status-tag {
          margin-top: 8px;
        }

        .time {
          color: #999;
          font-size: 12px;
          margin-top: 8px;
        }

        .action {
          margin-top: 8px;
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .order-info {
    margin-top: 30px;

    .total {
      color: #e4393c;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .address-section {
    margin-top: 30px;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 4px;

    .section-title {
      font-size: 16px;
      color: #666;
      margin-bottom: 15px;
    }

    .address-content {
      p {
        margin: 8px 0;
        font-size: 14px;

        .label {
          color: #999;
          margin-right: 10px;
          width: 80px;
          display: inline-block;
        }
      }
    }

    .empty-address {
      padding: 20px 0;
    }
  }
}
</style>
