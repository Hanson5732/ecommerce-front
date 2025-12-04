<script setup>
import { getCommentAPI, editCommentAPI, deleteCommentAPI } from '@/apis/comment';
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute()
const router = useRouter()

// 编辑状态
const isEditing = ref(false)
const formRef = ref(null)

// 评论数据
const comment = ref({})
const originalComment = ref({}) // 用于存储原始数据

// 获取评论
const getComment = async () => {
  const res = await getCommentAPI(route.params.id)
  comment.value = res.data
  originalComment.value = { ...res.data } // 保存原始数据
}

onMounted(() => {
  getComment()
})

// 表单验证规则
const rules = reactive({
  rating: [
    { required: true, message: 'Please select a rating', trigger: 'blur' }
  ]
})

// 处理编辑
const handleEdit = () => {
  isEditing.value = true
}

// 处理取消
const handleCancel = () => {
  isEditing.value = false
  comment.value = { ...originalComment.value } // 恢复原始数据
}

// 处理重置
const handleReset = () => {
  comment.value = { ...originalComment.value }
}

// 处理保存
const handleSave = async () => {
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await editCommentAPI({'id': route.params.id, ...comment.value})
        ElMessage.success('Comment updated successfully')
        isEditing.value = false
        getComment() // 刷新数据
      } catch (error) {
        ElMessage.error(error)
      }
    }
  })
}

// 处理删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      'Are you sure to delete this comment? This action cannot be undone.',
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    await deleteCommentAPI(route.params.id)
    ElMessage.success('Comment deleted')
    router.push('/order')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete comment')
    }
  }
}
</script>

<template>
  <div class="comment-container">
    <div class="header">
      <h2>{{ isEditing ? 'Edit Comment' : 'Comment Review' }}</h2>
      <div class="actions">
        <el-button
          v-if="!isEditing"
          type="warning"
          @click="handleEdit"
        >
          Edit
        </el-button>
        <el-button
          v-else
          type="default"
          @click="handleCancel"
        >
          Cancel
        </el-button>
        <el-button
          v-if="isEditing"
          type="default"
          @click="handleReset"
        >
          Reset
        </el-button>
        <el-button
          v-if="!isEditing"
          type="danger"
          @click="handleDelete"
        >
          Delete
        </el-button>
        <el-button
          v-if="isEditing"
          type="primary"
          @click="handleSave"
        >
          Save
        </el-button>
      </div>
    </div>
    <div class="comment-wrapper">
      <div class="left">
        <img :src="comment.orderItem?.image" alt="Product Image" />
        <p>{{ comment.orderItem?.name }}</p>
      </div>
      <div class="right">
        <el-form ref="formRef" :model="comment" :rules="rules">
          <el-form-item label="Rating" prop="rating">
            <el-rate
              v-model="comment.rating"
              :disabled="!isEditing"
              :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
              show-text
              text-color="#ff9900"
              :texts="['Very Bad', 'Bad', 'Good', 'Very Good', 'Excellent']"
            />
          </el-form-item>
          <el-form-item label="Comment" prop="commentDesc">
            <el-input
              type="textarea"
              v-model="comment.commentDesc"
              :readonly="!isEditing"
              :rows="5"
            />
          </el-form-item>
        </el-form>
        <div class="photo-upload" v-if="comment.images && comment.images.length > 0">
          <div class="image-grid">
            <el-image
              v-for="(img, index) in comment.images"
              :key="index"
              :src="img"
              class="comment-image"
              :preview-src-list="comment.images"
              fit="cover"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="button-container">
      <el-button type="default" @click="$router.push('/order')">Back to Orders</el-button>
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

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 20px;
    margin-right: 20px;

    .actions {
      display: flex;
    }
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

        .image-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;

          .comment-image {
            width: 100%;
            height: 150px;
            border-radius: 5px;
            object-fit: cover;
          }
        }
      }
    }
  }

  .button-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-right: 20px;
  }
}
</style>
