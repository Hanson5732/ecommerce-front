<script setup>
import { ref } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {addCategoryAPI, updateCategoryAPI, deleteCategoryAPI, getAdminCategoryAPI } from '@/apis/category'
import { postImageAPI } from '@/apis/image'

// 表格数据
const tableData = ref([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 获取分类数据
const fetchCategories = async (data) => {
  try {
    const response = await getAdminCategoryAPI(data)
    const list = response.data.data || []

    tableData.value = list.map(category => ({
      id: category.id,
      name: category.name,
      status: category.status,
      image: category.images
    }))

    // 2. 总数不再是数组长度，而是从 response.data.totalItems 获取
    total.value = response.data.totalItems || 0

    total.value = tableData.value.length
  } catch (error) {
    ElMessage.error('Description Failed to obtain classification data')
    throw error
  }
}

// 初始化时获取数据
fetchCategories({page: currentPage.value, pageSize: pageSize.value})

// 添加分类
const handleAdd = async () => {
  try {
    const { value: name } = await ElMessageBox.prompt('Enter the new Category Name', 'Adding Category', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      inputPattern: /\S+/, // 非空验证
      inputErrorMessage: 'Category Name cannot be Null'
    })

    await addCategoryAPI(name)
    ElMessage.success('Adding Successfully')
    fetchCategories({page: currentPage.value, pageSize: pageSize.value}) // 刷新数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Adding failed')
    }
  }
}

// 编辑分类
const handleEdit = async (row) => {
  try {
    const { value: name } = await ElMessageBox.prompt('Enter the new Category Name', 'Editing Category', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      inputValue: row.name,
      inputPattern: /\S+/, // 非空验证
      inputErrorMessage: 'Category Name cannot be Null'
    })

    const status = row.status ? '1' : '0'
    await updateCategoryAPI(row.id, name, status)
    ElMessage.success('Update Successfully')
    fetchCategories({page: currentPage.value, pageSize: pageSize.value}) // 刷新数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Update Failure')
    }
  }
}

// 修改分类状态
const handleStatusChange = async (row) => {
  try {
    const newStatus = row.status === '1' ? '0' : '1';
    await updateCategoryAPI(row.id, row.name, newStatus)
    ElMessage.success('Status Update Successfully')
    fetchCategories({page: currentPage.value, pageSize:pageSize.value })
  } catch (error) {
    console.error('Status Update Failure:', error)
    ElMessage.error('Status Update Failure')
  }
}

// 删除分类
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

    await deleteCategoryAPI(row.id)
    ElMessage.success('Delete Successfully')
    fetchCategories({page: currentPage.value, pageSize: pageSize.value}) // 刷新数据
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Delete Failure')
    }
  }
}

// 图片上传成功处理
const handleImageUploadSuccess = async (imageURL, row) => {
  try {
    // 如果 row.image 是数组，将新图片 URL 添加到数组中
    const updatedImages = Array.isArray(row.image) ? [...row.image, imageURL] : [imageURL];

    // 更新分类图片
    await updateCategoryAPI(row.id, row.name, row.status, updatedImages);
    ElMessage.success('Picture uploaded successfully');
    fetchCategories({page: currentPage.value, pageSize: pageSize.value}); // 刷新数据
    handleCloseImageDialog();
  } catch (error) {
    console.error('Image Upload Failure:', error);
    ElMessage.error('Failed to update category with new image');
  }
};

// 图片上传失败处理
const handleImageUploadError = (error) => {
  console.error('Image Upload Failure:', error)
  ElMessage.error('Image Upload Failure')
}

// 图片管理对话框
const imageDialogVisible = ref(false)
const currentRow = ref([])

const openImageDialog = (row) => {
  currentRow.value = row;
  console.log(row);

  imageDialogVisible.value = true
}

const handleCloseImageDialog = () => {
  currentRow.value = null
  imageDialogVisible.value = false
}

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

    const updatedImages = row.image.filter(img => img !== image);

    await updateCategoryAPI(row.id, row.name, row.status, updatedImages) // 删除图片
    ElMessage.success('Image success to delete')
    fetchCategories({page: currentPage.value, pageSize: pageSize.value}) // 刷新数据
    handleCloseImageDialog()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Image fail to delete')
    }
  }
}

// 图片上传处理
const handleUpload = async (options, currentRow) => {
  const { file } = options;
  if (!file) return;

  try {
    const response = await postImageAPI(file); // 调用 postImageAPI 上传文件
    const imageUrl = response.url; // 获取返回的图片 URL
    console.log(currentRow);

    await handleImageUploadSuccess(imageUrl, currentRow); // 更新分类图片
  } catch (error) {
    await handleImageUploadError(error); // 处理上传失败
  }
};
</script>

<template>
  <div class="content-table">
    <!-- 顶部操作区 -->
    <div class="top-actions">
      <el-button type="primary" @click="handleAdd" class="add-btn">
        <el-icon><Plus /></el-icon>Add
      </el-button>

      <!-- <el-input
        v-model="searchKeyword"
        placeholder="请输入关键词搜索"
        class="search-bar"
        clearable
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input> -->
    </div>

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
            <el-button type="primary" size="small" @click="handleEdit(row)">
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
        <div v-if="currentRow" class="image-preview">
          <div v-for="image in currentRow.image" class="image-container" :key="image">
            <img :src="image" alt="Category Image" class="category-image" />
            <div class="overlay">
              <el-icon class="delete-icon" @click="handleDeleteImage(currentRow, image)">
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
  justify-content: space-between; /* 将 Add 按钮和搜索框分开 */
  align-items: center; /* 垂直居中 */
  margin-bottom: 20px; /* 调整间距 */
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

.search-bar {
  width: 25%;
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
  width: 100%;
  height: 250px;
  overflow: hidden;
  border-radius: 4px;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .overlay {
  opacity: 1; /* 悬停时显示覆盖层 */
}

.image-container:hover .category-image {
  opacity: 0.7; /* 悬停时图片变暗 */
}

.delete-icon {
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.delete-icon:hover {
  color: $xtxColor; /* 悬停时垃圾桶图标变红 */
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
