<script setup>
import { onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import 'element-plus/theme-chalk/el-message.css'
import { useUserStore } from '@/stores/user'
import SlidingCart from './SlidingCart.vue'
import { saveCartToServer } from '@/composables/logout'
import { getMessageCountAPI } from '@/apis/home'
import { jwtDecode } from 'jwt-decode'
import { getNotificationAPI } from '@/apis/home'

const userStore = useUserStore()
const slidingCartRef = ref(null)
const router = useRouter()

const confirmLogout = async () => {
  await saveCartToServer('/')
}

const openCart = (event) => {
  event.preventDefault()
  router.push('/cartlist')
}

const goToOrders = async (event) => {
  event.preventDefault()
  router.push('/order')
}

const isStaff = ref(userStore.userInfo.access ? jwtDecode(userStore.userInfo.access).is_staff : false)

const avatarUrl = userStore.userInfo.profile
const stats = [
  { icon: '&#x10186;', label: 'Mark', link: '#/favorites' },
  { icon: '&#x10187;', label: 'Cart', link: '#/cart', onClick: openCart },
  { icon: '&#x10188;', label: 'Note', link: '#/messages' },
  { icon: '&#x10189;', label: 'Order', link: '#/order', onClick: goToOrders }
]

const pending = ref({})

const getMessageCount = async () => {
  const res = await getMessageCountAPI(userStore.userInfo.id)
  pending.value = res.data
}

const orderMessageCount = ref(0)
const getNotification = async () => {
  const res = await getNotificationAPI(userStore.userInfo.id)
  orderMessageCount.value = res.data.count;
}

onBeforeMount( async () => {
  if(userStore.userInfo.id) {
    await getMessageCount()
    await getNotification()
  }
})

</script>

<template>
  <div v-if="userStore.userInfo.username" class="profile-card">
    <div class="avatar">
      <img :src="avatarUrl" alt="profile" @click="$router.push('/my_rabbuy')" />
    </div>
    <div class="user-info">
      <h2 @click="$router.push('/my_rabbuy')">{{ userStore.userInfo.username }}</h2>
      <div v-if="isStaff" class="admin-entrance">
        <a href="/admin">Dashboard</a>
        <span> | </span>
      </div>
      <el-popconfirm @confirm="confirmLogout" title="Confirm logout?" confirm-button-text="Logout" cancel-button-text="Cancel">
        <template #reference>
          <a href="javascript:;">Logout</a>
        </template>
      </el-popconfirm>
    </div>
    <div class="stats">
      <a
        v-for="(item, index) in stats"
        :key="index"
        :href="item.link"
        class="stat-item"
        @click="item.onClick ? item.onClick($event) : null"
      >
        <span class="iconfont" v-html="item.icon"></span>
        <span>{{ item.label }}</span>
        <span v-if="item.label === 'Order' && orderMessageCount > 0" class="order-badge">
          {{ orderMessageCount > 99 ? '99+' : orderMessageCount }}
        </span>
      </a>
    </div>
    <p class="orderstatus">Order Status:</p>
    <div class="pending">
      <div class="pending-item">
        <span class="number">{{ pending.unpaid }}</span>
        <span class="label">Unpaid</span>
      </div>
      <div class="pending-item">
        <span class="number">{{ pending.pending }}</span>
        <span class="label">Pending</span>
      </div>
      <div class="pending-item">
        <span class="number">{{ pending.review }}</span>
        <span class="label">Review</span>
      </div>
      <div class="pending-item">
        <span class="number">{{ pending.refunding }}</span>
        <span class="label">Refunding</span>
      </div>
    </div>

    <!-- Membership Cards -->
    <div class="membership-cards">
      <div class="card plus-member">
        <div class="card-content">
          <h3>PLUS</h3>
          <button class="activate-btn brown">Start</button>
        </div>
      </div>
      <div class="card enterprise-member">
        <div class="card-content">
          <h3>Member</h3>
          <button class="activate-btn blue">Join</button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="profile-card-n">
    <div class="avatar">
      <img src="/src/assets/images/200.png" alt="" @click="$router.push({ path: '/login' })" />
      <div class="avatar-links">
        <a href="javascript:;" @click="$router.push({ path: '/register' })">Signup</a>
        <span> | </span>
        <a href="javascript:;">I'm a manager</a>
      </div>
    </div>
    <div class="user-info">
      <h2><a @click="$router.push({ path: '/login' })">You are currently logout</a></h2>
    </div>
    <el-button size="large" @click="$router.push({ path: '/login' })" class="loginBtn">Login</el-button>
  </div>

  <SlidingCart ref="slidingCartRef" />
</template>

<style scoped lang="scss">
@font-face {
  font-family: 'iconfont'; /* Project id 3373080 */
  src: url('//at.alicdn.com/t/font_3373080_mefuod36dv.woff2?t=1651511952500') format('woff2'),
       url('//at.alicdn.com/t/font_3373080_mefuod36dv.woff?t=1651511952500') format('woff'),
       url('//at.alicdn.com/t/font_3373080_mefuod36dv.ttf?t=1651511952500') format('truetype');
}

/* 定义使用iconfont的样式 */
.iconfont {
  font-family: "iconfont" !important;
  font-size: 24px; /* Increased from 16px */
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
  transition: color 0.3s; /* 添加过渡效果 */
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
  gap: 8px;
  position: relative;

  .order-badge {
    position: absolute;
    top: -5px;
    right: 0px;
    background-color: #ff6b6b;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    width: 18px;
    height: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.stat-item:hover {
  color: $xtxColor;
}

.profile-card {
  border: 1px solid #eaeaea;
  border-radius: 10px;
  padding: 20px;
  width: 250px;
  height: 500px;
  text-align: center;
  background-color: #fff;

  div.avatar img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    transition: filter 0.3s ease;
    &:hover {
      filter: brightness(0.8);
      cursor: pointer;
    }
  }

  div.user-info h2 {
    margin: 10px 0;
    font-size: 18px;
    transition: color 0.3s ease;
    &:hover {
      color: $xtxColor;
      cursor: pointer;
    }
  }

  div.user-info a {
    margin: 5px 0;
    font-size: 14px;

    &:hover {
      color: $xtxColor;
      text-decoration: underline;
    }
  }

  .admin-entrance {
    display: inline-block;
    margin-right: 8px;

    a {
      color: inherit;
      text-decoration: none;

      &:hover {
        color: $xtxColor;
        text-decoration: underline;
      }
    }
  }
}

.profile-card-n {
  border: 1px solid #eaeaea;
  border-radius: 10px;
  padding: 20px;
  width: 250px;
  background-color: #fff;

  div.avatar {
    position: relative;
    img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }
    .avatar-links {
      position: absolute;
      bottom: 0px; /* 调整位置，使其在头像下方 */
      right: 0;
      display: flex;
      align-items: center; /* 垂直居中 */
      font-size: 12px;
      color: #666;
      a {
        color: #666;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
          color: $xtxColor;
        }
      }
      span {
        margin: 0 4px; /* 调整分隔符的间距 */
        color: #666; /* 分隔符颜色 */
      }
    }
  }

  div.user-info h2 {
    text-align: center;
    margin: 10px 0;
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  div.user-info a {
    margin: 5px 0;
    font-size: 14px;
  }
}

.stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0 25px; /* Adjusted margins */
  padding: 0 10px; /* Added padding */
}

