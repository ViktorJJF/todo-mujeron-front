import Vue from "vue";
import Router from "vue-router";
import store from "./store";
import { localStorageGet } from "@/utils/utils";
Vue.use(Router);

let routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("./views/Login.vue"),
  },
  {
    path: "/catalogo-digital/:id?",
    name: "Catalog",
    component: () => import("@/views/Catalog/index.vue"),
  },
  {
    path: "/ordenes/:id",
    name: "OrdenesSingle",
    component: () => import("@/views/Orders/index.vue"),
  },
  {
    path: "/dias-frecuencia",
    name: "DaysFrequency",
    component: () => import("@/views/Webviews/DaysFrequency.vue"),
  },
  {
    path: "/",
    component: () => import("@/layouts/Admin.vue"),
    meta: {
      requiresAuth: true,
    },
    name: "dashboard",
    redirect: {
      name: "Profile",
    },
    children: [
      // {
      //   path: "/colores",
      //   name: "Colors",
      //   component: () => import("@/views/Colors.vue"),
      // },
      {
        path: "/grupos",
        name: "Groups",
        component: () => import("@/views/Groups.vue"),
      },
      {
        path: "/grupos/:id",
        name: "EditarGrupos",
        component: () => import("@/views/GroupsEdit.vue"),
      },
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
        path: "/gravity-forms",
        name: "GravityForms",
        component: () => import("@/views/GravityForms.vue"),
      },
      {
        path: "/telefonos",
        name: "Telefonos",
        component: () => import("@/views/Telefonos"),
      },
      {
        path: "/bots",
        name: "Bots",
        component: () => import("@/views/Facebook.vue"),
      },
      {
        path: "/telegram/grupos",
        name: "TelegramGroups",
        component: () => import("@/views/TelegramGroups.vue"),
      },
      {
        path: "/telegram/rutinas",
        name: "TelegramRoutines",
        component: () => import("@/views/TelegramRoutines.vue"),
      },
      {
        path: "/catalogs",
        name: "Catalogs",
        component: () => import("@/views/CatalogsManager.vue"),
      },
      {
        path: "/ordenes",
        name: "Ordenes",
        component: () => import("@/views/Orders/index.vue"),
      },
      {
        path: "/marketplaces/ordenes",
        name: "MarketplaceOrdenes",
        component: () => import("@/views/MarketplaceOrders/index.vue"),
      },
      {
        path: "/marketplaces/productos",
        name: "MarketplaceProductos",
        component: () => import("@/views/MarketplaceProducts/index.vue"),
      },
      {
        path: "/marketplaces/productos-variaciones",
        name: "MarketplaceProductosVariaciones",
        component: () => import("@/views/MarketplaceProducts/Variations.vue"),
      },
      {
        path: "/marketplaces/fuentes",
        name: "MarketplaceFuentes",
        component: () => import("@/views/MarketplaceSources/index.vue"),
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
        path: "/vendedores",
        name: "Vendors",
        component: () => import("@/views/Vendors.vue"),
      },
      {
        path: "/usuarios",
        name: "Usuarios",
        component: () => import("@/views/Usuarios.vue"),
      },
      {
        path: "/facebook",
        name: "Facebook",
        component: () => import("@/views/Facebook.vue"),
      },
      {
        path: "/dialogflow",
        name: "Dialogflow",
        component: () => import("@/views/Dialogflow.vue"),
      },
      {
        path: "/mailchimp",
        name: "Mailchimp",
        component: () => import("@/views/Mailchimp.vue"),
      },
      {
        path: "/retail-rocket/etiquetas",
        name: "RetailRocketTags",
        component: () => import("@/views/RetailRocketTags.vue"),
      },
      {
        path: "/woocommerce",
        name: "Woocommerce",
        component: () => import("@/views/Woocommerce.vue"),
      },
      {
        path: "/whatsapp",
        name: "Whatsapp",
        component: () => import("@/views/Whatsapp.vue"),
      },
      {
        path: "/genial",
        name: "Genial",
        component: () => import("@/views/Genial.vue"),
      },
      {
        path: "/drive",
        name: "Drive",
        component: () => import("@/views/Drive.vue"),
      },
      {
        path: "/resumen-leads",
        name: "Leads",
        component: () => import("@/views/Leads.vue"),
      },
      {
        path: "/lead/sin-asignar",
        name: "LeadsNuevos",
        component: () => import("@/views/LeadsNuevos.vue"),
      },
      {
        path: "/lead/re-conectar",
        name: "LeadsReconectar",
        component: () => import("@/views/LeadsReconectar.vue"),
      },
      {
        path: "/lead/informado-al-agente",
        name: "LeadsInformados",
        component: () => import("@/views/LeadsInformados.vue"),
      },
      {
        path: "/lead/compra-realizada",
        name: "LeadsCompraRealizada",
        component: () => import("@/views/LeadsCompraRealizada.vue"),
      },
      {
        path: "/lead/compra-fallida",
        name: "LeadsCompraFallida",
        component: () => import("@/views/LeadsCompraFallida.vue"),
      },
      {
        path: "/lead/whatsapp",
        name: "LeadsWhatsapp",
        component: () => import("@/views/LeadsWhatsapp.vue"),
      },
      {
        path: "/lead/todos",
        name: "LeadsTodos",
        component: () => import("@/views/LeadsTodos.vue"),
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
        name: "Profile",
        component: () => import("@/views/Profile.vue"),
      },
      {
        path: "/usuarios/:id",
        name: "UsuariosEdit",
        component: () => import("@/views/UsuariosEdit.vue"),
      },
      {
        path: "/comment-to-msn",
        name: "CommentToMSN",
        component: () => import("@/views/CommentToMSN"),
      },
      {
        path: "/ads-messenger",
        name: "AdsMessenger",
        component: () => import("@/views/CommentToMSN"),
      },
      {
        path: "/comment-to-msn/:id",
        name: "CommentToMSNUpdate",
        component: () => import("@/views/CommentToMSNUpdate"),
      },
      {
        path: "/ads-messenger/:id",
        name: "AdToMSNUpdate",
        component: () => import("@/views/CommentToMSNUpdate"),
      },
      {
        path: "/productos",
        name: "Products",
        component: () => import("@/views/Products"),
      },
      {
        path: "/marcas",
        name: "Brands",
        component: () => import("@/views/Brands"),
      },
      {
        path: "/categorias",
        name: "Categories",
        component: () => import("@/views/Categories"),
      },
      {
        path: "/ecommerce/categorias",
        name: "EcommerceCategories",
        component: () => import("@/views/EcommerceCategories"),
      },
      {
        path: "/ecommerce/contactos",
        name: "EcommerceContacts",
        component: () => import("@/views/EcommerceContacts"),
      },
      {
        path: "/ecommerce/atributos",
        name: "EcommerceAttributes",
        component: () => import("@/views/EcommerceAttributes"),
      },
      {
        path: "/ecommerce/ordenes",
        name: "EcommerceOrders",
        component: () => import("@/views/EcommerceOrders/index"),
      },
      {
        path: "/ecommerce/etiquetas",
        name: "EcommerceTags",
        component: () => import("@/views/EcommerceTags"),
      },
      {
        path: "/ecommerce/productos",
        name: "EcommerceProducts",
        component: () => import("@/views/EcommerceProducts"),
      },
      {
        path: "/ecommerce/productos-variaciones",
        name: "EcommerceProductsVariations",
        component: () => import("@/views/EcommerceProducts/Variations"),
      },
      {
        path: "/ecommerce/productos/:id",
        name: "EcommerceProducts",
        component: () => import("@/views/EcommerceProducts/Single"),
      },
      {
        path: "/etiquetas-facebook",
        name: "FacebookLabels",
        component: () => import("@/views/FacebookLabels"),
      },
      {
        path: "/etiquetas-todofull",
        name: "TodofullLabels",
        component: () => import("@/views/TodofullLabels"),
      },
      {
        path: "/comentarios-sin-respuesta",
        name: "CommentsWithoutResponses",
        component: () => import("@/views/CommentsWithoutResponses"),
      },
      {
        path: "/etiquetas-y-agentes",
        name: "LabelsAndAgents",
        component: () => import("@/views/LabelsAndAgents"),
      },
      {
        path: "/mailchimp/contactos",
        name: "MailchimpContacts",
        component: () => import("@/views/MailchimpContacts"),
      },
      {
        path: "/mailchimp/etiquetas",
        name: "MailchimpTags",
        component: () => import("@/views/MailchimpTags"),
      },
      {
        path: "/chat",
        name: "ChatRoom",
        component: () => import("@/views/ChatRoom"),
      },
      {
        path: "/facebook-audiencias",
        name: "FacebookAudiences",
        component: () => import("@/views/FacebookAudiences"),
      },
      {
        path: "/marketing/segmentos",
        name: "MarketingSegments",
        component: () => import("@/views/MarketingSegments"),
      },
      {
        path: "/marketing/campaigns",
        name: "MarketingCampaigns",
        component: () => import("@/views/MarketingCampaigns"),
      },
      {
        path: "/marketing/historial-plantillas",
        name: "TemplateMessagesLogs",
        component: () => import("@/views/TemplateMessagesLogs"),
      },
      {
        path: "/marketing/campaigns/crear",
        name: "MarketingCampaignsCreate",
        component: () => import("@/components/MarketingCampaignsForm"),
      },
    ],
  },
  {
    path: "/test",
    component: () => import("@/views/test"),
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
  const isMultiPage = localStorageGet("token") === false;
  const isTokenSet = isMultiPage
    ? true
    : store.getters["authModule/isTokenSet"];
  if (requiresAuth && !isTokenSet) {
    return next({ name: "login" });
  }
  // checkIfTokenNeedsRefresh();
  // store.commit("successModule/success", null);
  // store.commit("errorModule/error", null);
  return next();
});

export default router;
