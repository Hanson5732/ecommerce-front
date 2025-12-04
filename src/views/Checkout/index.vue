<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useCartStore } from '@/stores/cartStore';
import { getAddressAPI, addAddressAPI} from '@/apis/address';
import { createOrderAPI } from '@/apis/checkout';
import AddressDialog from './components/AddressDialog.vue'
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

const addresses = ref([])   // 地址列表
const curAddress = ref({})  // 当前地址对象
const getUserAddress = async (userId) => {
  const res = await getAddressAPI(userId)
  addresses.value = res.data?.map(address => ({
    ...address,
    fullLocation: address.province === address.city
      ? `${address.district}, ${address.province}`
      : `${address.district}, ${address.city}, ${address.province}`
  }))
  // 将默认地址放在数组第一位
  addresses.value.sort((a, b) => b.is_default - a.is_default)
  // 设置当前地址为默认地址
  curAddress.value = addresses.value.find(addr => addr.isDefault) || {}
}

onMounted(() => {
  getUserAddress(userStore.userInfo.id);
})

// 引入AddressDialog组件
const addressDialog = ref(null)

// 切换地址按钮
const showChangeDialog = () => {
  addressDialog.value.showChangeDialog = true
}

// 增加地址按钮
const showAddDialog = () => {
  addressDialog.value.showAddDialog = true
}

// 处理地址切换
const handleChangeAddress = (address) => {
  curAddress.value = address
}

// 处理地址添加
const handleAddAddress = async (newAddress) => {
  newAddress.user_id = userStore.userInfo.id
  if(addresses.value.length >= 5) ElMessage.error('You can only have 5 addresses in total.')
  // 处理添加地址的逻辑
  const res = await addAddressAPI(newAddress)
  if(res.code === 1){
    ElMessage.success('Address added successfully')
    addresses.value.push({
      ...res.data,
      fullLocation: res.data.province === res.data.city
      ? `${res.data.district}, ${res.data.province}`
      : `${res.data.district}, ${res.data.city}, ${res.data.province}`
    })
  }
}

// 使用computed筛选出已选中的商品
const checkInfo = computed(() => {
  const selectedGoods = cartStore.cartList.filter(item => item.selected)
  const totalGoodsPrice = selectedGoods
    .reduce((sum, item) => sum + parseFloat(item.price) * item.count, 0)

  const postFee = computed(() => {
    switch (true) {
      case totalGoodsPrice === 0:
        return 0
      case totalGoodsPrice > 0 && totalGoodsPrice <= 50:
        return 5
      case totalGoodsPrice > 50 && totalGoodsPrice <= 300:
        return 8
      case totalGoodsPrice > 300 && totalGoodsPrice <= 1000:
        return 10
      default:
        return 12
    }
  })

  return {
    goods: selectedGoods.map(item => ({
      id: item.id,
      name: item.name,
      image: item.image,
      price: parseFloat(item.price),
      count: item.count,
      totalPrice: (parseFloat(item.price) * item.count),
    })),
    summary: {
      goodsCount: selectedGoods.length,
      totalPrice: totalGoodsPrice,
      postFee: postFee.value,
      totalPayPrice: (totalGoodsPrice + postFee.value).toFixed(2)
    }
  }
})

const order = ref({
  deliveryTime: '0',  //默认为全时间段
  products: checkInfo.value.goods.map(item => {
    return {
      id: item.id,
      name: item.name,
      image: item.image,
      count: item.count,
      price: item.price,
    }
  }),
  addressId: curAddress.value.id,
  userId: userStore.userInfo.id,
  amount: checkInfo.value.summary.totalPayPrice,
})

// 创建订单
const createOrder = async () => {
  order.value.addressId = curAddress.value.id

  order.value.products = checkInfo.value.goods.map(item => ({
    id: item.id,
    count: item.count,
  }))

  const res = await createOrderAPI(order.value)
  const orderId = res.data.id
  router.replace({
    path: `/pay/${orderId}`,
  })
  // 清除要结算的商品
  for (let item of order.value.products) {
    cartStore.deleteCart(item.id)
  }
  // 保存
  cartStore.saveCart(
    cartStore.cartList.map(item => {
      return {
        'id': item.id,
        'count': item.count
      }
    })
  )
}
</script>

