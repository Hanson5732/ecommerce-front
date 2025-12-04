<script setup>
import { onBeforeMount, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { getMessageCountAPI } from '@/apis/home'
import { getOrderByUserIdAPI } from '@/apis/checkout'
import { ElMessage, ElMessageBox } from 'element-plus'
import { jwtDecode } from 'jwt-decode'
import { updateUserProfileAPI } from '@/apis/user'
import { postImageAPI } from '@/apis/image'
import { Upload } from '@element-plus/icons-vue'
import { useCartStore } from '@/stores/cartStore'
import { getProductStatusAPI, getDetailAPI } from '@/apis/detail'

const userStore = useUserStore()
const cartStore = useCartStore()

const pending = ref({
  unpaid: 0,
  pending: 0,
  review: 0,
  refunding: 0
})

// 获取解码后的邮箱
const is_staff = ref(false)
const email = ref('')
const phone = ref('')

// 监听access token变化
watch(() => userStore.userInfo.access, (newVal) => {
  if (newVal) {
    try {
      const decoded = jwtDecode(newVal)
      email.value = decoded.email || ''
      phone.value = decoded.phone || ''
      is_staff.value = decoded.is_staff || false
    } catch (error) {
      console.error('JWT解码失败:', error)
      email.value = ''
      phone.value = ''
      is_staff.value = false
    }
  }
}, { immediate: true })

// 获取动态头像URL
const avatarUrl = ref(userStore.userInfo.profile || '/default-avatar.jpg')

// 获取订单状态数据
const fetchOrderStats = async () => {
  try {
    const res = await getMessageCountAPI(userStore.userInfo.id)
    pending.value = res.data
  } catch (error) {
    console.error('获取订单统计失败:', error)
  }
}

// 订单相关数据
const orderList = ref([])

// 复用订单页的获取方法
const fetchOrders = async () => {
  try {
    const params = {
      userId: userStore.userInfo.id,
      page: 1,
      page_size: 2,  // 限制获取1条最新订单
      ordering: '-created_time'
    }

    const { data } = await getOrderByUserIdAPI(params)
    orderList.value = data.data.map(order => ({
      id: order.id,
      createTime: order.createdTime || 'No record',
      status: order.status,
      total: order.totalPrice || 0,
      items: order.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        image: item.image || '/placeholder.svg',
        price: item.price,
        quantity: item.quantity,
        status: item.itemStatus || 'No record',
        specs: item.specs
      }))
    }))
  } catch (error) {
    console.error('获取订单失败:', error)
  }
}

const showEditDialog = ref(false)
const form = ref({
  username: '',
  email: '',
  phone: '',
})

const showEditForm = ref(false)
const toggleEditForm = () => {
  showEditForm.value = !showEditForm.value
  // 当展开表单时初始化数据
  if (showEditForm.value) {
    form.value = {
      username: userStore.userInfo.username || '',
      email: email.value || '',
      phone: phone.value || '',
    }
  }
}

// 提交表单
const submitForm = async () => {
  try {
    // 调用更新用户信息的API
    const res = await updateUserProfileAPI({
      id: userStore.userInfo.id,
      ...form.value
    })

    // 更新store中的用户信息
    userStore.userInfo = { ...userStore.userInfo, ...res.data }
    ElMessage.success('Profile updated successfully')
    showEditDialog.value = false
    form.value = { ...userStore.userInfo };
  } catch (error) {
    ElMessage.error('Update failed: ' + error.message)
  }
}

const showAvatarDialog = ref(false)

const handleFileChange = async (file) => {
  try {
    // 调用 postImageAPI 上传文件
    const response = await postImageAPI(file.raw);

    const imageUrl = response.data?.url || response.url;

    // 确保返回的 response 包含 URL
    if (!imageUrl) {
      throw new Error('Upload failed: Invalid response');
    }

    // 更新头像 URL
    avatarUrl.value = response.url;

    // 调用更新用户信息的API
    await updateUserProfileAPI({
      id: userStore.userInfo.id,
      profile: imageUrl
    });

    userStore.userInfo.profile = imageUrl

    ElMessage.success('Avatar updated successfully');

    showAvatarDialog.value = false;
  } catch (error) {
    // 细化错误处理
    if (error.response) {
      // 服务器返回的错误
      ElMessage.error(`Failed to update avatar: ${error.response.data.message || error.message}`);
    } else if (error.request) {
      // 请求未收到响应
      ElMessage.error('Network error: Please check your internet connection.');
    } else {
      // 其他错误
      ElMessage.error(`Failed to update avatar: ${error.message}`);
    }
  }
};

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJPG) {
    ElMessage.error('Upload avatar image must be JPG or PNG!');
  }
  return isJPG;
};

