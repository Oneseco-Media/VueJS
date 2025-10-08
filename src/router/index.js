import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LandingView from '../views/LandingView.vue'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/landing',
      name: 'landing',
      component: LandingView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading.value) {
    const unwatch = router.app?.$watch(
      () => isLoading.value,
      (loading) => {
        if (!loading) {
          unwatch?.()
          handleNavigation()
        }
      }
    )
    
    if (!isLoading.value) {
      handleNavigation()
    }
  } else {
    handleNavigation()
  }
  
  function handleNavigation() {
    if (to.meta.requiresAuth && !isAuthenticated.value) {
      next({ name: 'landing' })
    } else if (to.name === 'landing' && isAuthenticated.value) {
      next({ name: 'home' })
    } else {
      next()
    }
  }
})

export default router