.orderstatus {
  text-align: left;
  margin-left: 15px;
}

.pending {
  display: flex;
  justify-content: space-between;
  padding: 15px 10px; /* Adjusted padding */
  background: #f5f5f5;
  border-radius: 8px;
  margin: 15px 0;

  .pending-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    gap: 6px; /* Added consistent gap */

    .number {
      font-size: 24px;
      font-weight: bold;
      line-height: 1;
    }

    .label {
      font-size: 10px; /* Slightly increased for better readability */
      color: #666;
    }
  }
  .pending-item:not(:last-child)::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 80%;
      width: 1px;
      background-color: #e4e4e4;
    }
}

.membership-cards {
  display: flex;
  gap: 10px;
  margin-top: 20px;

  .card {
    flex: 1;
    border-radius: 8px;
    padding: 15px;
    color: #fff;

    &.plus-member {
      background: linear-gradient(to right, #e6c48c, #d4af6f);
    }

    &.enterprise-member {
      background: linear-gradient(to right, #7aa5eb, #5785e0);
    }

    .card-content {
      h3 {
        font-size: 16px;
        margin: 0 0 5px 0;
      }

      p {
        font-size: 12px;
        margin: 0 0 10px 0;
        opacity: 0.9;
      }

      .activate-btn {
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;

        &.brown {
          background: #8b6d42;
          color: #fff;
        }

        &.blue {
          background: #3668d1;
          color: #fff;
        }

        &:hover {
          opacity: 0.9;
        }
      }
    }
  }
}

.loginBtn {
  background: $xtxColor;
  width: 100%;
  color: #fff;
}
</style>

