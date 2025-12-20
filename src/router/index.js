import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LandingView from "../views/LandingView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "root",
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: "/landing",
      name: "landing",
      component: LandingView
    },
    {
      path: "/about",
      name: "about",
      component: () => import("../views/AboutView.vue"),
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const response = await fetch("/api/auth/user");
      if (response.ok) {
        next();
      } else {
        next({ name: "landing" });
      }
    } catch (error) {
      next({ name: "landing" });
    }
  } else if (to.name === "landing") {
    try {
      const response = await fetch("/api/auth/user");
      if (response.ok) {
        next({ name: "root" });
      } else {
        next();
      }
    } catch (error) {
      next();
    }
  } else {
    next();
  }
});

export default router;
