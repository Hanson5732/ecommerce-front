<script setup>
import { ref, watch } from 'vue'

// 定义props
const props = defineProps({
  addresses: {
    type: Array,
    required: true,
    default: () => []
  }
})

const showChangeDialog = ref(false)
const showAddDialog = ref(false)

// 新增地址对象
const newAddress = ref({
  recipient: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  additionalAddress: '',
  postalCode: '',
  tag: ''
})

const emit = defineEmits(['change-address', 'add-address', 'edit-address'])

// 切换地址
const activeAddress = ref({})
const switchAddress = (addr) => {
  activeAddress.value = addr
}

// 确认地址切换
const confirmChange = () => {
  emit('change-address', activeAddress.value)
  showChangeDialog.value = false
  activeAddress.value = {}
}

const addAddressFormRef = ref(null)
const editAddressFormRef = ref(null)

// 添加地址
const handleAddAddress = () => {
  addAddressFormRef.value.validate((valid) => {
    if (valid) {
      emit('add-address', newAddress.value)
      showAddDialog.value = false
      // 重置表单
      newAddress.value = {
        recipient: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        additionalAddress: '',
        postalCode: '',
        tag: ''
      }
    } else {
      return false
    }
  })
}

// 新增计算颜色函数
const getTagColor = (tag) => {
  switch (tag) {
    case 'Home':
      return '#27ba9b';
    case 'Company':
      return '#87CEEB';
    case 'Friend':
      return '#e26237';
    default:
      return '#909090';
  }
};

const showEditDialog = ref(false)
const editAddress = ref({
  id: '',
  recipient: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  additionalAddress: '',
  postalCode: '',
  tag: ''
})

const handleEdit = (addr) => {
  editAddress.value = { ...addr }
  showEditDialog.value = true
}

const handleEditAddress = () => {
  editAddressFormRef.value.validate((valid) => {
    if (valid) {
      emit('edit-address', editAddress.value)
      showEditDialog.value = false
    } else {
      return false
    }
  })
}

const addressRules = {
  recipient: [
    { required: true, message: 'The recipient cannot be empty', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: 'The phone cannot be empty', trigger: 'blur' },
  ],
  province: [
    { required: true, message: 'The province cannot be empty', trigger: 'blur' },
  ],
  city: [
    { required: true, message: 'The city cannot be empty', trigger: 'blur' },
  ],
  district: [
    { required: true, message: 'The district cannot be empty', trigger: 'blur' },
  ],
  additionalAddress: [
    { required: true, message: 'The additional address cannot be empty', trigger: 'blur' },
  ],
}

// 在showChangeDialog打开时，设置activeAddress为默认地址
watch(showChangeDialog, (newVal) => {
  if (newVal) {
    // 找到默认地址并设置为activeAddress
    const defaultAddress = props.addresses.find(addr => addr.isDefault)
    if (defaultAddress) {
      activeAddress.value = defaultAddress
    }
  }
})

defineExpose({
  showChangeDialog,
  showAddDialog
})
</script>


<template>
  <!-- 切换地址 -->
  <el-dialog v-model="showChangeDialog" title="Change Shipping Address" width="30%" center :style="{ height: '500px' }">
    <div class="addressWrapper">
      <div class="text item"
           :class="{active: activeAddress.id === addr.id}"
           @click="switchAddress(addr)"
           v-for="addr in props.addresses"
           :key="addr.id">
        <ul>
          <li>
            <span>Recipient: </span>{{ addr.recipient }}
            <span class="tag" v-show="addr.isDefault === true"
              style="color: #27ba9b; background-color: #e8f8f5; border-color: #27ba9b">Default</span>
            <span
              class="tag"
              :style="{
                color: getTagColor(addr.tag),
                backgroundColor: addr.tag === 'Home' ? '#e8f8f5' :
                        addr.tag === 'Company' ? '#e8f6fa' :
                        addr.tag === 'Friend' ? '#faf0eb' :
                        '#f5f5f5',
                borderColor: getTagColor(addr.tag)
              }"
            >{{ addr.tag }}</span>
          </li>
          <li><span>Contact: </span>{{ addr.phone }}</li>
          <li><span>Address: </span>{{ addr.additionalAddress + ' ' + addr.fullLocation }}</li>
        </ul>
        <el-button type="text" class="edit-btn" @click="handleEdit(addr)">Edit</el-button>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showChangeDialog = false">Cancel</el-button>
        <el-button type="primary" @click="confirmChange">Confirm</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 添加地址 -->
  <el-dialog v-model="showAddDialog" title="Add New Address" width="50%" center>
    <el-form ref="addAddressFormRef" :model="newAddress" :rules="addressRules" label-width="120px" class="address-form">
      <el-form-item label="Recipient" prop="recipient">
        <el-input v-model="newAddress.recipient" />
      </el-form-item>
      <el-form-item label="Contact" prop="phone">
        <el-input v-model="newAddress.phone" />
      </el-form-item>
      <el-form-item label="Province" prop="province">
        <el-input v-model="newAddress.province" />
      </el-form-item>
      <el-form-item label="City" prop="city">
        <el-input v-model="newAddress.city" />
      </el-form-item>
      <el-form-item label="District" prop="district">
        <el-input v-model="newAddress.district" />
      </el-form-item>
      <el-form-item label="Detail Address" prop="additionalAddress">
        <el-input v-model="newAddress.additionalAddress" />
      </el-form-item>
      <el-form-item label="Postal Code" prop="postalCode">
        <el-input v-model="newAddress.postalCode" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showAddDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleAddAddress">Confirm</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 编辑地址 -->
  <el-dialog v-model="showEditDialog" title="Edit Address" width="50%" center>
    <el-form ref="editAddressFormRef" :model="editAddress" :rules="addressRules" label-width="120px" class="address-form">
      <el-form-item label="Recipient" prop="recipient">
        <el-input v-model="editAddress.recipient" />
      </el-form-item>
      <el-form-item label="Contact" prop="phone">
        <el-input v-model="editAddress.phone" />
      </el-form-item>
      <el-form-item label="Province" prop="province">
        <el-input v-model="editAddress.province" />
      </el-form-item>
      <el-form-item label="City" prop="city">
        <el-input v-model="editAddress.city" />
      </el-form-item>
      <el-form-item label="District" prop="district">
        <el-input v-model="editAddress.district" />
      </el-form-item>
      <el-form-item label="Detail Address" prop="additionalAddress">
        <el-input v-model="editAddress.additionalAddress" />
      </el-form-item>
      <el-form-item label="Postal Code">
        <el-input v-model="editAddress.postalCode" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEditDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleEditAddress">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
@use "sass:color";

.addressWrapper {
  height: 370px;
  overflow-y: auto;
  padding-right: 10px;
}

.text {
  flex: 1;
  min-height: 90px;
  display: flex;
  align-items: center;
  position: relative;

  &.item {
    border: 1px solid #f5f5f5;
    margin-bottom: 10px;
    cursor: pointer;

    &.active,
    &:hover {
      border-color: $xtxColor;
      background: color.scale($xtxColor, $lightness: 89.4736842105%);
    }

    >ul {
      padding: 10px;
      font-size: 14px;
      line-height: 30px;
    }
  }

  .tag {
    margin-left: 10px;
    font-size: 12px;
    font-weight: bold;
    padding: 1px 4px;
    border-radius: 8px;
    display: inline-block;
    border-width: 1px;
    border-style: dashed;
  }

  .edit-btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
  }
}

.address-form {
  .el-form-item {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
    margin-top: 10px;
    margin-bottom: 20px;

    .el-input {
      width: 100%;
    }
  }
}
</style>
