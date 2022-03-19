<template>
  <v-facebook-login @login="logged" app-id="309102442977190"></v-facebook-login>
</template>

<script>
import VFacebookLogin from "vue-facebook-login-component";

export default {
  components: {
    VFacebookLogin,
  },
  methods: {
    logged(e) {
      console.log("LOGEADO:", e);
    },
  },
};
</script>