import api from "@/services/api/auth";
// import apiUsers from "@/services/api/users";
import { buildSuccess, handleError } from "@/utils/utils.js";
import { localStorageGet } from "@/utils/utils2.js";
import router from "@/router";

const state = () => ({
  user: null,
  companies: [],
  selectedCompany: null,
  token: JSON.parse(!!localStorageGet("token")) || null,
  isTokenSet: !!localStorageGet("token"),
});

const getters = {
  user: (state) =>
    state.user ? state.user.first_name + " " + state.user.last_name : " ",
  token: (state) => (state.user ? state.user.token : " "),
  isTokenSet: (state) => state.isTokenSet,
  getCurrentCompany: (state) => state.selectedCompany,
};
const actions = {
  initialLoad({ commit }) {
    if (process.browser) {
      commit("initialLoad");
    }
  },
  login({ commit }, { email, password }) {
    return new Promise((resolve, reject) => {
      commit("loadingModule/showLoading", true, { root: true });
      api
        .login(email, password)
        .then((response) => {
          if (response.status === 200) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
            localStorage.setItem("token", response.data.token);
            // window.localStorage.setItem(
            //   "tokenExpiration",
            //   JSON.stringify(
            //     format(
            //       addMinutes(new Date(), MINUTES_TO_CHECK_FOR_TOKEN_REFRESH),
            //       "X"
            //     )
            //   )
            // );
            commit("saveUser", response.data.user);
            commit("saveToken", response.data.token);
            commit("setCompanies", response.data.user.companies)
            // commit(types.EMAIL_VERIFIED, response.data.user.verified);
            buildSuccess("Bienvenido", commit);
            resolve();
          }
        })
        .catch((error) => {
          handleError(error, commit, reject);
        });
    });
  },
  refreshToken({ commit }) {
    return new Promise((resolve, reject) => {
      api
        .refreshToken()
        .then((response) => {
          if (response.status === 200) {
            window.localStorage.setItem(
              "token",
              JSON.stringify(response.data.token)
            );
            // window.localStorage.setItem(
            //   "tokenExpiration",
            //   JSON.stringify(
            //     format(
            //       addMinutes(new Date(), MINUTES_TO_CHECK_FOR_TOKEN_REFRESH),
            //       "X"
            //     )
            //   )
            // );
            commit("saveToken", response.data.token);
            resolve();
          }
        })
        .catch((error) => {
          handleError(error, commit, reject);
        });
    });
  },
  autoLogin({ commit }) {
    console.log("vino autologin");
    const user = JSON.parse(localStorageGet("user"));
    commit("saveUser", user);
    commit("saveToken", localStorageGet("token"));
    commit("setCompanies", user.companies)
    // commit(types.EMAIL_VERIFIED, user.verified);
  },
  logout({ commit }) {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("tokenExpiration");
    window.localStorage.removeItem("user");
    router.push({ name: "login" });
    commit("logout");
  },
  setCurrentCompany({ commit }, id) {
    commit("setCurrentCompany", id);
  },
  setCompanies({ commit }, companies) {
    commit("setCompanies", companies)
  }
  // editUser({ commit }, { id, data }) {
  //   return new Promise((resolve, reject) => {
  //     commit("loadingModule/showLoading", true, { root: true });
  //     apiUsers
  //       .editMember(id, data)
  //       .then((res) => {
  //         let data = res.data.payload;
  //         buildSuccess("Registro guardado con éxito", commit, resolve);
  //         commit("editUser", data);
  //         resolve();
  //       })
  //       .catch((error) => {
  //         handleError(error, commit, reject);
  //       });
  //   });
  // },
};
const mutations = {
  saveToken(state, token) {
    state.token = token;
    state.isTokenSet = true;
  },
  logout(state) {
    state.user = null;
    state.token = null;
    state.isTokenSet = false;
  },
  saveUser(state, user) {
    state.user = user;
  },
  setCurrentCompany(state, id) {
    /* state.companies.map(c => {
      c.selected = false;
    }); */
    const index = state.companies.findIndex(c => c.company._id === id);
    // state.companies[index].selected = true;
    state.selectedCompany = state.companies[index];
  },
  setCompanies(state, companies) {
    state.companies = companies;
    const index = state.companies.findIndex(c => c.default === true);
    state.selectedCompany = state.companies[index];
  }
};

const namespaced = true;

export default { getters, actions, mutations, state, namespaced };
