<script setup>
import { ref } from 'vue'
import 'element-plus/theme-chalk/el-message.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { View, Hide } from '@element-plus/icons-vue';

import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cartStore';
import { jwtDecode } from 'jwt-decode';

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

// switch display of password
const showPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
}

// form validation
const form = ref({
  username: '',
  password: '',
  agree: false,
})

const rules = {
  username: [
    { required: true, message: 'The username cannot be empty', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length of username must be in 3-20', trigger: "blur" }
  ],
  password: [
    { required: true, message: 'The password cannot be empty', trigger: 'blur' },
    { min: 6, max: 20, message: 'Length of password must be in 6-20', trigger: 'blur'  }
  ],
  agree: [{
      validator: (rule, value, callback) => {
        if(value === true) {
          callback()
        } else {
          ElMessage.error('Please confirm our contract')
        }
      }
    }
  ]
}

const formRef = ref(null)

const afterLogin = () => {
  ElMessage({ type: 'success', message: 'Login success' })

  const is_staff = jwtDecode(userStore.userInfo.access).is_staff;
  // 判断是否为管理员
  if(!is_staff) {
    const redirect = router.currentRoute.value.query.redirect || '/'
    router.push(redirect)
  }
  else {
    router.replace({ path: '/admin' })
  }
}

const doLogin = () => {
  formRef.value.validate( async (valid) => {
    if(valid) {
        await userStore.getUserInfo({
          username: form.value.username,
          password: form.value.password
        })


      const dbcart = await cartStore.getCart()

      // 若购物车不为空：是否合并本地购物车
      if(cartStore.cartList.length !== 0) {
        ElMessageBox.confirm(
          'Item detected in local shopping cart. Would you like to merge in your account?',
          'Reminder',
          {
            confirmButtonText: 'Confirm',
            cancelButtonText: 'Cancel',
             type: 'warning',
          }
        ).then(() => {
          // 确认：将dbcart中的东西加入购物车
          for (let i of dbcart) {
            cartStore.addToCart(i)
          }
        }).catch(() => {
          // 取消：dbcart取代本地购物车
          cartStore.cartList = dbcart
        }).then(() => {
          afterLogin()
        })
      } else {
        cartStore.cartList = dbcart
        afterLogin()
      }
    }
  })
}
</script>

<template>
  <div @keyup.enter="doLogin">
    <header class="login-header">
      <div class="container m-top-20">
        <h1 class="logo">
          <RouterLink to="/">小兔鲜</RouterLink>
        </h1>
        <RouterLink class="entry" to="/">
          Back Home
          <i class="iconfont icon-angle-right"></i>
          <i class="iconfont icon-angle-right"></i>
        </RouterLink>
      </div>
    </header>
    <section class="login-section">
      <div class="wrapper">
        <nav>
          <a href="javascript:;">Sign in to Rabbuy</a>
        </nav>
        <div class="account-box">
          <div class="form">
            <el-form ref="formRef" :model="form" :rules="rules" label-position="left"
              status-icon>
              <el-form-item prop="username">
                <span class="form-label">Username</span>
                <el-input v-model="form.username" placeholder="Input Your Username" />
              </el-form-item>
              <el-form-item prop="password">
                <span class="form-label">Password</span>
                <span class="forgot-password"><a href="javascript:;">Forgot password?</a></span>
                <el-input
                  v-model="form.password"
                  placeholder="Input Your Password"
                  :type="showPassword ? 'text' : 'password'">
                  <template #suffix>
                    <el-icon
                      :class="['password-icon', {'active': showPassword }]"
                      @click="togglePasswordVisibility"
                    >
                    <component :is="showPassword ? View : Hide" />
                    </el-icon>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-checkbox  size="large" v-model="form.agree">
                  I agree the <a class="privacy">Privacy Policy.</a>
                </el-checkbox>
              </el-form-item>
              <div class="login-action">
                <el-button size="large" class="subBtn" @click="doLogin">Login</el-button>
                <span class="register">New user?
                    <a href="javascript:;" @click="$router.push({ path: '/register' })">Sign up!</a>
                </span>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </section>

    <footer class="login-footer">
      <div class="container">
        <p>
          <a href="javascript:;">About Us</a>
          <a href="javascript:;">Help Center</a>
          <a href="javascript:;">After-Sale</a>
          <a href="javascript:;">Delivery</a>
          <a href="javascript:;">Cooperation</a>
          <a href="javascript:;">Suggestions</a>
          <a href="javascript:;">Links</a>
        </p>
        <p>CopyRight &copy; Rabbuy</p>
      </div>
    </footer>
  </div>
</template>

<style scoped lang='scss'>
.login-header {
  background: #fff;
  border-bottom: 1px solid #e4e4e4;

  .container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
  }

  .logo {
    width: 200px;

    a {
      display: block;
      height: 132px;
      width: 100%;
      text-indent: -9999px;
      background: url("@/assets/images/logo.png") no-repeat center 18px / contain;
    }
  }

  .sub {
    flex: 1;
    font-size: 24px;
    font-weight: normal;
    margin-bottom: 38px;
    margin-left: 20px;
    color: #666;
  }

  .entry {
    width: 120px;
    margin-bottom: 38px;
    font-size: 16px;

    i {
      font-size: 14px;
      color: $xtxColor;
      letter-spacing: -5px;
    }
  }
}

