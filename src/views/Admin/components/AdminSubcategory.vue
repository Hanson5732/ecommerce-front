<script setup>
import { ref, watch } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAdminSubcategoryAPI,
  addSubcategoryAPI,
  updateSubcategoryAPI,
  deleteSubcategoryAPI,
} from '@/apis/subcategory'
import { getCategoryAPI } from '@/apis/category'
import { postImageAPI } from '@/apis/image'

// 表格数据
const tableData = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const categories = ref([])
// 获取二级分类数据
const fetchSubcategories = async (params) => {
  try {
    console.log(params)
    const response = await getAdminSubcategoryAPI({
      page: params.page,
      pageSize: params.pageSize
    })

    console.log('Raw API Response:', response) // 打印响应

    // 确保 response.data.data 是数组
    if (!Array.isArray(response.data.data)) {
      throw new Error('Invalid data format: response.data.data is not an array')
    }

    // 更新表格数据
    tableData.value = response.data.data.map(subcategory => ({
      id: subcategory.id,
      name: subcategory.name,
      status: subcategory.status,
      image: subcategory.imageUrl || '', // 直接使用字符串，如果不存在则默认为空字符串
      categoryId: subcategory.categoryId
    }))

    // 更新总条数
    total.value = response.data.total

    console.log('Processed table data:', tableData.value)
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    if (error.response) {
      console.error('Error response:', error.response)
    }
  }
}

const fetchCategories = async () => {
  try {
    const response = await getCategoryAPI()
    categories.value = response.data
  } catch (error) {
    ElMessage.error('Failed to fetch categories')
  }
}
fetchCategories()

// 监听分页变化
watch([currentPage, pageSize], () => {
  fetchSubcategories({
    page: currentPage.value,
    pageSize: pageSize.value
  })
})

// 初始化时获取数据
fetchSubcategories({
  page: currentPage.value,
  pageSize: pageSize.value
})

// 添加对话框相关状态
const addDialogVisible = ref(false)
const selectedCategoryId = ref('')
const subcategoryName = ref('')

// 打开添加对话框
const openAddDialog = () => {
  addDialogVisible.value = true
  selectedCategoryId.value = ''
  subcategoryName.value = ''
}

// 添加二级分类
const handleAdd = async () => {
  try {
    if (!selectedCategoryId.value) {
      ElMessage.warning('Please select a category')
      return
    }

    if (!subcategoryName.value) {
      ElMessage.warning('Subcategory name cannot be empty')
      return
    }

    // 调用API添加二级分类
    await addSubcategoryAPI({
      name: subcategoryName.value,
      categoryId: selectedCategoryId.value,
      images: ''
    })
    ElMessage.success('Adding Successfully')
    fetchSubcategories({page: currentPage.value, pageSize: pageSize.value})
    addDialogVisible.value = false
  } catch (error) {
    ElMessage.error('Adding failed')
  }
}

// 编辑对话框相关状态
const editDialogVisible = ref(false)
const editSelectedCategoryId = ref('')
const editSubcategoryName = ref('')
const editRow = ref(null)

// 打开编辑对话框
const openEditDialog = (row) => {
  editDialogVisible.value = true
  editSelectedCategoryId.value = row.categoryId
  editSubcategoryName.value = row.name
  editRow.value = row
}

// 编辑二级分类
const handleEdit = async () => {
  try {
    if (!editSelectedCategoryId.value) {
      ElMessage.warning('Please select a category')
      return
    }

    if (!editSubcategoryName.value) {
      ElMessage.warning('Subcategory name cannot be empty')
      return
    }

    // 调用API编辑二级分类
    await updateSubcategoryAPI({
      id: editRow.value.id,
      name: editSubcategoryName.value,
      status: editRow.value.status,
      images: editRow.value.image,
      categoryId: editSelectedCategoryId.value
    })
    ElMessage.success('Update Successfully')
    fetchSubcategories({page: currentPage.value, pageSize: pageSize.value})
    editDialogVisible.value = false
  } catch (error) {
    ElMessage.error('Update Failed')
  }
}

// 修改二级分类状态
const handleStatusChange = async (row) => {
  try {
    const newStatus = row.status === '1' ? '0' : '1'
    await updateSubcategoryAPI({
      id: row.id,
      name: row.name,
      status: newStatus,
      images: row.image
    })
    ElMessage.success('Status Update Successfully')
    fetchSubcategories({page: currentPage.value, pageSize: pageSize.value})
  } catch (error) {
    console.error('Status Update Failure:', error)
    ElMessage.error('Status Update Failure')
  }
}

// 删除二级分类
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${row.name}"?`,
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    await deleteSubcategoryAPI(row.id)
    ElMessage.success('Delete Successfully')
    fetchSubcategories({page: currentPage.value, pageSize: pageSize.value})
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Delete Failure')
    }
  }
}

