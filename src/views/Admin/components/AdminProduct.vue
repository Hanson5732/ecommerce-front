<script setup>
import { onMounted, ref } from 'vue'
import { Plus, Search, InfoFilled } from '@element-plus/icons-vue'
import { editProductAPI } from '@/apis/detail'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getProductAPI, getStockStatusAPI } from '@/apis/search'
import { useRouter } from 'vue-router'

const router = useRouter()
// 针对不同状态产品下的提示
const setRowClassName = ({ row }) => {
  if (row.stock_quantity === 0 && row.status == '1') {
    return 'row-red' // 库存为 0，显示浅红色
  } else if (row.stock_quantity < row.low_stock_threshold && row.status == '1') {
    return 'row-yellow' // 库存低于阈值，显示浅黄色
  }
  return ''
}

// 获取产品数据
const tableData = ref([])

// 请求数据
const requestData = ref({
  page: 1,
  pageSize: 10,
  q: '',
})

const total = ref(0)

const understockCount = ref(0) // 库存不足数量
const shortStockCount = ref(0) // 库存紧张数量

const getProducts = async () => {
  const res = await getProductAPI(requestData.value)
  tableData.value = res.data.products
  total.value = res.data.total
}

// 获取库存状态栏
const getStockStatus = async () => {
  const res = await getStockStatusAPI()
  understockCount.value = res.data.understock
  shortStockCount.value = res.data.shortstock
}

// 处理页码变化
const handlePageChange = (newPage) => {
  requestData.value.page = newPage
  getProducts()
}

// 处理每页条数变化
const handleSizeChange = (newSize) => {
  requestData.value.pageSize = newSize
  requestData.value.page = 1 // 重置为第一页
  getProducts()
}

onMounted(() => {
  getProducts();
  getStockStatus();
})

const querysearch = async () => {
  requestData.value.page = 1  // 重置为第一页
  await getProducts()
}

// 修改产品状态
const editProductStatus = async(row) => {
  const newStatus = row.status === '1' ? '0' : '1';
  try {
    await ElMessageBox.confirm(
      `Are you sure to make "${row.name}" ${row.status === '1' ? 'unavailable' : 'available'} ?`,
      'Warning',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    );


    await editProductAPI(row.id, { status: newStatus });

    ElMessage.success('Status changed');
    row.status = newStatus; // 更新本地状态
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Status unchanged: database error');
    }
  }
}

// // 新标签页打开新增页面
const handleAddProduct = () => {
  const routeData = router.resolve({
    path: '/admin/product/add'
  })
  window.open(routeData.href, '_blank')
}

// 新标签页打开详细页面
const handleProductInfo = (row) => {
  const routeData = router.resolve({
    path: `/admin/product/details/${row.id}`
  })

  // 在新标签页打开生成的链接
  window.open(routeData.href, '_blank')
}

</script>

<template>
  <div class="content-table">
    <!-- 顶部操作区 -->
    <div class="top-actions">
      <div class="stock-status">
        <span class="status-item">
          <span class="dot red"></span>
          Understock: {{ understockCount }}
        </span>
        <span class="status-item">
          <span class="dot yellow"></span>
          Short of stock: {{ shortStockCount }}
        </span>
      </div>
      <el-button type="primary" @click="handleAddProduct" class="add-btn">
        <el-icon><Plus /></el-icon>Add
      </el-button>
      <el-input
        v-model="requestData.q"
        placeholder="Search by keywords"
        class="search-bar"
        clearable
        @keyup.enter="querysearch"
      >
        <template #append>
          <el-button @click="querysearch" :icon="Search" class="search-btn" />
        </template>
      </el-input>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      style="width: 100%"
      border
      :row-class-name="setRowClassName"
    >
    <el-table-column prop='id' label="ID" width="100" align="center">
      <template #default="{ row }">
        <span class="ellipsis-text">{{ row.id }}</span>
      </template>
    </el-table-column>
      <el-table-column prop="name" label="Name" min-width="120" />
      <el-table-column prop="price" label="Price" width="100" align="center" />
      <el-table-column prop="rating" label="Rating" width="80" align="center" />
      <el-table-column prop="stockQuantity" label="Inventory" width="100" align="center" />
      <el-table-column prop="lowStockThreshold" label="Threshold" width="100" align="center" />
      <el-table-column prop="updatedTime" label="Last Updated" width="180" align="center" />
      <el-table-column prop="status" label="Status" width="80" align="center">
        <template #default="{ row }">
          <el-switch
          :model-value="row.status === '1'"
          @change="editProductStatus(row)"
          style="cursor: pointer;"
          >
            {{ row.status === '1' ? 'Avail' : 'NA' }}
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="Edit & Delete" width="110" fixed="right" align="center">
        <template #default="{ row }">
          <el-button-group>
            <el-button type="primary" size="small" @click="handleProductInfo(row)">
              <el-icon><InfoFilled /></el-icon>
            </el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="requestData.page"
        v-model:page-size="requestData.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
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

.stock-status {
  display: flex;
  gap: 20px;
  margin-right: auto; // 让状态显示靠左
  margin-left: 10px;
}

.status-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #606266;
}

.dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.red {
  background-color: #ff4d4f;
}

.yellow {
  background-color: #faad14;
}

.add-btn {
  background-color: $xtxColor;
  margin-right: 20px;

  &:hover {
    background-color: #22978c;
  }

  &:active {
    background-color: $sucColor;
  }
}

.search-bar {
  width: 25%;

  .search-btn {
    background-color: $xtxColor;
    color:#ffffff;

    &:hover {
      background-color: #22978c;
    }

    &:active {
      background-color: $sucColor;
    }
  }
}

.pagination {
  margin-top: 30px;
}

:deep(.row-red) {
  background-color: #ffebee; // 浅红色
}

:deep(.row-yellow) {
  background-color: #fff3e0; // 浅黄色
}

.custom-button {
  background-color: #ff9800;
}

.ellipsis-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
