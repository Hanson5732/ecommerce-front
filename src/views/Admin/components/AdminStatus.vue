<script setup>
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router';

const userStore = useUserStore()
const router = useRouter()

const confirmLogout = () => {
  userStore.clearUserInfo()
  router.push('/')
}
</script>

<template>
  <nav class="app-topnav admin-status">
    <div>
      <ul>
        <template v-if="userStore.userInfo.username">
          <li><a href="javascript:;"><i class="iconfont icon-user"></i>{{ userStore.userInfo.username }}</a></li>
          <li>
            <el-popconfirm @confirm="confirmLogout" title="Confirm logout?" confirm-button-text="Logout" cancel-button-text="Cancel">
              <template #reference>
                <a href="javascript:;">Logout</a>
              </template>
            </el-popconfirm>
          </li>
          <li>
            <a href="/">Home</a>
          </li>
          <!-- <li><a href="javascript:;">My Order</a></li>
          <li><a href="javascript:;">My Address</a></li> -->
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

<style lang="scss">
.admin-status {
  position: sticky;
  top: 0;
  z-index: 101;
}
</style>

<style scoped lang="scss">
.app-topnav {
  background: #333;
  min-width: 1280px;
  ul {
    display: flex;
    height: 35px;
    justify-content: flex-end;
    align-items: center;
    margin-right: 100px;

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
