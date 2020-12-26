import Vue from "vue";
import Router from "vue-router";
import store from "./store";

Vue.use(Router);

let routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("./views/Login.vue"),
  },
  {
    path: "/",
    component: () => import("@/layouts/Admin.vue"),
    meta: {
      requiresAuth: true,
    },
    name: "dashboard",
    redirect: {
      name: "EquipoDeVentas",
    },
    children: [
      // {
      //   path: "/colores",
      //   name: "Colors",
      //   component: () => import("@/views/Colors.vue"),
      // },
      {
        path: "/equipo-de-ventas",
        name: "EquipoDeVentas",
        component: () => import("@/views/EquipoDeVentas.vue"),
      },
      {
        path: "/locaciones",
        name: "Locaciones",
        component: () => import("@/views/Locaciones.vue"),
      },
      {
        path: "/telefonos",
        name: "Telefonos",
        component: () => import("@/views/Telefonos"),
      },
      {
        path: "/contactos",
        name: "Contactos",
        component: () => import("@/views/Contactos.vue"),
      },
      {
        path: "/agentes",
        name: "Agentes",
        component: () => import("@/views/Agentes.vue"),
      },
      {
        path: "/telefonos/googlepeople/:id/:clientId/:clientSecret",
        name: "Telefonos-googleContact",
        component: () => import("@/components/GooglePeopleCredenciales.vue"),
      },
      {
        path: "/telefonos/contactos/:id",
        name: "Telefonos-contactos",
        component: () => import("@/views/Telefonos/PeopleContacts"),
      },
      {
        path: "/perfil",
        name: "UserProfile",
        component: () => import("@/views/UserProfile.vue"),
      },
    ],
  },
  {
    path: "*",
    component: () => import("@/components/common/notFound.vue"),
  },
];

const router = new Router({
  routes,
  mode: "history",
});

router.beforeEach((to, from, next) => {
  // checkForUpdates();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const isTokenSet = store.getters["authModule/isTokenSet"];
  if (requiresAuth && !isTokenSet) {
    return next({ name: "login" });
  }
  // checkIfTokenNeedsRefresh();
  // store.commit("successModule/success", null);
  // store.commit("errorModule/error", null);
  return next();
});

export default router;
