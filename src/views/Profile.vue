<template>
  <v-container fluid>
    <v-row justify="center">
      <material-card
        width="800px"
        icon="mdi-account"
        color="primary"
        title="Perfil"
      >
        <ValidationObserver ref="obs">
          <v-form>
            <v-container class="pa-5">
              <v-row dense>
                <v-col cols="12" sm="12">
                  <v-container fluid>
                    <v-row dense>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Nombres</p>
                        <VTextFieldWithValidation
                          rules="required"
                          v-model="user.first_name"
                          label="Nombres"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Apellidos</p>
                        <VTextFieldWithValidation
                          rules="required"
                          v-model="user.last_name"
                          label="Apellidos"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Alias</p>
                        <VTextFieldWithValidation
                          rules=""
                          v-model="user.alias"
                          label="Alias"
                        />
                      </v-col>
                      <!-- <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Roles</p>
                        <VTextFieldWithValidation
                          :disabled="true"
                          rules="required"
                          :value="roles()"
                          label="Roles"
                        />
                      </v-col> -->
                    </v-row>
                    <v-row>
                      <div class="flex-grow-1"></div>
                      <v-btn color="success" @click="save">Guardar</v-btn>
                    </v-row>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </ValidationObserver>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
// import api from "@/services/api/users";
// import { handleError } from "@/utils/utils.js";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
  },
  data() {
    return {
      newPassword: "",
      user: {},
    };
  },
  mounted() {
    this.initialData();
  },
  methods: {
    async initialData() {
      this.user = await this.$store.dispatch(
        "usersModule/listOne",
        this.$store.state.authModule.user._id
      );
      console.log("🚀 Aqui *** -> this.user", this.user);
      console.log(this.user);
    },
    async save() {
      this.loadingButton = true;
      let itemId = this.$store.state.authModule.user._id;
      await this.$store.dispatch("usersModule/update", {
        id: itemId,
        data: this.user,
      });
    },
  },
  computed: {
    countries() {
      return this.$store.state.countries;
    },
    cities() {
      return this.$store.state.cities;
    },
    status() {
      return this.user.status ? "Activo" : "Inactivo";
    },
  },
};
</script>

<style lang="scss" scoped></style>
