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
        title="Compañias"
      >
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-form>
            <v-container>
              <v-col cols="12">
                <span class="body-1 font-weight-bold"
                  >Compañia</span>
                <VSelectWithValidation
                  v-model="selectedCompanies"
                  :items="companies"
                  rules="required"
                  item-text="alias"
                  item-value="_id"
                  placeholder="Seleccionar Compañia"
                  multiple
                  clearable
                  chips
                />
              </v-col>
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
        title="Permisos del Chat"
      >
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-form>
            <v-container>
              <v-row dense>
                <v-col>
                  <p class="body-1 font-weight-bold mb-0">Compañias</p>
                  <VSelectWithValidation
                    :items="companies"
                    item-text="alias"
                    item-value="_id"
                    v-model="user.chatsPermissions.companies"
                    @change="onSelectedCompaniesChange"
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
                  <p class="body-1 font-weight-bold mb-0">Grupos de Chats</p>
                  <v-checkbox
                    v-model="user.chatsPermissions.enableBotGroups"
                    label="Habilitar Grupos de Chats"
                  ></v-checkbox>
                </v-col>
              </v-row>
              <template v-if="user.chatsPermissions.enableBotGroups">
                <v-row v-for="(botGroup, index) in user.chatsPermissions.botGroups" :key="index">
                <v-col cols="4">
                  <p class="body-1 font-weight-bold mb-0">Nombre de Grupo</p>
                    <VTextFieldWithValidation
                      rules=""
                      v-model="botGroup.name"
                      label="Nombre de Grupo"
                      maxlength="15"
                    />
                </v-col>
                <v-col cols="7">
                  <p class="body-1 font-weight-bold mb-0">Lista de Chats</p>
                  <VSelectWithValidation
                      :items="botOptions"
                      v-model="botGroup.botIds"
                      item-text="text"
                      item-value="value"
                      clearable
                      multiple
                      chips
                    />
                </v-col>
                <v-col cols="1" class="d-flex align-center">
                  <v-btn
                    icon
                    color="error"
                    @click="removeBotGroup(index)"
                    
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
                <v-row>
                  <v-col cols="12" class="d-flex justify-center">
                    <v-btn color="primary" @click="addBotGroup">
                      <v-icon left>mdi-plus</v-icon> Agregar Nueva Lista de Chats
                    </v-btn>
                  </v-col>
                </v-row>
              </template>
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
      companies: [],
      selectedCompanies: [],
      bots: [], // <- Add bots to data
      botOptions: [],
      emptyBotGroup: {
        name: "",
        botIds: [],
      },
      platforms: [
        { text: "Facebook", value: "facebook" },
        { text: "Instagram", value: "instagram" },
        { text: "Whatsapp", value: "whatsapp" },
        { text: "WhatsApp Many To One ", value: "whatsapp_automated" },
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

      await this.$store.dispatch("companiesModule/list");
      this.companies = this.$deepCopy(
        this.$store.state.companiesModule.companies
      );

      if (!user.chatsPermissions) {
        Object.assign(user, {
          chatsPermissions: {
            platforms: [],
            enableBotGroups: false,
            botGroups: [this.emptyBotGroup],
            assigned: null,
            status: [],
          },
        });
      }
      this.user = user;
      this.selectedCompanies = this.user.corporation.companies.map(c => c.company);
      await this.fetchBots(this.chatPermissionCompanies); // Fetch bots for initial companies
    },
    // Fetch bots using selected companies
    async fetchBots(selectedChatPermissionCompanies = []) {
      if (!selectedChatPermissionCompanies.length) {
        this.bots = [];
        this.botOptions = [];
        return;
      }
      // Get array of company IDs
      await this.$store.dispatch("botsModule/list", {
        companies: selectedChatPermissionCompanies,
      });
      this.bots = this.$store.state.botsModule.bots || [];
      this.botOptions = this.bots.filter(bot => bot.platform === 'whatsapp_automated').map(bot => ({
        text: bot.name,
        value: bot._id
      }));
    },
    // Watch for changes in selectedCompanies to update bots
    async onSelectedCompaniesChange(selectedChatPermissionCompanies) {
      await this.fetchBots(selectedChatPermissionCompanies);
    },
    // Add a new bot group to the list
    addBotGroup() {
      if (!this.user.chatsPermissions.botGroups) {
        this.user.chatsPermissions.botGroups = [this.emptyBotGroup];
      }
      // Create a new empty bot group (deep copy to avoid reference issues)
      const newGroup = JSON.parse(JSON.stringify(this.emptyBotGroup));
      this.user.chatsPermissions.botGroups.push(newGroup);
    },
    // Remove a bot group from the list
    removeBotGroup(index) {
      this.user.chatsPermissions.botGroups.splice(index, 1);
    },
    async save() {
      this.loadingButton = true;
      let itemId = this.user._id;
      this.user.companies = this.selectedCompanies.map(c => {
        return {
          company: {
            _id: c,
          }
        };
      });
      await this.$store.dispatch("usersModule/update", {
        id: itemId,
        data: this.user,
      });
    },
    updateUser() {
      console.log(this.user._id);
      this.user.corporation.companies = this.selectedCompanies.map(c => ({
        company: {
          _id: c,
        }
      }));
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
    cities() {
      return this.$store.state.cities;
    },
    status() {
      return this.user.status ? "Activo" : "Inactivo";
    },
    chatPermissionCompanies() {
      return this.user?.chatsPermissions?.companies.map(c => c._id) || [];
    },
  },
  watch: {
    'user.chatsPermissions.enableBotGroups': function (value) {
      if (!value) {
        this.user.chatsPermissions.botGroups = [this.emptyBotGroup];
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
