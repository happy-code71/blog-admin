import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

export const constantRoutes = [
  // 首页
  {
    path: '/',
    name: 'index',
    redirect: '/welcome',
    component: Layout,
    children: [
      {
        path: 'welcome',
        name: 'home',
        component: () => import('@/views/home/index'),
        meta: { title: 'welcome', icon: 'el-icon-s-home' },
      }
    ]
  },
  // 文章管理
  {
    path: '/article',
    component: Layout,
    redirect: '/article/table',
    name: 'article',
    meta: { title: '文章管理', icon: 'el-icon-menu' },
    children: [
      {
        path: 'table',
        name: 'article_table',
        component: () => import('@/views/article/index'),
        meta: { title: '文章列表', icon: 'el-icon-s-grid' }
      },
      {
        path: 'add',
        name: 'article_add',
        component: () => import('@/views/article/components/ArticleAdd'),
        meta: { title: '文章新增', icon: 'el-icon-circle-plus-outline' }
      },
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },


  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  mode:'history',
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
