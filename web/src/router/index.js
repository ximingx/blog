import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'UserLogin',
    component: () => import("../views/UserLogin.vue"),
  },
  {
    path: '/index',
    name: 'HomeIndex',
    component: () => import("../views/HomeIndex.vue"),
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
