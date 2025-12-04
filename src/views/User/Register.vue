<script setup>
import { ref, watch } from 'vue'
import 'element-plus/theme-chalk/el-message.css'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { View, Hide } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/user'
import { addRegisterAddressAPI } from '@/apis/address';

const router = useRouter()
const userStore = useUserStore();

// switch display of password
const showPassword = ref(false);
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
}
// switch display of password confirmation
const confirmPassword = ref(false);
const toggleConfirmVisibility = () => {
  confirmPassword.value = !confirmPassword.value;
}

// form validation
const form = ref({
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPwd: '',
})

const passwordStrength = ref(1) // 密码强度值，1-5

// 监听密码变化
watch(() => form.value.password, (newVal) => {
  passwordStrength.value = evaluatePasswordStrength(newVal)
})

// 密码强度评估函数
const evaluatePasswordStrength = (password) => {
  let strength = 1

  // 检查密码长度
  if (password.length >= 8) strength++

  // 检查字符类型
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  // 计算字符类型数量
  const typeCount = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length

  // 只有当字符类型大于1时才增加强度
  if (typeCount > 1) {
    strength += typeCount - 1
  }

  // 确保强度在1-5之间
  return Math.min(Math.max(strength, 1), 5)
}

// 密码输入限制
const validatePassword = (rule, value, callback) => {
  if (!/^[ -~]+$/.test(value)) {
    callback(new Error('Password only accpets letters, digits, and other keyboard characters'))
  } else if (passwordStrength.value < 4) {
    callback(new Error('Your password isn\'t strong enough'))
  } else {
    passwordStrength.value = evaluatePasswordStrength(value)
    callback()
  }
}

// 添加颜色计算函数
const getProgressColor = (percentage) => {
  if (percentage <= 20) return '#ff4d4f'; // 红色
  if (percentage <= 40) return '#ff7a45'; // 橙色
  if (percentage <= 60) return '#ffc53d'; // 黄色
  if (percentage <= 80) return '#a0d911'; // 黄绿色
  return '#52c41a'; // 绿色
}

const userRules = {
  username: [
    { required: true, message: 'The username cannot be empty', trigger: 'blur' },
    { min: 3, max: 20, message: 'Length of username must be in 3-20', trigger: "blur" }
  ],
  email: [
    { required: true, message: "The email cannot be empty", trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      message: 'Please enter a valid email address',
      trigger: 'blur'
    }
  ],
  firstName: [
    { required: true, message: 'The first name cannot be empty', trigger: 'blur' },
  ],
  lastName: [
    { required: true, message: 'The last name cannot be empty', trigger: 'blur' },
  ],
  password: [
    { min: 6, max: 20, message: 'Length of password must be in 6-20', trigger: 'blur'  },
    { validator: validatePassword, trigger: 'blur' }
  ],
  confirmPwd: [
    { required: true, message: 'Please confirm your password', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value === form.value.password) {
          callback();
        } else {
          callback(new Error('The two passwords do not match'));
        }
      },
      trigger: 'blur'
    }
  ]
}

const addressRules = {
  phone: [
  { required: true, message: 'The phone cannot be empty', trigger: 'blur' },
  ],
  province: [
    { required: true, message: 'The province cannot be empty', trigger: 'blur' },
  ],
  city: [
    { required: true, message: 'The city cannot be empty', trigger: 'blur' },
  ],
  district: [
    { required: true, message: 'The district cannot be empty', trigger: 'blur' },
  ],
  additionalAddr: [
    { required: true, message: 'The additional address cannot be empty', trigger: 'blur' },
  ],
}

const formRef = ref(null)

const addressRef = ref(null)

const showAddDialog = ref(false)

// 新增地址对象
const newAddress = ref({
  recipient: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  additionalAddr: '',
  postalCode: '',
  isDefault: true
})

const doRegister = () => {
  formRef.value.validate(async (valid) => {
    if(valid) {
      // 主表单验证通过后，设置收件人并弹出地址表单
      newAddress.value.recipient = form.value.firstName + ' ' + form.value.lastName
      showAddDialog.value = true
    } else {
      // 主表单验证失败时给出提示
      ElMessage({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      })
    }
  })
}

const handleAddAddress = () => {
  addressRef.value.validate(async (valid) => {
    if (valid) {
      // 地址表单验证成功
      showAddDialog.value = false

      const { username, email, firstName, lastName, password, confirmPwd } = form.value;
      const user = await userStore.register({
        username,
        email,
        firstName,
        lastName,
        password,
        confirmPwd
      });

      // 添加地址
      await addRegisterAddressAPI(newAddress.value, user.access)

      ElMessage({type:'success', message:'Registration successful!'});

      showAddDialog.value = false
    // 重置地址表单
    newAddress.value = {
      recipient: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      additionalAddr: '',
    }
      router.push({ path: '/login' });
    } else {
      // 地址表单验证失败时给出提示，但不关闭对话框
      ElMessage({
        type: 'error',
        message: 'Please fill in all required fields correctly'
      })
    }
  })
}

