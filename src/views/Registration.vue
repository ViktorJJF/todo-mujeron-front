<template>
  <div class="backgroundImage">
    <div class="wrapper fadeInDown">
      <div id="formContent">
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-form>
            <!-- Tabs Titles -->
            <h2 class="active">Registro</h2>

            <!-- Icon -->
            <div class="fadeIn first">
              <v-img class="fadeIn first circular" aspect-ratio="2" contain src="/images/logo/todofull.jpg"></v-img>
            </div>

            <!-- Registration Form -->
            <VTextFieldWithValidation id="email" name="email" class="fadeIn second" customClasses="mx-9 my-3"
              rules="required|email" v-model="user.email" label="Email" prepend-inner-icon="mdi-account" />
            <VTextFieldWithValidation id="first-name" name="first-name" class="fadeIn second" customClasses="mx-9 my-3"
              rules="required" v-model="user.first_name" label="Nombres" prepend-inner-icon="mdi-account" type="text" />
            <VTextFieldWithValidation id="last-name" name="last-name" class="fadeIn second" customClasses="mx-9 my-3"
              rules="required" v-model="user.last_name" label="Apellidos" prepend-inner-icon="mdi-account" type="text" />
            <VTextFieldWithValidation id="password" class="fadeIn second" customClasses="mx-9 my-3" rules="required"
              v-model="user.password" label="Contraseña" prepend-inner-icon="mdi-lock" type="password" />
            <VTextFieldWithValidation id="confirm-password" class="fadeIn second" customClasses="mx-9 my-3"
              rules="required" v-model="user.password" label="Confirmar Contraseña" prepend-inner-icon="mdi-lock"
              type="password" />
            <v-btn :loading="loading" class="ma-5" color="info" lass="fadeIn fourth" value="Ingresar"
              @click="passes(register)">Ingresar</v-btn>
          </v-form>
        </ValidationObserver>
      </div>
    </div>
  </div>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
export default {
  components: {
    VTextFieldWithValidation,
  },
  data() {
    return {
      loading: false,
      user: { email: "", password: "", firstName: "", lastName: "" },
    };
  },
  created() {
    if (this.$store.state.authModule.isTokenSet) {
      this.$router.push({ name: "dashboard" });
    }
  },
  methods: {
    register() {
      let user = this.user;
      // this.loading = true;
      this.$store
        .dispatch("usersModule/createCorporation", { ...user, token: this.$route.params.token })
        .then(() => {
          this.$router.push({ name: "dashboard" });
        })
        .catch((error) => {
          console.log("error en login: ", error);
        })
        .finally(() => (this.loading = false));
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
