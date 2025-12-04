import request from '@/utils/request'

/**
 * @description 添加评论
 *
 * @param {*} data {
 *  rating: 0,
 *  commentDesc: '',
 *  images: [],
 *  orderItemId: '',
 * }
 * @returns
 */
export const addCommentAPI = async (data) => {
  return request({
    url: '/comment/add/',
    method: 'POST',
    data
  })
}

/**
 * @description 获取评论
 *
 * @param {*} params {
 * id: 商品id
 * currentPage: 当前分页
 * pageSize: 页面大小
 * }
 * @returns
 */
export const getProductCommentAPI = async (params) => {
  return request({
    url: '/comment/list/',
    params
  })
}

/**
 * @description 获取特定评论
 *
 * @param {*} id
 * @returns
 */
export const getCommentAPI = async (id) => {
  return request({
    url: '/comment/get/',
    params: {
      id
    }
  })
}

export const editCommentAPI = async (data) => {
  return request({
    url: '/comment/update/',
    method: 'PUT',
    data
  })
}

export const deleteCommentAPI = async (id) => {
  return request({
    url: '/comment/delete/',
    method: 'DELETE',
    data: {id}
  })
}
