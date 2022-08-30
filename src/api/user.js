import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}
export function getUserInfo(token) {
  return request({
    url: '/users/user_info',
    method: 'get'
  })
}