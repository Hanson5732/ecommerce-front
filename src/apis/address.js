import request from '@/utils/request'

/**
 * @description 获取地址
 *
 * @param {*} id
 * @returns
 */
export const getAddressAPI = async (id) => {
  return request({
    'url': '/address/',
    params: {
      id
    }
  })
}

/**
 * @description 添加地址
 *
 * @param {*} data
 * @returns
 */
export const addAddressAPI = async (data) => {
  return request({
    'url': '/address/add/',
    method: 'POST',
    data
  })
}

/**
 * @description 在注册前添加地址
 *
 * @param {*} data
 * @param {*} access
 * @returns
 */
export const addRegisterAddressAPI = async (data, access) => {
  return request({
    'url': '/address/add/',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`
    },
    data
  })
}

/**
 * @description 修改地址
 *
 * @param {*} data
 * @returns
 */
export const editAddressAPI = async (data) => {
  return request({
    'url': '/address/update/',
    method: 'PUT',
    data
  })
}

/**
 * @description 删除地址
 *
 * @param {*} id
 * @returns
 */
export const deleteAddressAPI = async (id) => {
  return request({
    'url': '/address/delete/',
    method: 'DELETE',
    data: {
      id
    }
  })
}
