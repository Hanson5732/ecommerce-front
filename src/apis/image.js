import request from '@/utils/request'

/**
 * @description 上传图片
 *
 * @param {File} file - 要上传的图片文件
 * @returns {Promise} - 返回包含图片URL的响应
 */
export const postImageAPI = async (file) => {
  const formData = new FormData()
  formData.append('file', file)  // 确保字段名与后端一致

  return request({
    url: '/image/upload/',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'  // 确保使用正确的Content-Type
    }
  })
}
