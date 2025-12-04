import request from '@/utils/request'

/**
 * @description 管理员获取所有订单
 *
 * @param {*} params
 * @returns
 */
export const getAdminOrdersAPI = async (params) => {
  return request({
    url: '/order/admin/list/',
    method: 'GET',
    params
  })
}

/**
 * @description 管理员更新相关订单
 *
 * @param {*} data
 * @returns
 */
export const updateOrderStatusAPI = (itemId, data) => {
  return request({
    url: '/order/admin/item/update/',
    method: 'PUT',
    data: {
      itemId: itemId,
      status: data.status
    }
  })
}

/**
 * @description 获取指定订单详情
 *
 * @param {*} params - 订单的 ID
 * @returns {Promise} - 返回请求的 Promise 对象
 */
export const getOrderDetailAPI = async (id) => {
  return request({
    url: '/order/admin/detail/', // 假设这是获取订单详情的正确路径
    method: 'GET',
    params: {
      id
    }
  })
}
