<template>
  <v-container fluid v-if="user">
    <v-row justify="center">
      <material-card
        width="800px"
        icon="mdi-account"
        color="primary"
        title="Perfil de Usuario"
        text="Ajustes propios del panel de administración"
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
    <v-row justify="center">
      <material-card
        width="800px"
        icon="mdi-lock-check"
        color="primary"
        title="Permisos del Chat"
      >
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-form>
            <v-container>
              <v-row dense>
                <v-col>
                  <p class="body-1 font-weight-bold mb-0">Paises</p>
                  <VSelectWithValidation
                    :items="countries"
                    v-model="user.chatsPermissions.countries"
                    clearable
                    multiple
                    chips
                  />
                </v-col>
                <v-col>
                  <p class="body-1 font-weight-bold mb-0">Asignados</p>
                  <VSelectWithValidation
                    :items="assigned"
                    v-model="user.chatsPermissions.assigned"
                    clearable
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col>
                  <p class="body-1 font-weight-bold mb-0">Redes Sociales</p>
                  <VSelectWithValidation
                    :items="platforms"
                    v-model="user.chatsPermissions.platforms"
                    clearable
                    multiple
                    chips
                  />
                </v-col>
              </v-row>
              <v-row dense>
                <v-col>
                  <p class="body-1 font-weight-bold mb-0">Estados</p>
                  <VSelectWithValidation
                    :items="chatStatus"
                    v-model="user.chatsPermissions.status"
                    clearable
                    multiple
                    chips
                  />
                </v-col>
              </v-row>
              <v-card-actions>
                <div class="flex-grow-1"></div>
                <v-btn color="success" @click="passes(updateUser)"
                  >Guardar</v-btn
                >
              </v-card-actions>
            </v-container>
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
      user: null,
      platforms: [
        { text: "Facebook", value: "facebook" },
        { text: "Instagram", value: "instagram" },
        { text: "Whatsapp", value: "whatsapp" },
      ],
      assigned: [
        { text: "Todos", value: "all" },
        { text: "Sin agente", value: "no-agent" },
      ],
      chatStatus: [
        { text: "Pendientes", value: "pending" },
        { text: "Resueltos", value: "solved" },
        { text: "Sin Bot", value: "no-bot" },
        { text: "Recientes", value: "recents" },
        { text: "Equipo", value: "team" },
      ],
    };
  },
  created() {
    this.initialData();
  },
  methods: {
    async initialData() {
      const user = await this.$store.dispatch("usersModule/listOne", {
        id: this.$route.params.id,
        query: { chatsPermissions: true },
      });

      if (!user.chatsPermissions) {
        Object.assign(user, {
          chatsPermissions: {
            countries: [],
            platforms: [],
            assigned: null,
            status: [],
          },
        });
      }

      this.user = user;
    },
    async save() {
      this.loadingButton = true;
      let itemId = this.user._id;
      await this.$store.dispatch("usersModule/update", {
        id: itemId,
        data: this.user,
      });
    },
    updateUser() {
      console.log(this.user._id);
      this.$store.dispatch("usersModule/update", {
        id: this.user._id,
        data: this.user,
      });
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
    status() {
      return this.user.status ? "Activo" : "Inactivo";
    },
  },
};
</script>

<style lang="scss" scoped></style>
