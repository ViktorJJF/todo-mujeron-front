import Vue from "vue";
import axios from "axios";
// import { checkIfTokenNeedsRefresh } from "@/utils/utils.js";
// import { checkForUpdates } from "@/utils/updates.js";

axios.defaults.timeout = 60000;

axios.defaults.baseURL = process.env.VUE_APP_API_URL || "";
axios.defaults.headers.common["Accept-Language"] =
  JSON.parse(localStorageGet("locale")) || "es";
import { localStorageGet } from "@/utils/utils2.js";

axios.interceptors.request.use(
  (config) => {
    // Do something before request is sent
    // If request is different than any of the URLS in urlsExcludedForBearerHeader
    // then send Authorization header with token from localstorage
    const urlsExcludedForBearerHeader = [
      "/api/login",
      "/api/forgot",
      "/api/reset",
      `${window.location.origin}/version.json`,
    ];
    if (urlsExcludedForBearerHeader.indexOf(config.url) === -1) {
      config.headers.Authorization = `Bearer ${localStorageGet("token")}`;
      config.headers.companyId = `${
        JSON.parse(localStorageGet("user"))
          ? JSON.parse(localStorageGet("user")).companyId
          : ""
      }`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axios.interceptors.response.use(
  (response) => {
    // Do something with response data
    // Checks if app is being used in mobile
    // if (
    //   response.config.url !== `${process.env.VUE_APP_API_URL}/token` &&
    //   response.config.url !== `${window.location.origin}/version.json`
    // ) {
    //   //   checkForUpdates();
    //   checkIfTokenNeedsRefresh();
    // }
    return response;
  },
  (error) => {
    // Do something with response error
    return Promise.reject(error);
  }
);

// eslint-disable-next-line no-shadow
Plugin.install = (Vue) => {
  Vue.axios = axios;
  window.axios = axios;
  Object.defineProperties(Vue.prototype, {
    axios: {
      get() {
        return axios;
      },
    },
    $axios: {
      get() {
        return axios;
      },
    },
  });
};

Vue.use(Plugin);

export default axios;
