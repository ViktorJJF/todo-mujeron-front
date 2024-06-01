<template>
  <div class="backgroundImage">
    <div class="wrapper fadeInDown">
      <div id="formContent">
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-form @submit.prevent="passes(login)">
            <!-- Tabs Titles -->
            <h2 class="active">Ingreso</h2>

            <!-- Icon -->
            <div class="fadeIn first">
              <v-img
                class="fadeIn first circular"
                aspect-ratio="2"
                contain
                src="/images/logo/todofull.jpg"
              ></v-img>
            </div>

            <!-- Login Form -->
            <VTextFieldWithValidation
              id="corporation"
              class="fadeIn second"
              customClasses="mx-9 my-3"
              rules="required"
              v-model="corporation"
              label="Corporación"
              prepend-inner-icon="mdi-domain"
            />
            <VTextFieldWithValidation
              id="login"
              name="login"
              class="fadeIn second"
              customClasses="mx-9 my-3"
              rules="required|email"
              v-model="user.email"
              label="Correo"
              prepend-inner-icon="mdi-account"
            />
            <VTextFieldWithValidation
              id="password"
              class="fadeIn second"
              customClasses="mx-9 my-3"
              rules="required"
              v-model="user.password"
              label="Contraseña"
              prepend-inner-icon="mdi-lock"
              type="password"
            />
            <v-btn
              type="submit"
              :loading="loading"
              class="ma-5"
              color="info"
              lass="fadeIn fourth"
              value="Ingresar"
              >Ingresar</v-btn
            >
          </v-form>
        </ValidationObserver>
        <v-facebook-login
          :login-options="{
            scope:
              'ads_management,instagram_manage_messages,pages_messaging,pages_manage_metadata,instagram_manage_comments,instagram_manage_insights,pages_read_engagement,instagram_basic,pages_show_list,business_management,instagram_content_publish,catalog_management',
          }"
          style="margin: auto"
          @login="facebookLogged"
          app-id="309102442977190"
          class="mb-3"
        ></v-facebook-login>
      </div>
    </div>
  </div>
</template>

<script>
import VFacebookLogin from "vue-facebook-login-component";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import graphApi from "@/services/api/graphApi";
export default {
  components: {
    VTextFieldWithValidation,
    VFacebookLogin,
  },
  data() {
    return {
      loading: false,
      user: { email: "", password: "" },
      corporation: null,
    };
  },
  created() {
    if (this.$store.state.authModule.isTokenSet) {
      this.$router.push({ name: "dashboard" });
    }
  },
  methods: {
    login() {
      let user = this.user;
      let corporation = this.corporation;
      // this.loading = true;
      this.$store
        .dispatch("authModule/login", {
          user,
          corporation,
        })
        .then(() => {
          this.$router.push({ name: "dashboard" });
        })
        .catch((error) => {
          console.log("error en login: ", error);
        })
        .finally(() => (this.loading = false));
    },
    async facebookLogged(e) {
      console.log("🚀 Aqui *** -> e", e);
      // solo para fines de test, se logea con USUARIO TEST
      this.$store.state.facebookAccessToken = e.authResponse.accessToken;
      this.user.email = "pruebas@mujeron.cl";
      this.user.password = "Telepizz@";
      this.login();
      const accessToken = (
        await graphApi.getLongUserToken(e.authResponse.accessToken)
      ).data.payload.access_token;
      // set to localstorage
      localStorage.setItem("facebookAccessToken", accessToken);
      let facebookUser = await graphApi.getUserInformation(
        e.authResponse.accessToken
      );

      console.log("🐞 LOG HERE accessToken:", accessToken);
      this.$store.state.facebookName = facebookUser.data.payload.name;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css?family=Poppins");

/* BASIC */

.circular {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  background-color: blue;
  display: inline-block;
  vertical-align: middle;
}

.backgroundImage {
  height: 100%;
  background-color: #28156c;
  opacity: 0.9;
}

body {
  font-family: "Poppins", sans-serif;
  height: 100vh;
}

a {
  color: #92badd;
  display: inline-block;
  text-decoration: none;
  font-weight: 400;
}

h2 {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  display: inline-block;
  margin: 40px 8px 10px 8px;
  color: #cccccc;
}

/* STRUCTURE */

.wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 20px;
}

#formContent {
  -webkit-border-radius: 10px 10px 10px 10px;
  border-radius: 10px 10px 10px 10px;
  background: #fff;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  position: relative;
  padding: 0px;
  -webkit-box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
  box-shadow: 0 30px 60px 0 rgba(0, 0, 0, 0.3);
  text-align: center;
}

#formFooter {
  background-color: #f6f6f6;
  border-top: 1px solid #dce8f1;
  padding: 25px;
  text-align: center;
  -webkit-border-radius: 0 0 10px 10px;
  border-radius: 0 0 10px 10px;
}