<template>
  <div class="xtx-pay-checkout-page">
    <div class="container">
      <div class="wrapper">
        <!-- 收货地址 -->
        <h3 class="box-title">Shipping Address</h3>
        <div class="box-body">
          <div class="address">
            <div class="text">
              <div class="none" v-if="!curAddress">Please add a shipping address to proceed with your order.</div>
              <ul v-else>
                <li><span>Recipient: </span>{{ curAddress.recipient }}</li>
                <li><span>Contact: </span>{{ curAddress.phone }}</li>
                <li><span>Address: </span>{{ curAddress.additionalAddr }}, {{ curAddress.fullLocation }}</li>
              </ul>
            </div>
            <div class="action">
              <el-button size="large" @click="showChangeDialog" style="width: 100px;">Change</el-button>
              <el-button size="large" @click="showAddDialog" style="width: 100px;">Add</el-button>
            </div>
          </div>
        </div>
        <!-- 商品信息 -->
        <h3 class="box-title">Order Information</h3>
        <div class="box-body">
          <table class="goods">
            <thead>
              <tr>
                <th width="520">Product Information</th>
                <th width="170">Unit Price</th>
                <th width="170">Quantity</th>
                <th width="170">Total Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in checkInfo.goods" :key="i.id">
                <td>
                  <a href="javascript:;" class="info">
                    <img :src="i.image" alt="">
                    <div class="right">
                      <p>{{ i.name }}</p>
                    </div>
                  </a>
                </td>
                <td>&yen;{{ i.price }}</td>
                <td>{{ i.count }}</td>
                <td>&yen;{{ i.totalPrice }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- 配送时间 -->
        <h3 class="box-title">Delivery Time</h3>
        <div class="box-body">
          <a class="my-btn"
             :class="{active: order.deliveryTime === '0'}"
             @click="order.deliveryTime = '0'">Anytime</a>
          <a class="my-btn"
             :class="{active: order.deliveryTime === '1'}"
             @click="order.deliveryTime = '1'">Weekdays (Mon-Fri)</a>
          <a class="my-btn"
             :class="{active: order.deliveryTime === '2'}"
             @click="order.deliveryTime = '2'">Weekends (Sat-Sun)</a>
        </div>
        <!-- 金额明细 -->
        <h3 class="box-title">Order Summary</h3>
        <div class="box-body">
          <div class="total">
            <dl>
              <dt>Number of Items: </dt>
              <dd>{{ checkInfo.summary?.goodsCount }} item(s)</dd>
            </dl>
            <dl>
              <dt>Subtotal: </dt>
              <dd>&yen;{{ checkInfo.summary?.totalPrice.toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>Shipping Fee: </dt>
              <dd>&yen;{{ checkInfo.summary?.postFee.toFixed(2) }}</dd>
            </dl>
            <dl>
              <dt>Total Amount: </dt>
              <dd class="price">&yen;{{ checkInfo.summary?.totalPayPrice }}</dd>
            </dl>
          </div>
        </div>
        <!-- 提交订单 -->
        <div class="submit">
          <el-button type="primary" size="large" @click="createOrder">Place Order</el-button>
        </div>
      </div>
    </div>
  </div>
  <AddressDialog
    :addresses="addresses"
    @change-address="handleChangeAddress"
    @add-address="handleAddAddress"
    ref="addressDialog"
  />
</template>

<style scoped lang="scss">
@use "sass:color";

.xtx-pay-checkout-page {
  margin-top: 20px;

  .wrapper {
    background: #fff;
    padding: 0 20px;

    .box-title {
      font-size: 16px;
      font-weight: normal;
      padding-left: 10px;
      line-height: 70px;
      border-bottom: 1px solid #f5f5f5;
    }

    .box-body {
      padding: 20px 0;
    }
  }
}

.address {
  border: 1px solid #f5f5f5;
  display: flex;
  align-items: center;

  .text {
    flex: 1;
    min-height: 90px;
    display: flex;
    align-items: center;

    .none {
      line-height: 90px;
      color: #999;
      text-align: center;
      width: 100%;
    }

    >ul {
      flex: 1;
      padding: 20px;

      li {
        line-height: 30px;

        span {
          color: #999;
          margin-right: 5px;

          >i {
            width: 0.5em;
            display: inline-block;
          }
        }
      }
    }

    >a {
      color: $xtxColor;
      width: 160px;
      text-align: center;
      height: 90px;
      line-height: 90px;
      border-right: 1px solid #f5f5f5;
    }
  }

  .action {
    width: 420px;
    text-align: center;

    .btn {
      width: 140px;
      height: 46px;
      line-height: 44px;
      font-size: 14px;

      &:first-child {
        margin-right: 10px;
      }
    }
  }
}

.goods {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;

  .info {
    display: flex;
    text-align: left;

    img {
      width: 70px;
      height: 70px;
      margin-right: 20px;
    }

    .right {
      line-height: 24px;

      p {
        &:last-child {
          color: #999;
        }
      }
    }
  }

  tr {
    th {
      background: #f5f5f5;
      font-weight: normal;
    }

    td,
    th {
      text-align: center;
      padding: 20px;
      border-bottom: 1px solid #f5f5f5;

      &:first-child {
        border-left: 1px solid #f5f5f5;
      }

      &:last-child {
        border-right: 1px solid #f5f5f5;
      }
    }
  }
}

.my-btn {
  width: 228px;
  height: 50px;
  border: 1px solid #e4e4e4;
  text-align: center;
  line-height: 48px;
  margin-right: 25px;
  color: #666666;
  display: inline-block;

  &.active,
  &:hover {
    border-color: $xtxColor;
    background: color.adjust($xtxColor, $lightness: 50%);
  }
}

.total {
  dl {
    display: flex;
    justify-content: flex-end;
    line-height: 50px;

    dt {
      i {
        display: inline-block;
        width: 2em;
      }
    }

    dd {
      width: 240px;
      text-align: right;
      padding-right: 70px;

      &.price {
        font-size: 20px;
        color: $priceColor;
      }
    }
  }
}

.submit {
  text-align: right;
  padding: 60px;
  border-top: 1px solid #f5f5f5;
}
</style>
