import request from '@/utils/request'

/**
 * @description 获取导航栏一级分类
 *
 * @returns
 */
export const getCategories = () => {
  return request({
    url: '/category/nav/'
  })
}

/**
 * @description 获取一级分类信息
 *
 * @param {*} id
 * @returns
 */

export function getCategoriesAPI(id) {
  return request({
    url: `/category/all/`,
    params: { id }
  })
}

/**
 * @description 管理员在更改产品时获取分类
 * @returns
 */
export const getCategoryAPI = () => {
  return request({
    url: '/category/list/',
  })
}

/**
 * @description 添加一级分类
 *
 * @param {string} name 分类名称
 * @returns
 */
export const addCategoryAPI = (name) => {
  return request({
    url: '/category/add/',
    method: 'POST',
    data: {
      name: name
    }
  })
}

/**
 * @description 更新一级分类
 *
 * @param {string} id 分类ID
 * @param {string} name 分类名称
 * @param {string} status 分类状态
 * @param {string[]} imageURL
 * @returns
 */
export const updateCategoryAPI = (id, name, status, imageURL) => {
  return request({
    url: '/category/update/',
    method: 'POST',
    data: {
      id: id,
      name: name,
      status: status,
      imageURL: imageURL || []
    }
  })
}

/**
 * @description 删除一级分类
 *
 * @param {string} id 分类ID
 * @returns
 */
export const deleteCategoryAPI = (id) => {
  return request({
    url: '/category/delete/',
    method: 'POST',
    data: {
      id: id
    }
  })
}

/**
 * @description 管理员获取分类
 *
 * @param {} data
 * @returns
 */
export const getAdminCategoryAPI = (params) => {
  return request({
    url: '/category/admin/list/',
    params
  })
}