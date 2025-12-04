<script setup>
import { getOrderByIdAPI, updateOrderAPI } from '@/apis/checkout';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';

const route = useRoute()
const router = useRouter()

const payInfo = ref({})

const getPayInfo = async () => {
  const res = await getOrderByIdAPI(route.params.id)
  payInfo.value = res.data
}

onMounted(() => {
  getPayInfo()
})

const getPaid = async (payMethod) => {
  await updateOrderAPI({
    orderStatus: '1',   // 已支付
    orderId: route.params.id,
    payMethod: payMethod,
  })
  router.replace('/pay/success')
}

const cancel = async () => {
  ElMessageBox.confirm(
    'Are you sure to cancel the order? The operation is not reversible.',
    'Reminder',
    {
      confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
    }
  ).then( async () => {
    const res = await updateOrderAPI({
      orderStatus: '2',   //修改成已取消
      orderId: route.params.id
    })
    if (res.code === 1) {
      ElMessage.success('Order has been canceled')
      payInfo.value = res.data
    } else {
      ElMessage.error('Error: ' + res.msg)
    }
  })
}
</script>


<template>
  <div class="xtx-pay-page">
    <div class="container">
      <!-- 付款信息 -->
      <div class="pay-info">
        <div class="left" v-if="payInfo.orderStatus === '0'">
          <span class="iconfont icon-queren2 green"></span>
          <div class="tip">
            <p>Order submitted successfully! Please complete the payment as soon as possible.</p>
            <p>Choose one of pay methods below.</p>
          </div>
        </div>
        <div class="left" v-else-if="payInfo.orderStatus === '2'">
          <span class="iconfont icon-shanchu red"></span>
          <div class="tip">
            <p>Order has been canceled by user.</p>
            <p>Transaction is closed.</p>
          </div>
        </div>
        <div class="right">
          <div class="amount">
            <span>Amount: </span>
            <span v-if="!isNaN(parseFloat(payInfo.amount))">&yen;{{ parseFloat(payInfo.amount).toFixed(2) }}</span>
          </div>
          <button
            class="cancel-btn"
            @click="cancel"
            v-if="payInfo.orderStatus === '0'"
          >
            Cancel Order
          </button>
          <button class="home-btn" @click="$router.replace('/')" v-else>Back home</button>
        </div>
      </div>
      <!-- 付款方式 -->
      <div class="pay-type" v-show="payInfo.orderStatus === '0'">
        <p class="head">Select a payment method below</p>
        <div class="item">
          <p>Payment Platform</p>
          <a class="btn wx" href="javascript:;" @click="getPaid('0')"></a>
          <a class="btn alipay" href="javascript:;" @click="getPaid('1')"></a>
          <br />
          <br />
          <a class="btn" href="javascript:;" @click="getPaid('2')">Bank Z</a>
          <a class="btn" href="javascript:;" @click="getPaid('3')">Bank G</a>
          <a class="btn" href="javascript:;" @click="getPaid('4')">Bank J</a>
          <a class="btn" href="javascript:;" @click="getPaid('5')">Bank N</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "sass:color";

.xtx-pay-page {
  margin-top: 20px;
}

.pay-info {
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 240px;
  padding: 0 40px;

  .left {
    display: flex;

    >.iconfont {
      font-size: 80px;
    }

    .red {
      color: $priceColor;
    }

    .green {
      color: #1dc779;
    }

    .tip {
      padding-left: 10px;
      flex: 1;
      margin-top: 20px;

      p {
        &:first-child {
          font-size: 20px;
          margin-bottom: 5px;
        }

        &:last-child {
          color: #999;
          font-size: 16px;
        }
      }
    }
  }

  .right {
    margin-left: auto;
    display: block;

    .amount {
      margin-top: 50px;
      margin-left: 85px;

      span {
        &:first-child {
          font-size: 16px;
          color: #999;
        }

        &:last-child {
          color: $priceColor;
          font-size: 20px;
        }
      }
    }

    .cancel-btn {
      margin-left: 85px;
      margin-top: 20px;
      display:block;
      background-color: $priceColor;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;

      &:hover {
        background-color: color.scale($priceColor, $lightness: -10%);
      }
    }

    .home-btn {
      margin-left: 85px;
      margin-top: 20px;
      display: block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: $xtxColor;
      color: white;
      text-decoration: none;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
      font-size: 14px;

      &:hover {
        background-color: color.scale($xtxColor, $lightness: -10%);
      }
    }
  }
}

.pay-type {
  margin-top: 20px;
  background-color: #fff;
  padding-bottom: 70px;

  p {
    line-height: 70px;
    height: 70px;
    padding-left: 30px;
    font-size: 16px;

    &.head {
      border-bottom: 1px solid #f5f5f5;
    }
  }

  .btn {
    width: 150px;
    height: 50px;
    border: 1px solid #e4e4e4;
    text-align: center;
    line-height: 48px;
    margin-left: 30px;
    color: #666666;
    display: inline-block;

    &.active,
    &:hover {
      border-color: $xtxColor;
    }

    &.alipay {
      background: url(https://cdn.cnbj1.fds.api.mi-img.com/mi-mall/7b6b02396368c9314528c0bbd85a2e06.png) no-repeat center / contain;
    }

    &.wx {
      background: url(https://cdn.cnbj1.fds.api.mi-img.com/mi-mall/c66f98cff8649bd5ba722c2e8067c6ca.jpg) no-repeat center / contain;
    }
  }
}
</style>
