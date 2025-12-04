<script setup>
import { ref, onMounted } from 'vue';
import { getOrderItemAPI } from '@/apis/checkout';
import { useRoute } from 'vue-router';
import { postImageAPI } from '@/apis/image';
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { addCommentAPI } from '@/apis/comment';
import DOMPurify from 'dompurify';

const route = useRoute()

const isCommented = ref(false)

// 获取订单详情
const orderItem = ref({})
const getOrderItem = async () => {
  const res = await getOrderItemAPI(route.params.id)
  orderItem.value = res.data.product
  requestData.value.productId = orderItem.value.id
  isCommented.value = res.data.isCommented
}

onMounted(() => {
  getOrderItem()
})

const requestData = ref({
  rating: 0,
  commentDesc: '',
  images: [],
  orderItemId: route.params.id,
  productId: null,
});

// 提交按钮
const submitComment = async () => {
    requestData.value.commentDesc = DOMPurify.sanitize(requestData.value.commentDesc)

    const res = await addCommentAPI(requestData.value);
    if (res.code === 1) {
        ElMessage.success('Comment success');
        isCommented.value = res.data.isCommented
    } else {
        ElMessage.error('Submission failed');
    }
};

// 自定义上传逻辑
const handleUpload = async (options) => {
  const { file } = options
  const res = await postImageAPI(file)
  if (res && res.url) {
    return res
  } else {
    throw new Error('Upload failed')
  }
}

const handleUploadSuccess = (response) => {
  if (response && response.url) {
    requestData.value.images.push(response.url)
    ElMessage.success('Image uploaded successfully')
  } else {
    ElMessage.error('Failed: unvalid URL in return')
  }
}

const handleRemove = (file) => {
  const index = requestData.value.images.indexOf(file.url)
  if (index !== -1) {
    requestData.value.images.splice(index, 1)
  }
}
</script>

<template>
  <div class="comment-container" v-if="!isCommented">
    <h2>Comment</h2>
    <div class="comment-wrapper">
      <div class="left">
        <img :src="orderItem.image" alt="商品图片" />
        <p>{{ orderItem.name }}</p>
      </div>
      <div class="right">
        <div class="rating-section">
          <span>Rating: </span>
          <el-rate
            v-model="requestData.rating"
            :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
            show-text
            text-color="#ff9900"
            :texts="['Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent']"
          />
        </div>
        <el-input
          type="textarea"
          v-model="requestData.commentDesc"
          placeholder="How is it going? Share your experience!"
          maxlength="500"
          :rows="5"
        />
        <div class="photo-upload">
          <el-upload
            action="#"
            :http-request="handleUpload"
            list-type="picture-card"
            :limit="9"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemove"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </div>
      </div>
    </div>
    <div class="button-container">
      <el-button type="primary" @click="submitComment">Submit</el-button>
    </div>
  </div>

<!-- 提交成功界面 -->
  <div v-else>
    <div class="comment-success">
      <span class="icon iconfont icon-queren2"></span>
      <h1>Comment Submitted Successfully</h1>
      <br />
      <p>Thank you for your feedback! Your comment has been successfully submitted.</p>
      <div class="button-group">
        <el-button type="default" @click="$router.push('/order')">Back to Orders</el-button>
        <el-button type="primary" @click="$router.push(`/order/comment/review/${route.params.id}`)">View Comment</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comment-container {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-width: 1000px;
  margin: auto;
  margin-top: 50px;
  margin-bottom: 50px;

  h2 {
    margin-left: 20px;
  }

  .comment-wrapper {
    display: flex;
    gap: 30px;

    .left {
      width: 200px;
      text-align: center;

      img {
        width: 150px;
        height: 150px;
        margin-bottom: 10px;
      }

      p {
        font-size: 16px;
        margin-top: 5px;
      }
    }

    .right {
      flex: 1;
      margin-right: 20px;

      .rating-section {
        margin-bottom: 20px;
        display: flex;
        align-items: center;

        span {
          margin-right: 10px;
          font-size: 14px;
          color: #666;
        }
      }

      .photo-upload {
        margin-top: 20px;

        :deep(.el-upload) {
          width: 60px;
          height: 60px;
          line-height: 60px;
        }

        :deep(.el-upload-list--picture-card .el-upload-list__item) {
          width: 60px;
          height: 60px;
        }
      }
    }
  }

  .button-container {
    display: flex;
    justify-content: right;
    margin-top: 20px;
    margin-right: 20px;
  }
}

.comment-success {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-width: 1000px;
  margin: auto;
  margin-top: 50px;
  margin-bottom: 50px;
  text-align: center;

  .icon {
    font-size: 50px;
    color: green;
  }

  h1 {
    margin: 20px 0;
  }

  p {
    color: #666;
    margin-bottom: 30px;
  }

  .button-group {
    display: flex;
    justify-content: center;
    gap: 20px;
  }
}
</style>
