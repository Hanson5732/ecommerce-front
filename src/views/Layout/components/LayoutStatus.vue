<script setup>
import { useUserStore } from '@/stores/user'
import { saveCartToServer } from '@/composables/logout';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import { ref } from 'vue';

const router = useRouter()
const userStore = useUserStore()

const confirmLogout = async () => {
  await saveCartToServer('/')
}
const goToOrders = () => {
  router.push('/order')
}
const goToUserInfo = () => {
  router.push('/my_rabbuy')
}

const isStaff = ref(userStore.userInfo.access ? jwtDecode(userStore.userInfo.access).is_staff : false)
</script>

<template>
  <nav class="app-topnav">
    <div class="container">
      <ul>
        <template v-if="userStore.userInfo.username">
          <li><a href="javascript:;" @click="goToUserInfo"><i class="iconfont icon-user"></i>{{ userStore.userInfo.username }}</a></li>
          <li>
            <el-popconfirm @confirm="confirmLogout" title="Confirm logout?" confirm-button-text="Logout" cancel-button-text="Cancel">
              <template #reference>
                <a href="javascript:;">Logout</a>
              </template>
            </el-popconfirm>
          </li>
          <template v-if="!isStaff">
            <li><a href="javascript:;" @click="goToOrders">My Order</a></li>
            <li><a href="javascript:;">My Address</a></li>
          </template>
          <template v-else>
            <li><a href="/admin/product">Dashboard</a></li>
          </template>
          </template>
        <template v-else>
          <li><a href="javascript:;" @click="$router.push('/login')">Login</a></li>
          <li><a href="javascript:;" @click="$router.push('/register')">Register</a></li>
          <li><a href="javascript:;">Help Center</a></li>
          <li><a href="javascript:;">About</a></li>
        </template>
      </ul>
    </div>
  </nav>
</template>


<style scoped lang="scss">
.app-topnav {
  background: #333;
  ul {
    display: flex;
    height: 35px;
    justify-content: flex-end;
    align-items: center;
    li {
      a {
        padding: 0 15px;
        color: #cdcdcd;
        line-height: 1;
        display: inline-block;

        i {
          font-size: 14px;
          margin-right: 2px;
        }

        &:hover {
          color: $xtxColor;
        }
      }

      ~li {
        a {
          border-left: 2px solid #666;
        }
      }
    }
  }
}
</style>
