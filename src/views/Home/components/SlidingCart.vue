<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/user';
import router from '@/router';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Delete } from '@element-plus/icons-vue'

const userStore = useUserStore()

const isOpen = ref(false)

const toggleCart = () => {
  isOpen.value = !isOpen.value
}

// 购物车数据
const cartStore = useCartStore()
const cartItems = computed(() => cartStore.cartList)

const totalCount = computed(() => cartStore.totalCount)
const totalPrice = computed(() => cartStore.totalPrice)

const removeItem = (id) => {
  const index = cartItems.value.findIndex(item => item.id === id)
  if (index !== -1) {
    cartItems.value.splice(index, 1)
    // 在实际应用中，这里应该重新计算总数和总价
    totalCount.value -= 1
    totalPrice.value -= cartItems.value[index].price * cartItems.value[index].count
  }
}

const cartList = computed(() => cartStore.cartList)
// 初始化选中商品列表
const selectedItems = ref(cartList.value.filter(item => item.status))

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

const clearCart = () => {
  if(cartStore.cartList.length !== 0) {
    ElMessageBox.confirm(
      'Are you sure you want to clear the cart?',
      'Confirm Clear Cart',
      {
        confirmButtonText: 'Clear',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    ).then(() => {
      cartStore.clearCart()
    }).catch(() => {})
  }
  else {
    ElMessage.warning('Nothing in your cart yet')
  }
}

defineExpose({
  toggleCart
})

const checkout = async () => {
  if (!userStore.userInfo.access){
    // 若未登录，请求跳转到登录界面
    ElMessageBox.confirm(
      'You haven\'t logged in yet. Checkout isn\'t allowed for any anonymous users.',
      'Reminder',
      {
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    ).then(() => {
      // 跳转到登录界面
      router.push('/login')
      toggleCart()
    }).catch(() => {
      // 没有操作
    })
  } else {
    // 若已登录，跳转到cartlist
    router.push('/cartlist');
    toggleCart();
  }
}
</script>

<template>
  <div class="sliding-cart">
    <Transition name="slide">
      <div v-if="isOpen" class="cart-panel">
        <div class="header">
          <h3>My Cart</h3>
          <button class="close-btn" @click="toggleCart">
            <i class="iconfont icon-close-new"></i>
          </button>
        </div>
        <div class="list">
          <div class="item" v-for="item in cartItems" :key="item.id" :class="{ disabled: !item.status }">
            <div class="item-wrapper" v-if="item.status">
              <RouterLink :to="`/product/${item.id}`">
                <img :src="item.image" alt="" />
                <div class="center">
                  <p class="name ellipsis-2">
                    {{ item.name }}
                  </p>
                </div>
              </RouterLink>
              <div class="right">
                <p class="price">&yen;{{ item.price }}</p>
                <el-input-number
                  size="small"
                  v-model="item.count"
                  @change="(value) => updateCount(item.id, value)"
                  :min="1"
                  :disabled="!item.status"
                  class="input-number"
                />
              </div>
            </div>
            <div v-else class="disabled-content">
              <img :src="item.image" alt="" />
              <div class="center">
                <p class="name ellipsis-2">
                  {{ item.name }}
                </p>
              </div>
              <div class="right">
                <p class="price">&yen;{{ item.price }}</p>
                <p class="count">x{{ item.count }}</p>
              </div>
              <span class="disabled-text">Disabled</span>
            </div>
            <i class="iconfont icon-close-new" @click="removeItem(item.id)"></i>
          </div>
          <el-empty v-if="cartItems.length === 0" description="Cart is empty" />
        </div>
        <div class="foot">
          <div class="total">
            <p>Subtotal ({{ totalCount }} items):</p>
            <p>&yen; {{ totalPrice.toFixed(2) }} </p>
          </div>
          <el-icon class="delete-icon" @click="clearCart"><Delete /></el-icon>
          <el-button size="large" type="primary" @click="checkout">
            Open Cartlist
          </el-button>
        </div>
      </div>
    </Transition>
    <div v-if="isOpen" class="overlay" @click="toggleCart"></div>
  </div>
</template>

<style scoped lang="scss">
.input-number {
  margin-top: 5px;
  width: 100px;
  margin-right: 20px;
}

.sliding-cart {
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }

  .cart-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 450px;
    height: 100vh;
    background: #fff;
    z-index: 999;
    display: flex;
    flex-direction: column;

    .header {
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f5f5f5;

      h3 {
        font-size: 18px;
        font-weight: normal;
      }

      .close-btn {
        border: none;
        background: none;
        cursor: pointer;
        font-size: 22px;
        color: #999;

        &:hover {
          color: $xtxColor;
        }
      }
    }

    .list {
      flex: 1;
      overflow: auto;
      padding: 0 20px;

      &::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }

      &::-webkit-scrollbar-track {
        background: #f8f8f8;
        border-radius: 2px;
      }

      &::-webkit-scrollbar-thumb {
        background: #eee;
        border-radius: 10px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: #ccc;
      }

      .item {
        border-bottom: 1px solid #f5f5f5;
        padding: 10px 0;
        position: relative;

        i {
          position: absolute;
          bottom: 38px;
          right: 0;
          opacity: 0;
          color: #666;
          transition: all 0.5s;
        }

        &:hover {
          i {
            opacity: 1;
            cursor: pointer;
          }
        }

        .item-wrapper {
          display: flex;
          align-items: center;

          a {
            display: flex;
            align-items: center;

            img {
              height: 80px;
              width: 80px;
              object-fit: cover;
            }

            .center {
              padding: 0 10px;
              width: 280px;

              .name {
                font-size: 16px;
              }

              .attr {
                color: #999;
                padding-top: 5px;
              }
            }
          }

          .right {
            width: 150px;
            padding-right: 20px;
            text-align: center;
            margin-right: 20px;

            .price {
              font-size: 16px;
              color: $priceColor;
              margin-right: 20px;
            }

            .count {
              color: #999;
              margin-top: 5px;
              font-size: 16px;
            }
          }
        }

        &.disabled {
          opacity: 0.6;

          img {
            filter: grayscale(100%);
            height: 80px;
            width: 80px;
          }

          .center {
            padding: 0 10px;
            width: 300px;

            .name {
              font-size: 16px;
              color: #999 !important;
            }

            .attr {
              color: #999;
              padding-top: 5px;
            }
          }

          .right {
            width: 200px;
            padding-right: 20px;
            text-align: center;

            .price {
              font-size: 16px;
              color: #999 !important;
            }

            .count {
              color: #999;
              margin-top: 5px;
              font-size: 16px;
              color: #999 !important;
            }
          }
        }

        .disabled-content {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          opacity: 0.6;
        }

        .disabled-text {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 20px;
          font-weight: bold;
          color: $priceColor;
          pointer-events: none;
        }
      }
    }

    .foot {
      padding: 20px;
      border-top: 1px solid #f5f5f5;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .total {
        padding-left: 10px;
        color: #999;

        p {
          &:last-child {
            font-size: 18px;
            color: $priceColor;
          }
        }
      }

      .delete-icon {
        font-size: 24px;
        color: #666;
        cursor: pointer;
        margin-left: 10px;

        &:hover {
          color: $xtxColor;
        }
      }

      .el-button {
        margin-left: 10px;
      }
    }
  }
}

// Slide animation
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease-out;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}
</style>

