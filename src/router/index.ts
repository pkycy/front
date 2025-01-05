import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/components/Login.vue'
import HomeView from '@/components/Home.vue'
import HomePage from '@/views/homePage.vue'
import OrderPage from '@/views/orderPage.vue'
import DesignPage from '@/views/designPage.vue'
import ProductPage from '@/views/productPage.vue'
import PartPage from '@/views/partPage.vue'
import UserPage from '@/views/userPage.vue'
import HomePageTwo from '@/views/homePageTwo.vue'
import OrderPageTwo from '@/views/orderPageTwo.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      children: [
        {
          path: '',
          redirect: 'homePage',
        },
        {
          path: '/homePageTwo',
          name: 'homePageTwo',
          component: HomePageTwo,
        },
        {
          path: '/homePage',
          name: 'homePage',
          component: HomePage,
        },

        {
          path: '/orderPage',
          name: 'orderPage',
          component: OrderPage,
        },
        {
          path: '/orderPageTwo',
          name: 'orderPageTwo',
          component: OrderPageTwo,
        },
        {
          path: '/designPage',
          name: 'designPage',
          component: DesignPage,
        },
        {
          path: '/productPage',
          name: 'productPage',
          component: ProductPage,
        },
        {
          path: '/partPage',
          name: 'partPage',
          component: PartPage,
        },
        {
          path: '/userPage',
          name: 'userPage',
          component: UserPage,
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    const token = window.sessionStorage.getItem('token')
    if (token) {
      next()
    } else {
      next('/login')
    }
  }
})
export default router
