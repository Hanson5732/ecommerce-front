<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSubcategoryAPI } from '@/apis/subcategory'
import { getCategoryAPI } from '@/apis/category'
import { addProductAPI } from '@/apis/detail'
import { ElMessageBox } from 'element-plus'
import { postImageAPI } from '@/apis/image'

// 表单引用
const formRef = ref(null)

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  price: 0,
  images: [],
  stockQuantity: 0,
  lowStockThreshold: 0,
  details: [],
  status: '1',
  subCategoryId: []
})

// 表单验证规则
const rules = reactive({
  name: [
    { required: true, message: 'Name cannot be empty', trigger: 'blur' },
    { min: 2, max: 255, message: 'The value must contain 2 to 255 characters', trigger: 'blur' }
  ],
  price: [
    { required: true, message: 'Price cannot be empty', trigger: 'blur' }
  ],
  stockQuantity: [
    { required: true, message: 'Quantity cannot be empty', trigger: 'blur' }
  ],
  lowStockThreshold: [
    { required: true, message: 'Threshold cannot be empty', trigger: 'blur' }
  ],
  status: [
    { required: true, message: 'Status cannot be empty', trigger: 'change' }
  ],
  subCategoryId: [
    { required: true, message: 'Subcategory cannot be empty', trigger: 'change' }
  ]
})

// 分类选项
const categoryOptions = ref([])

const getCategoryOptions = async () => {
  const subList = await getSubcategoryAPI()
  const cateList = await getCategoryAPI()

  // 将子分类按父分类ID分组
  const subMap = subList.data.reduce((map, sub) => {
    if (!map[sub.category_id]) {
      map[sub.category_id] = []
    }
    map[sub.category_id].push({
      id: sub.id,
      name: sub.name
    })
    return map
  }, {})

  // 组装层级结构
  categoryOptions.value = cateList.data.map(cate => ({
    id: cate.id,
    name: cate.name,
    children: subMap[cate.id] || []
  }))
}

onMounted(()=>{
  getCategoryOptions()
})

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

// 处理上传成功
const handleUploadSuccess = (response) => {
  if (response && response.url) {
    formData.images.push(response.url)
    ElMessage.success('Image uploaded successfully')
  } else {
    ElMessage.error('Failed: unvalid URL in return')
  }
}

// 处理图片删除
const handleRemove = (file) => {
  const index = formData.images.indexOf(file.url)
  if (index !== -1) {
    formData.images.splice(index, 1)
  }
}

// 添加商品详细信息
const addDetail = () => {
  formData.details.push({ key: '', value: '' })
}

// 删除商品详细信息
const removeDetail = (index) => {
  formData.details.splice(index, 1)
}

// 提交表单
const submitForm = async (formEl) => {
  if (!formEl) return

  await formEl.validate(async (valid) => {
    if (valid) {
      formData.subCategoryId = formData.subCategoryId[formData.subCategoryId.length-1]
      await addProductAPI(formData)
      ElMessage.success('Add successfully')
      formEl.resetFields()
      formData.details = []
      formData.images = []
    } else {
      ElMessage.error('Please double check your form')
      return false
    }
  })
}

// 重置表单
const resetForm = (formEl) => {
  if (!formEl) return

  ElMessageBox.confirm(
    'Are you sure you want to reset the form? All unsaved data will be lost.',
    'Warning',
    {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning',
    }
  )
    .then(() => {
      formEl.resetFields()
      formData.details = []
      formData.images = []
      ElMessage.success('Form has been reset')
    })
    .catch(() => {
      ElMessage.info('Reset canceled')
    })
}
</script>

<template>
  <div class="product-form-container">
    <el-card class="form-card">
      <template #header>
        <h2 class="form-title">Add New Product</h2>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        class="product-form"
      >
        <!-- 基本信息 -->
        <el-form-item label="Product name" prop="name">
          <el-input v-model="formData.name" placeholder="Input product name" />
        </el-form-item>

        <el-form-item label="Description" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="Input description"
          />
        </el-form-item>

        <el-form-item label="price" prop="price">
          <el-input-number
            v-model="formData.price"
            :precision="2"
            :step="0.1"
            :min="0"
          />
        </el-form-item>

        <!-- 库存信息 -->
        <el-form-item label="Quantity" prop="stockQuantity">
          <el-input-number
            v-model="formData.stockQuantity"
            :min="0"
            :step="1"
          />
        </el-form-item>

        <el-form-item label="Alarm" prop="lowStockThreshold">
          <el-input-number
            v-model="formData.lowStockThreshold"
            :min="0"
            :step="1"
          />
        </el-form-item>

        <!-- 商品状态 -->
        <el-form-item label="Status" prop="status">
          <el-select v-model="formData.status" placeholder="Choose status">
            <el-option label="Available" value="1" />
            <el-option label="Unavailable" value="0" />
          </el-select>
        </el-form-item>

        <!-- 商品分类 -->
        <el-form-item label="Sub-Category" prop="subCategoryId">
          <el-cascader
            v-model="formData.subCategoryId"
            :options="categoryOptions"
            :props="{
              label: 'name',
              value: 'id',
              checkStrictly: true,
            }"
            placeholder="Choose sub-category"
          />
        </el-form-item>

        <!-- 商品图片 -->
        <el-form-item label="Images" prop="images">
          <div class="image-upload-container">
            <div class="upload-tip">(The first photo will be the cover)</div>
            <el-upload
              action="#"
              :http-request="handleUpload"
              list-type="picture-card"
              :limit="5"
              :on-success="handleUploadSuccess"
              :on-remove="handleRemove"
              :file-list="formData.images"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </div>
        </el-form-item>

        <!-- 商品详细信息 -->
        <el-form-item label="Details">
          <div v-for="(detail, index) in formData.details" :key="index" class="detail-item">
            <el-input
              v-model="detail.key"
              placeholder="attribute"
              class="detail-input"
            />
            <el-input
              v-model="detail.value"
              placeholder="value"
              class="detail-input"
            />
            <el-button type="danger" @click="removeDetail(index)">Delete</el-button>
          </div>
          <el-button type="default" @click="addDetail">Add details</el-button>
        </el-form-item>

        <!-- 提交按钮 -->
        <div class="form-btn">
          <el-button @click="resetForm(formRef)">Reset</el-button>
          <el-button type="primary" @click="submitForm(formRef)">Submit</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.product-form-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.form-card {
  width: 800px;
}

.form-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.product-form {
  margin-top: 20px;
  margin-right: 50px;
}

.detail-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.detail-input {
  width: 200px;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-tip {
  font-size: 14px;
  color: #666;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

div.form-btn {
  margin-top: 50px;
  text-align: right;
}
</style>
