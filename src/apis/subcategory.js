import request from "@/utils/request";

/**
 * @description 获取二级分类下的导航信息
 *
 * @param {*} id
 * @returns
 */
export const getSubcategoryFilterAPI = (id) => {
  return request({
    url: `/category/sub/filter/${id}/`,
  })
}

/**
 * @description 获取二级分类下的产品信息
 *
 * @param {*} data = {
      subCategoryId: route.params.id,
      page: 1,
      pageSize: 20,
      sortField: 'created_time'
    }

 * @returns
 */
export const getSubcategoryProductAPI = (params) => {
  return request({
    url: `/category/sub/product/`,
    params
  })
}

/**
 * @description 获取二级分类
 *
 * @returns
 */
export const getSubcategoryAPI = () => {
  return request({
    url: '/category/sub/list/'
  })
}

/**
 * @description 管理员获取分类ID
 *
 * @param {*} params
 * @returns
 */
export const getAdminSubcategoryAPI = (params) => {
  const { page, pageSize } = params
  return request({
    url: '/category/admin/sub/list',
    params: {
      page,
      pageSize
    }
  })
}

/**
 * @description 管理员添加新二级分类
 *
 * @param {*} data
 * @returns
 */
export const addSubcategoryAPI = (data) => {
  return request({
    url: '/category/sub/add/',
    method: 'POST',
    data
  })
}

/**
 * @description 更新二级分类
 *
 * @param {*} data
 * @returns
 */
export const updateSubcategoryAPI = (data) => {
  return request({
    url: '/category/sub/update/',
    method: 'PUT',
    data
  })
}

/**
 * @description 删除二级分类
 *
 * @param {*} id
 * @returns
 */
export const deleteSubcategoryAPI = (id) => {
  return request({
    url: '/category/sub/delete/',
    method: 'DELETE',
    data: { id }
  })
}