</script>

  <template>
    <!-- 添加地址 -->
    <el-dialog v-model="showAddDialog" title="Provide a default Address" width="50%" center>
      <el-form  ref="addressRef" :model="newAddress" :rules="addressRules" label-width="120px" class="address-form">
        <el-form-item label="Recipient">
          <span>{{ newAddress.recipient }}</span>
        </el-form-item>
        <el-form-item label="Contact" prop="phone">
          <el-input v-model="newAddress.phone" />
        </el-form-item>
        <el-form-item label="Province" prop="province">
          <el-input v-model="newAddress.province" />
        </el-form-item>
        <el-form-item label="City" prop="city">
          <el-input v-model="newAddress.city" />
        </el-form-item>
        <el-form-item label="District" prop="district">
          <el-input v-model="newAddress.district" />
        </el-form-item>
        <el-form-item label="Detail Address" prop="additionalAddr">
          <el-input v-model="newAddress.additionalAddr" />
        </el-form-item>
        <el-form-item label="Postal Code">
          <el-input v-model="newAddress.postalCode" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">Cancel</el-button>
          <el-button type="primary" @click="handleAddAddress">Confirm</el-button>
        </span>
      </template>
    </el-dialog>
    <div>
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
            <a href="javascript:;">Sign up to Rabbuy</a>
          </nav>
          <div class="account-box">
            <div class="form">
              <el-form ref="formRef" :model="form" :rules="userRules" label-position="left" status-icon>
                <el-form-item prop="username">
                  <span class="form-label">Username</span>
                  <el-input v-model="form.username" placeholder="Input Your Username" />
                </el-form-item>
                <el-form-item prop="email">
                  <span class="form-label">Email</span>
                  <el-input v-model="form.email" placeholder="Input Your Email" />
                </el-form-item>
                <el-form-item prop="firstName">
                  <span class="form-label">First Name</span>
                  <el-input v-model="form.firstName" placeholder="Input Your First Name" />
                </el-form-item>
                <el-form-item prop="lastName">
                  <span class="form-label">Last Name</span>
                  <el-input v-model="form.lastName" placeholder="Input Your Last Name" />
                </el-form-item>
                <el-form-item prop="password">
                  <span class="form-label">Password</span>
                  <el-input v-model="form.password" placeholder="Input Your Password" :type="showPassword ? 'text' : 'password'">
                    <template #suffix>
                      <el-icon :class="['password-icon', {'active': showPassword }]" @click="togglePasswordVisibility">
                        <component :is="showPassword ? View : Hide" />
                      </el-icon>
                    </template>
                  </el-input>
                  <div class="password-strength">
                    <el-progress
                      :percentage="(passwordStrength / 5) * 100"
                      :color="getProgressColor((passwordStrength / 5) * 100)"
                      :status="passwordStrength > 3 ? 'success' : 'exception'"
                    />
                    <div class="strength-text">
                      Password strength:
                      <span :style="{ color: getProgressColor((passwordStrength / 5) * 100) }">
                        {{ ['very weak', 'weak', 'medium', 'strong', 'very strong'][passwordStrength-1] }}
                      </span>
                    </div>
                  </div>
                </el-form-item>
                <el-form-item>
                  <span class="form-label" prop="confirmPwd">Confirm Password</span>
                  <el-input  v-model="form.confirmPwd" placeholder="Confirm Your Password" :type="showPassword ? 'text' : 'password'">
                    <template #suffix>
                      <el-icon :class="['password-icon', {'active': confirmPassword }]" @click="toggleConfirmVisibility">
                        <component :is="confirmPassword ? View : Hide" />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <div class="login-action">
                  <el-button size="large" @click="doRegister" class="subBtn">Sign Up</el-button>
                  <span class="register">
                    Already have an account? <a href="javascript:;" @click="$router.push({ path: '/login' })">Sign in!</a>
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
  .address-form {
    .el-form-item {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
      margin-top: 10px;
      margin-bottom: 20px;

      .el-input {
        width: 100%;
      }
    }
  }

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
    background: url('@/assets/images/signup-bg.png') no-repeat center / cover;
    height: 730px;
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

  .password-strength {
    margin-top: 8px;
    width: 100%;

    .el-progress {
      width: 100%;
    }

    .strength-text {
      font-size: 12px;
      color: #606266;

      span {
        font-weight: bold;
      }
    }
  }
  </style>