.login-section {
  background: url('@/assets/images/login-bg.png') no-repeat center / cover;
  height: 488px;
  position: relative;

  .wrapper {
    width: 380px;
    background: #fff;
    position: absolute;
    left: 50%;
    top: 54px;
    transform: translate3d(100px, 0, 0);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);

    nav {
      font-size: 14px;
      height: 55px;
      margin-bottom: 20px;
      border-bottom: 1px solid #f5f5f5;
      display: flex;
      padding: 0 40px;
      text-align: right;
      align-items: center;

      a {
        flex: 1;
        line-height: 1;
        display: inline-block;
        font-size: 18px;
        position: relative;
        text-align: center;
      }
    }
  }
}

.login-footer {
  padding: 30px 0 50px;
  background: #fff;

  p {
    text-align: center;
    color: #999;
    padding-top: 20px;

    a {
      line-height: 1;
      padding: 0 10px;
      color: #999;
      display: inline-block;

      ~a {
        border-left: 1px solid #ccc;
      }
    }
  }
}

.password-icon {
  cursor: pointer;
  color: #c0c4cc;
  transition: color 0.2s;

  &:hover {
    color: #409eff;
  }

  &.active {
    color: #409eff;
  }
}

.form-label {
  font-size: 17px;
  color: #606266;
  margin-bottom: 4px;
}

.el-form-item {
  margin-bottom: 15px;
}

.forgot-password {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 13px;

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.login-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.register {
  margin-top: 15px;
  font-size: 13px;

  a {
    color: #409eff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

:deep(.el-checkbox) {
  .el-checkbox__label {
    color: inherit;
  }

  &.is-checked {
    .el-checkbox__label {
      color: inherit;
    }
  }
}

.account-box {
  .toggle {
    padding: 15px 40px;
    text-align: right;

    a {
      color: $xtxColor;

      i {
        font-size: 14px;
      }
    }
  }

  .form {
    padding: 0 20px 20px 20px;

    a.privacy {
      color: $xtxColor;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    &-item {
      margin-bottom: 28px;

      .input {
        position: relative;
        height: 36px;

        >i {
          width: 10px;
          height: 34px;
          background: #cfcdcd;
          color: #fff;
          position: absolute;
          left: 1px;
          top: 1px;
          text-align: center;
          line-height: 34px;
          font-size: 18px;
        }

        input {
          padding-left: 44px;
          border: 1px solid #cfcdcd;
          height: 36px;
          line-height: 36px;
          width: 100%;

          &.error {
            border-color: $priceColor;
          }

          &.active,
          &:focus {
            border-color: $xtxColor;
          }
        }

        .code {
          position: absolute;
          right: 1px;
          top: 1px;
          text-align: center;
          line-height: 34px;
          font-size: 14px;
          background: #f5f5f5;
          color: #666;
          width: 90px;
          height: 34px;
          cursor: pointer;
        }
      }

      >.error {
        position: absolute;
        font-size: 12px;
        line-height: 28px;
        color: $priceColor;

        i {
          font-size: 14px;
          margin-right: 2px;
        }
      }
    }

    .btn {
      display: block;
      width: 100%;
      height: 40px;
      color: #fff;
      text-align: center;
      line-height: 40px;
      background: $xtxColor;

      &.disabled {
        background: #cfcdcd;
      }
    }
  }

  .action {
    padding: 20px 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .url {
      a {
        color: #999;
        margin-left: 10px;
      }
    }
  }
}

.subBtn {
  background: $xtxColor;
  width: 100%;
  color: #fff;
}
</style>
