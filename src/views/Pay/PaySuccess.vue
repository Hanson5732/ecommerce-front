<script setup>
</script>

<template>
  <div class="pay-success">
      <span class="icon iconfont icon-queren2"></span>
      <h1>Payment Successful</h1>
      <br />
      <p>Thank you for your payment! Your order has been successfully processed.</p>
      <router-link to="/" class="btn">Back home</router-link>
  </div>
</template>

<style lang='scss' scoped>
.pay-success {
  text-align: center;
  margin-top: 50px;
}
.icon {
  font-size: 50px;
  color: green;
}
.btn {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: $xtxColor;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}
</style>
