<template>
  <v-container fluid>
    <v-row justify="center">
      <material-card
        width="800px"
        icon="mdi-account"
        color="primary"
        title="Perfil de Usuario"
        text="Ajustes propios del panel de administración"
      >
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-form>
            <v-container class="pa-5">
              <v-row dense>
                <v-col cols="12" sm="12">
                  <v-container fluid>
                    <h3>Detalles del usuario</h3>
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
                        <p class="body-1 font-weight-bold mb-0">Celular</p>
                        <VTextFieldWithValidation
                          :rules="{
                            required: false,
                            decimal: true,
                          }"
                          v-model="user.phone_number"
                          label="+51982745576"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">País</p>
                        <VSelectWithValidation
                          rules=""
                          :items="countries"
                          v-model="user.country"
                          label="Selecciona país"
                          itemText="name"
                          itemValue="_id"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <p class="body-1 font-weight-bold mb-0">Ciudad</p>
                        <VSelectWithValidation
                          rules=""
                          :items="cities"
                          v-model="user.city"
                          label="Selecciona una ciudad"
                          itemText="name"
                          itemValue="_id"
                        />
                      </v-col>
                      <v-col cols="12" sm="6" md="6" >
                        <p class="body-1 font-weight-bold mb-0">Estado</p>
                         <v-switch
                          v-model="user.status"
                          inset
                          :label="status"
                        ></v-switch>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="success" @click="passes(updateUser)">Guardar</v-btn>
            </v-card-actions>
          </v-form>
        </ValidationObserver>
      </material-card>
    </v-row>
    <v-row justify="center">
      <material-card
        width="800px"
        icon="mdi-lock-check"
        color="primary"
        title="Actualizar Contraseña"
      >
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-form>
            <v-container>
              <v-row justify="space-between">
                <v-col cols="12" sm="8">
                  <VTextFieldWithValidation
                    rules="required"
                    v-model="newPassword"
                    label="Ingresa una nueva contraseña"
                    type="password"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn block color="success" @click="passes(updatePassword)"
                    >Guardar</v-btn
                  >
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
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation";
import MaterialCard from "@/components/material/Card";
import api from "@/services/api/users";
import { handleError } from "@/utils/utils.js";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    VSelectWithValidation,
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
          this.$route.params.id
        );
    },
    updateUser() {
      console.log(this.user);
      this.$store.dispatch("usersModule/update", {
        id: this.user._id,
        data: this.user,
      });
     console.log(this.user);

    },
    updatePassword() {
      return new Promise((resolve, reject) => {
        this.$store.commit("loadingModule/showLoading");
        api
          .updatePassword(this.user._id, this.newPassword)
          .then((res) => {
            let msg = res.data.message;
            this.$store.commit("successModule/showSuccess", msg);
          })
          .catch((err) => {
            handleError(err, this.$store.commit, reject);
          })
          .finally(() =>
            this.$store.commit("loadingModule/showLoading", false)
          );
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
    status () {
      return  this.user.status ? "Activo" : "Inactivo";  
    }
  },
};
</script>

<style lang="scss" scoped></style>
