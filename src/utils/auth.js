import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return localStorage.getItem("token")
}

export function setToken(token) {
  return localStorage.setItem("token", token)
}

export function removeToken() {
  return localStorage.removeItem("token")
}