onBeforeMount(async () => {
  if (userStore.userInfo.id) {
    await fetchOrderStats()
    await fetchOrders()  // 直接调用复用后的方法
  }
})

const buyAgain = async (items) => {
  ElMessageBox.confirm(
    'Are you sure to add these products in your cart?',
    'Reminder',
    {
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  ).then(async ()=>{
    for (let item of items) {
      const res = await getProductStatusAPI(item.productId);
      if (res.data.status == true) {
        const r = await getDetailAPI(item.productId);
        const product = r.data;
        cartStore.addToCart({
          id: product.id,
          name: product.name,
          image: product.images[0],
          price: product.price,
          count: item.quantity,
          status: true,
          selected: true,
        })
        ElMessage.success('Add products successfully')
      }
    }
  }).catch()
}
</script>

<template>
  <div class="profile-container">
    <!-- 左侧边栏 -->
    <aside class="profile-sidebar">
      <div class="profile-card">
        <img
          :src="avatarUrl"
          alt="Avatar"
          class="avatar"
          @click="showAvatarDialog = true"
        >
        <div class="user-info">
          <h1 class="name">{{ userStore.userInfo.username || 'Guest' }}</h1>
          <p class="username">Member Level: {{ userStore.userInfo.level || 'Standard' }}</p>

          <div class="stats">
            <div class="stat-item">
              <strong>{{ userStore.userInfo.points || 0 }}</strong>
              <span>Points</span>
            </div>
            <div class="stat-item">
              <strong>{{ userStore.userInfo.coupons || 0 }}</strong>
              <span>Coupons</span>
            </div>
          </div>
        </div>

        <div class="account-security">
          <h3>Account Security</h3>
          <div class="security-item">
            <i class="el-icon-mobile-phone"></i>
            <span>
              Mobile: {{ phone ?
                phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') :
                '未绑定'
                }}
            </span>
            <el-link
              v-if="!email"
              type="primary"
              :underline="false"
              @click="handleChangePhone"
            >
              Change
            </el-link>
          </div>
          <div class="security-item">
            <i class="el-icon-message"></i>
            <span>
              Email: {{ email ?
                email.replace(/(.).*@/, '$1***@') :
                '未绑定'
              }}
            </span>
            <el-link
              v-if="!email"
              type="primary"
              :underline="false"
              @click="handleBindEmail"
            >
              Bind
            </el-link>
          </div>
        </div>

        <!-- 在安全信息下方添加编辑按钮 -->
        <div class="edit-section">
            <el-button
                type="primary"
                class="edit-button"
                @click="toggleEditForm"
            >
                {{ showEditForm ? 'Close Edit' : 'Edit Profile' }}
            </el-button>

          <!-- 下拉编辑表单 -->
          <transition name="slide-down">
            <div v-if="showEditForm" class="edit-form">
              <el-form :model="form" label-width="80px">
                <el-form-item label="Username">
                  <el-input
                    v-model="form.username"
                    size="small"
                    placeholder="Enter username"
                  />
                </el-form-item>

                <el-form-item label="Email">
                  <el-input
                    v-model="form.email"
                    type="email"
                    size="small"
                    placeholder="example@domain.com"
                  />
                </el-form-item>

                <el-form-item label="Phone">
                  <el-input
                    v-model="form.phone"
                    type="tel"
                    size="small"
                    placeholder="138-1234-5678"
                  />
                </el-form-item>

                <div class="form-actions">
                  <el-button
                    size="small"
                    @click="showEditForm = false"
                  >
                    Cancel
                  </el-button>
                  <el-button
                    type="primary"
                    size="small"
                    @click="submitForm"
                  >
                    Save
                  </el-button>
                </div>
              </el-form>
            </div>
          </transition>
        </div>
      </div>
    </aside>

    <!-- 右侧主内容 -->
    <main class="profile-main">
      <!-- 导航 -->
      <div class="order-stats">
        <div class="stat-item">
          <div class="stat-content">
            <span class="number">{{ pending.unpaid }}</span>
            <span class="label">Unpaid</span>
          </div>
          <el-divider direction="vertical" />
        </div>
        <div class="stat-item">
          <div class="stat-content">
            <span class="number">{{ pending.pending }}</span>
            <span class="label">Pending</span>
          </div>
          <el-divider direction="vertical" />
        </div>
        <div class="stat-item">
          <div class="stat-content">
            <span class="number">{{ pending.review }}</span>
            <span class="label">Review</span>
          </div>
          <el-divider direction="vertical" />
        </div>
        <div class="stat-item">
          <div class="stat-content">
            <span class="number">{{ pending.refunding }}</span>
            <span class="label">Refunding</span>
          </div>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="content-section">
        <!-- 最近订单 -->
        <div class="recent-orders">
          <h2>Latest Order</h2>
          <div class="order-list">
            <div
              v-for="order in orderList"
              :key="order.id"
              class="order-item"
            >
              <div class="order-header">
                <span>Order ID: {{ order.id }}</span>
                <el-tag type="success">Completed</el-tag>
              </div>

              <!-- 遍历所有商品项 -->
              <div
                v-for="item in order.items"
                :key="item.id"
                class="order-content"
              >
                <img
                  :src="item.image || '/placeholder.svg'"
                  class="product-img"
                  alt="Product"
                >
                <div class="product-info">
                  <h3>{{ item.name || 'Unnamed Product' }}</h3>
                  <p class="spec">
                    <span
                      v-for="(value, key) in item.specs"
                      :key="key"
                      class="spec-item"
                    >
                      {{ key }}:{{ value }}
                    </span>
                  </p>
                  <p class="price">
                    ¥{{ (item.price || 0).toFixed(2) }}
                    <span class="quantity">x{{ item.quantity || 0 }}</span>
                  </p>
                </div>
              </div>
              <div class="order-footer">
                <span>Total: ¥{{ parseFloat(order.total).toFixed(2) }}</span>
                <div class="actions">
                  <el-button type="primary" plain @click="$router.push(`/order/detail/${order.id}`)">View Details</el-button>
                  <el-button @click="buyAgain(order.items)">Buy Again</el-button>
                </div>
              </div>
            </div>
            <div v-if="orderList.length === 0" class="empty-orders">
              <el-empty description="No recent orders" />
            </div>
          </div>
        </div>

        <!-- 账户概览 -->
        <div class="account-overview">
          <h2>Account Overview</h2>
          <div class="overview-grid">
            <div class="overview-item balance">
              <i class="el-icon-wallet"></i>
              <div>
                <p>Balance</p>
                <h3>¥1,234.56</h3>
              </div>
            </div>
            <div class="overview-item points">
              <i class="el-icon-coin"></i>
              <div>
                <p>Points</p>
                <h3>1,200</h3>
              </div>
            </div>
            <div class="overview-item coupons">
              <i class="el-icon-ticket"></i>
              <div>
                <p>Available Coupons</p>
                <h3>5</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="Edit Profile"
      width="500px"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="Username">
          <el-input v-model="form.username" />
        </el-form-item>

        <el-form-item label="Email">
          <el-input v-model="form.email" type="email" />
        </el-form-item>

        <el-form-item label="Phone">
          <el-input v-model="form.phone" type="tel" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Confirm</el-button>
      </template>
    </el-dialog>

    <!-- 头像修改对话框 -->
    <el-dialog
      v-model="showAvatarDialog"
      title="Change Avatar"
      width="400px"
      class="avatar-dialog"
    >
      <el-upload
        class="avatar-uploader"
        :show-file-list="false"
        :auto-upload="false"
        :on-change="handleFileChange"
        :change="beforeAvatarUpload"
      >
        <div class="upload-content">
          <el-icon :size="50" class="upload-icon"><Upload /></el-icon>
          <p class="upload-text">Click or drag to upload</p>
          <p class="upload-tip">Supports JPG/PNG format, max size 2MB</p>
        </div>
      </el-upload>
      <template #footer>
        <el-button @click="showAvatarDialog = false">Cancel</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.profile-container {
  max-width: 1280px;
  margin: 2rem auto;
  display: flex;
  gap: 2rem;
  background: #f5f7fa;
  padding: 20px;
}

.profile-sidebar {
  width: 300px;
  flex-shrink: 0;

  .profile-card {
    background: #fff;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);

    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      margin: 0 auto 1rem;
      display: block;
      object-fit: cover;
      cursor: pointer;
      transition: filter 0.3s ease;

      &:hover {
        filter: brightness(0.8);
      }
    }

    .user-info {
      text-align: center;
      margin-bottom: 2rem;

      .name {
        font-size: 1.5rem;
        margin: 0.5rem 0;
      }

      .username {
        color: #909399;
        margin-bottom: 1rem;
      }

      .stats {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 1rem;

        .stat-item {
          text-align: center;

          strong {
            font-size: 1.2rem;
            color: #303133;
            display: block;
          }

          span {
            color: #909399;
            font-size: 0.9rem;
          }
        }
      }
    }

    .account-security {
      h3 {
        font-size: 1.1rem;
        color: #303133;
        margin-bottom: 1rem;
      }

      .security-item {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 0.8rem 0;
        border-top: 1px solid #ebeef5;

        i {
          font-size: 1.2rem;
          color: #909399;
        }

        span {
          flex: 1;
          color: #606266;
        }
      }
    }

    .edit-profile-section {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #ebeef5;

      .edit-button {
        width: 100%;
        padding: 12px;
      }
    }
  }
}

