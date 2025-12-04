import request from '@/utils/request'

/**
 * @description 获取指定可用商品信息
 *
 * @param {*} id
 * @returns
 */
export const getDetailAPI = (id) => {
  return request({
    url: `/product/detail/${id}/`,
  })
}

export const getProductStatusAPI = (id) => {
  return request({
    url: `/product/detail/status/`,
    params: {id}
  })
}

/**
 * @description 新增商品
 *
 * @param {*} data
 * @returns
 */
export const addProductAPI = async (data) => {
  return request({
    url: `/product/add/`,
    method: 'POST',
    data
  })
}

/**
 * @description 更新商品
 *
 * @param {*} id
 * @param {*} data
 * @returns
 */
export const updateProductAPI = async (id, data) => {
  return request({
    url: `/product/update/${id}/`,
    method: 'PUT',
    data
  })
}

/**
 * @description 删除商品
 *
 * @param {*} id
 * @returns
 */
export const deleteProductAPI = async (id) => {
  return request({
    url: `/product/delete/${id}/`,
    method: 'PATCH',
  })
}

/**
 * @description 修改指定商品
 *
 * @param {*} id
 * @param {*} data
 * @returns
 */
export const editProductAPI = async (id, data) => {
  return request({
    url: `/product/update/${id}/`,
    method: 'PUT',
    data
  })
}

/**
 * @description 管理员界面获取所有商品
 *
 * @param {*} id
 * @returns
 */
export const getAdminProductAPI = async (id) => {
  return request({
    url: `/product/admin/${id}/`,
  })
}

/**
 * @description 详情界面相似商品推荐
 *
 * @param {*} data
 * @returns
 */
export const getRecommendationAPI = async (name, id) => {
  return request({
    url: '/product/recommend/',
    params: {
      name: name,
      id: id
    }
  })
}