/* TABS */

h2.inactive {
  color: #cccccc;
}

h2.active {
  color: #0d0d0d;
  border-bottom: 2px solid #5fbae9;
}

/* FORM TYPOGRAPHY*/

.submitButton {
  background-color: #56baed;
  border: none;
  color: white;
  padding: 15px 80px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  text-transform: uppercase;
  font-size: 13px;
  -webkit-box-shadow: 0 10px 30px 0 rgba(95, 186, 233, 0.4);
  box-shadow: 0 10px 30px 0 rgba(95, 186, 233, 0.4);
  -webkit-border-radius: 5px 5px 5px 5px;
  border-radius: 5px 5px 5px 5px;
  margin: 5px 20px 40px 20px;
  -webkit-transition: all 0.3s ease-in-out;
  -moz-transition: all 0.3s ease-in-out;
  -ms-transition: all 0.3s ease-in-out;
  -o-transition: all 0.3s ease-in-out;
  transition: all 0.3s ease-in-out;
}

input[type="button"]:hover,
input[type="submit"]:hover,
input[type="reset"]:hover {
  background-color: #39ace7;
}

input[type="button"]:active,
input[type="submit"]:active,
input[type="reset"]:active {
  -moz-transform: scale(0.95);
  -webkit-transform: scale(0.95);
  -o-transform: scale(0.95);
  -ms-transform: scale(0.95);
  transform: scale(0.95);
}

input[type="text"] {
  background-color: #f6f6f6;
  border: none;
  color: #0d0d0d;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 5px;
  width: 85%;
  border: 2px solid #f6f6f6;
  -webkit-transition: all 0.5s ease-in-out;
  -moz-transition: all 0.5s ease-in-out;
  -ms-transition: all 0.5s ease-in-out;
  -o-transition: all 0.5s ease-in-out;
  transition: all 0.5s ease-in-out;
  -webkit-border-radius: 5px 5px 5px 5px;
  border-radius: 5px 5px 5px 5px;
}

input[type="text"]:focus {
  background-color: #fff;
  border-bottom: 2px solid #5fbae9;
}

input[type="text"]:placeholder {
  color: #cccccc;
}

/* ANIMATIONS */

/* Simple CSS3 Fade-in-down Animation */
.fadeInDown {
  -webkit-animation-name: fadeInDown;
  animation-name: fadeInDown;
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

@-webkit-keyframes fadeInDown {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
  100% {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

@keyframes fadeInDown {
  0% {
    opacity: 0;
    -webkit-transform: translate3d(0, -100%, 0);
    transform: translate3d(0, -100%, 0);
  }
  100% {
    opacity: 1;
    -webkit-transform: none;
    transform: none;
  }
}

/* Simple CSS3 Fade-in Animation */
@-webkit-keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@-moz-keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fadeIn {
  opacity: 0;
  -webkit-animation: fadeIn ease-in 1;
  -moz-animation: fadeIn ease-in 1;
  animation: fadeIn ease-in 1;

  -webkit-animation-fill-mode: forwards;
  -moz-animation-fill-mode: forwards;
  animation-fill-mode: forwards;

  -webkit-animation-duration: 1s;
  -moz-animation-duration: 1s;
  animation-duration: 1s;
}

.fadeIn.first {
  -webkit-animation-delay: 0.4s;
  -moz-animation-delay: 0.4s;
  animation-delay: 0.4s;
}

.fadeIn.second {
  -webkit-animation-delay: 0.6s;
  -moz-animation-delay: 0.6s;
  animation-delay: 0.6s;
}

.fadeIn.third {
  -webkit-animation-delay: 0.8s;
  -moz-animation-delay: 0.8s;
  animation-delay: 0.8s;
}

.fadeIn.fourth {
  -webkit-animation-delay: 1s;
  -moz-animation-delay: 1s;
  animation-delay: 1s;
}

/* Simple CSS3 Fade-in Animation */
.underlineHover:after {
  display: block;
  left: 0;
  bottom: -10px;
  width: 0;
  height: 2px;
  background-color: #56baed;
  content: "";
  transition: width 0.2s;
}

.underlineHover:hover {
  color: #0d0d0d;
}

.underlineHover:hover:after {
  width: 100%;
}

/* OTHERS */

*:focus {
  outline: none;
}

#icon {
  width: 60%;
}

* {
  box-sizing: border-box;
}
</style>