// 图片上传成功处理
const handleImageUploadSuccess = async (imageURL, row) => {
  try {
    // 直接更新 image 字段为新的图片 URL
    await updateSubcategoryAPI({
      id: row.id,
      name: row.name,
      status: row.status,
      images: imageURL  // 直接使用字符串
    })
    ElMessage.success('Picture uploaded successfully')
    fetchSubcategories({page: currentPage.value, pageSize: pageSize.value})
    handleCloseImageDialog()
  } catch (error) {
    console.error('Image Upload Failure:', error)
    ElMessage.error('Failed to update subcategory with new image')
  }
}

// 图片上传失败处理
const handleImageUploadError = (error) => {
  console.error('Image Upload Failure:', error)
  ElMessage.error('Image Upload Failure')
}

// 图片管理对话框
const imageDialogVisible = ref(false)
const currentRow = ref(null)

const openImageDialog = (row) => {
  currentRow.value = row
  imageDialogVisible.value = true
}

const handleCloseImageDialog = () => {
  currentRow.value = null
  imageDialogVisible.value = false
}

// 删除图片
const handleDeleteImage = async (row, image) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${image}"?`,
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )

    // 清空 image 字段
    await updateSubcategoryAPI({
      id: row.id,
      name: row.name,
      status: row.status,
      images: ''  // 清空图片
    })
    ElMessage.success('Image deleted successfully')
    fetchSubcategories({page: currentPage.value, pageSize: pageSize.value})
    handleCloseImageDialog()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Failed to delete image')
    }
  }
}

// 图片上传处理
const handleUpload = async (options, currentRow) => {
  const { file } = options
  if (!file) return

  try {
    const response = await postImageAPI(file)
    const imageUrl = response.url
    await handleImageUploadSuccess(imageUrl, currentRow)
  } catch (error) {
    await handleImageUploadError(error)
  }
}
</script>

<template>
  <div class="content-table">
    <!-- 顶部操作区 -->
    <div class="top-actions">
      <el-button type="primary" @click="openAddDialog" class="add-btn">
        <el-icon><Plus /></el-icon>Add
      </el-button>
    </div>

    <!-- 添加二级分类对话框 -->
    <el-dialog
      v-model="addDialogVisible"
      title="Add Subcategory"
      width="30%"
    >
      <el-form label-width="120px">
        <el-form-item label="Category">
          <el-select v-model="selectedCategoryId" placeholder="Select a category">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Subcategory">
          <el-input v-model="subcategoryName" placeholder="Enter subcategory name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleAdd">Confirm</el-button>
      </template>
    </el-dialog>

    <!-- 编辑二级分类对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="Edit Subcategory"
      width="30%"
    >
      <el-form label-width="120px">
        <el-form-item label="Category">
          <el-select v-model="editSelectedCategoryId" placeholder="Select a category">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Subcategory">
          <el-input v-model="editSubcategoryName" placeholder="Enter subcategory name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleEdit">Confirm</el-button>
      </template>
    </el-dialog>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      stripe
    >
      <el-table-column prop="id" label="ID" width="350" />
      <el-table-column prop="name" label="Name" min-width="80" />
      <el-table-column prop="status" label="Status" width="100">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === '1'"
            @change="handleStatusChange(row)"
          >
            {{ row.status === '1' ? 'Avail' : 'NA' }}
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="Image" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="openImageDialog(row)">
            Manage Image
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="Handle" width="180" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" size="small" @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>Edit
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>Delete
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
      />
    </div>

    <!-- 图片管理对话框 -->
    <el-dialog
      v-model="imageDialogVisible"
      title="Manage Image"
      width="30%"
      :before-close="handleCloseImageDialog"
    >
      <div>
        <div v-if="currentRow && currentRow.image" class="image-preview">
          <div class="image-container">
            <img :src="currentRow.image" alt="Subcategory Image" class="category-image" />
            <div class="overlay">
              <el-icon class="delete-icon" @click="handleDeleteImage(currentRow, currentRow.image)">
                <Delete />
              </el-icon>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No image available.</p>
        </div>

        <!-- 图片上传区域 -->
        <el-upload
          :http-request="(options) => handleUpload(options, currentRow)"
          :show-file-list="false"
          class="upload-box"
          style="margin-top: 10px;"
        >
          <div class="upload-content">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <p class="upload-text">Click or drag to upload</p>
            <p class="upload-tip">Supports JPG/PNG format, max size 20MB</p>
          </div>
        </el-upload>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.content-table {
  background-color: white;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background-color: $xtxColor;

  &:hover {
    background-color: #22978c;
  }

  &:active {
    background-color: $sucColor;
  }
}

.pagination {
  margin-top: 30px;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-container {
  position: relative;
  width: 250px;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .overlay {
  opacity: 1;
}

.image-container:hover .category-image {
  opacity: 0.7;
}

.delete-icon {
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.delete-icon:hover {
  color: $xtxColor;
}

.upload-box {
  width: 100%;
  height: 250px;
  border: 1px dashed $xtxColor;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 24px;
  color: #909399;
}

.upload-text {
  margin-top: 8px;
  color: #909399;
}

.upload-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
</style>