.profile-main {
  flex-grow: 1;

  .order-stats {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-around;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);

    .stat-item {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;

      &:last-child .el-divider {
        display: none;
      }

      .stat-content {
        text-align: center;
        padding: 0 20px;

        .number {
          display: block;
          font-size: 24px;
          color: #f56c6c;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .label {
          color: #909399;
          font-size: 14px;
        }
      }

      .el-divider {
        height: 40px;
        margin: 0 20px;
      }
    }
  }

  .content-section {
    .recent-orders {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);

      h2 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .order-item {
        border: 1px solid #ebeef5;
        border-radius: 6px;
        padding: 1rem;
        margin-bottom: 1rem;

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          color: #909399;
        }

        .order-content {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;

          .product-img {
            width: 80px;
            height: 80px;
            border-radius: 4px;
          }

          .product-info {
            flex: 1;

            h3 {
              font-size: 1rem;
              margin: 0 0 0.5rem;
            }

            .spec {
              color: #909399;
              font-size: 0.9rem;
              margin: 0.3rem 0;
            }

            .price {
              color: #f56c6c;
              font-weight: bold;
            }
          }
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #ebeef5;

          span {
            font-weight: bold;
            color: #303133;
          }

          .actions {
            display: flex;
            gap: 1rem;
          }
        }
      }
    }

    .account-overview {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);

      h2 {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .overview-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;

        .overview-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 6px;

          i {
            font-size: 2rem;
            padding: 1rem;
            border-radius: 50%;
            color: white;
          }

          p {
            margin: 0;
            color: #909399;
          }

          h3 {
            margin: 0.5rem 0 0;
            font-size: 1.5rem;
          }

          &.balance i { background: #67c23a; }
          &.points i { background: #e6a23c; }
          &.coupons i { background: #f56c6c; }
        }
      }
    }
  }
}

.edit-section {
  margin-top: 1.5rem;
  border-top: 1px solid #ebeef5;
  padding-top: 1rem;

  .edit-button {
    width: 100%;
    margin-bottom: 1rem;
  }
}

.edit-form {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #e9ecef;

  .el-form-item {
    margin-bottom: 12px;

    :deep(.el-form-item__label) {
      font-size: 13px;
      color: #6c757d;
    }
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 1rem;
  }
}

// 下拉动画
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 400px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-10px);
}

.avatar-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #ebeef5;
    padding: 16px 20px;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #ebeef5;
    padding: 12px 20px;
    text-align: right;
  }
}

.avatar-uploader {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #409eff;
  }

  .upload-content {
    text-align: center;

    .upload-icon {
      color: #909399;
      margin-bottom: 10px;
    }

    .upload-text {
      font-size: 14px;
      color: #606266;
      margin: 0;
    }

    .upload-tip {
      font-size: 12px;
      color: #909399;
      margin: 5px 0 0;
    }
  }
}
</style>
