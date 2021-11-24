import {
  createRouter as createVueRouter,
  createMemoryHistory,
} from "vue-router";

export function createRouter({ debug }) {
  const router = createVueRouter({
    history: createMemoryHistory(),
    routes: [],
  });

  router.beforeEach((to, from) => {
    if (debug) {
      console.log(`router: ${from.fullPath} > ${to.fullPath}`);
    }
  });

  return router;
}
