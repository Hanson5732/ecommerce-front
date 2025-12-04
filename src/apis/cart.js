import request from '@/utils/request'

export const saveCartAPI = async (data) => {
  return request({
    url: '/cart/save/',
    method: 'POST',
    data
  })
}

export const getCartAPI = async () => {
  return request({
    url: '/cart/',
  })
}

export const addCartAPI = async (id) => {
  return request({
    url: '/cart/add/',
    method: 'POST',
    data: {
      "user_id": id
    }
  })
}
