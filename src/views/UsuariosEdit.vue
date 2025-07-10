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
                <span class="body-1 font-weight-bold">Compañia</span>
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
                <v-col cols="12">
                  <p class="body-1 font-weight-bold mb-0">
                    Grupos de Chat Asignados
                  </p>
                  <VSelectWithValidation
                    v-model="selectedChatGroups"
                    :items="chatGroups"
                    item-text="name"
                    item-value="_id"
                    placeholder="Seleccionar Grupos"
                    multiple
                    clearable
                    chips
                  />
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
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
              <template>
                <v-row
                  v-for="(chatGroup, index) in user.chatGroups"
                  :key="index"
                >
                  <v-col cols="4">
                    <p class="body-1 font-weight-bold mb-0">Nombre de Grupo</p>
                    <VSelectWithValidation
                      :items="chatGroupsForSelect"
                      item-text="name"
                      item-value="_id"
                      v-model="chatGroup._id"
                      @change="
                        (chatGroupId) =>
                          onChatGroupSelected(chatGroup, chatGroupId, index)
                      "
                      label="Seleccione un Grupo"
                    />
                  </v-col>
                  <v-col cols="7">
                    <p class="body-1 font-weight-bold mb-0">Lista de Chats</p>
                    <VSelectWithValidation
                      :items="botOptions"
                      v-model="chatGroup.botIds"
                      item-text="text"
                      item-value="value"
                      clearable
                      multiple
                      chips
                    />
                  </v-col>
                  <v-col cols="1" class="d-flex align-center">
                    <v-btn icon color="error" @click="removechatGroup(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="d-flex justify-center">
                    <v-btn color="primary" @click="addBotGroup">
                      <v-icon left>mdi-plus</v-icon> Agregar Nueva Lista de
                      Chats
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
    <v-dialog v-model="chatGroupDialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Nuevo Grupo de Chat</span>
        </v-card-title>
        <v-card-text>
          <ValidationObserver ref="obsNewChatGroup" v-slot="{ passes }">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <VTextFieldWithValidation
                    rules="required"
                    v-model="newChatGroup.name"
                    label="Nombre del Grupo"
                  />
                </v-col>
              </v-row>
            </v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="chatGroupDialog = false"
                >Cancelar</v-btn
              >
              <v-btn
                color="blue darken-1"
                text
                @click="passes(createNewChatGroup)"
                >Guardar</v-btn
              >
            </v-card-actions>
          </ValidationObserver>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="editChatGroupDialog" max-width="500px">
      <v-card>
        <v-card-title>Editar Grupo de Chat</v-card-title>
        <v-card-text>
          <ValidationObserver ref="obsEditChatGroup" v-slot="{ passes }">
            <v-container>
              <v-row>
                <v-col cols="12">
                  <VTextFieldWithValidation
                    rules="required"
                    v-model="editChatGroup.name"
                    label="Nombre del Grupo"
                  />
                </v-col>
                <v-col cols="12">
                  <VSelectWithValidation
                    v-model="editChatGroup.botIds"
                    :items="bots"
                    item-text="name"
                    item-value="_id"
                    label="Bots"
                    multiple
                    chips
                  />
                </v-col>
              </v-row>
            </v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text color="primary" @click="editChatGroupDialog = false"
                >Cancelar</v-btn
              >
              <v-btn text color="success" @click="passes(saveEditChatGroup)"
                >Guardar</v-btn
              >
            </v-card-actions>
          </ValidationObserver>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteChatGroupDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">¿Eliminar grupo de chat?</v-card-title>
        <v-card-text
          >¿Estás seguro de que deseas eliminar este grupo de chat?</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="primary" @click="deleteChatGroupDialog = false"
            >Cancelar</v-btn
          >
          <v-btn text color="error" @click="confirmDeleteChatGroup"
            >Eliminar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        chatGroupId: null,
        botIds: [],
      },
      chatGroups: [],
      selectedChatGroups: [],
      chatGroupDialog: false,
      newChatGroup: {
        name: "",
        botIds: [],
        userIds: [],
        companies: [],
      },
      allBots: [],
      allUsers: [],
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
      editChatGroupDialog: false,
      deleteChatGroupDialog: false,
      editChatGroup: {},
      deleteChatGroup: {},
    };
  },
  created() {
    this.initialData();
  },
  methods: {
    async initialData() {
      const userPromise = this.$store.dispatch("usersModule/listOne", {
        id: this.$route.params.id,
        query: { chatsPermissions: true },
      });

      const companiesPromise = this.$store.dispatch("companiesModule/list");
      const chatGroupsPromise = this.$store.dispatch("chatGroupsModule/list");

      const [user] = await Promise.all([
        userPromise,
        companiesPromise,
        chatGroupsPromise,
      ]);

      this.companies = this.$deepCopy(
        this.$store.state.companiesModule.companies
      );
      this.chatGroups = this.$deepCopy(
        this.$store.state.chatGroupsModule.chatGroups
      );

      if (!user.chatsPermissions) {
        Object.assign(user, {
          chatsPermissions: {
            platforms: [],
            assigned: null,
            status: [],
          },
        });
      }
      this.user = user;
      if (this.user.chatGroups) {
        this.selectedChatGroups = this.user.chatGroups.map((g) => g._id);
        // Transform chatGroups botIds from objects to IDs if they are populated
        this.user.chatGroups = this.user.chatGroups.map((group) => ({
          ...group,
          botIds: Array.isArray(group.botIds)
            ? group.botIds.map((bot) =>
                typeof bot === "object" ? bot._id : bot
              )
            : [],
        }));
      }
      this.selectedCompanies = this.user.corporation.companies.map(
        (c) => c.company
      );
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
      this.botOptions = this.bots
        .filter((bot) => bot.platform === "whatsapp_automated")
        .map((bot) => ({
          text: bot.name,
          value: bot._id,
        }));
    },
    // Watch for changes in selectedCompanies to update bots
    async onSelectedCompaniesChange(selectedChatPermissionCompanies) {
      await this.fetchBots(selectedChatPermissionCompanies);
    },
    onChatGroupSelected(chatGroup, chatGroupId, index) {
      if (chatGroupId === "CREATE_NEW") {
        this.openCreateChatGroupDialog().then((newGroup) => {
          if (newGroup) {
            const newGroupData = this.chatGroups.find(
              (cg) => cg._id === newGroup._id
            );
            if (newGroupData) {
              this.user.chatGroups.splice(
                index,
                1,
                this.$deepCopy(newGroupData)
              );
              if (!this.selectedChatGroups.includes(newGroup._id)) {
                this.selectedChatGroups.push(newGroup._id);
              }
            }
          } else {
            this.user.chatGroups[index]._id = null;
          }
        });
        return;
      }
      const selectedFullGroup = this.chatGroups.find(
        (g) => g._id === chatGroupId
      );

      if (selectedFullGroup) {
        // Ensure botIds are just IDs, not populated objects
        const botIds = Array.isArray(selectedFullGroup.botIds)
          ? selectedFullGroup.botIds.map((bot) =>
              typeof bot === "object" ? bot._id : bot
            )
          : [];

        const updatedGroup = {
          ...this.user.chatGroups[index],
          _id: chatGroupId,
          botIds: [...botIds],
        };
        this.user.chatGroups.splice(index, 1, updatedGroup);
      }
    },
    removechatGroup(index) {
      this.user.chatGroups.splice(index, 1);
    },
    openCreateChatGroupDialog() {
      return new Promise((resolve) => {
        // reset form
        this.newChatGroup = {
          name: "",
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
          userIds: [this.user._id],
          botIds: [],
        };

        this.resolveCreateChatGroup = resolve;
        this.chatGroupDialog = true;
      });
    },
    // Add a new bot group to the list
    addBotGroup() {
      if (!this.user.chatGroups) {
        this.user.chatGroups = [];
      }
      this.user.chatGroups.push({
        _id: null,
        botIds: [],
      });
    },
    async createNewChatGroup() {
      const newGroup = await this.$store.dispatch(
        "chatGroupsModule/create",
        this.newChatGroup
      );
      this.chatGroupDialog = false;
      await this.$store.dispatch("chatGroupsModule/list");
      this.chatGroups = this.$deepCopy(
        this.$store.state.chatGroupsModule.chatGroups
      );
      if (this.resolveCreateChatGroup) {
        this.resolveCreateChatGroup(newGroup);
      }
    },
    async save() {
      this.loadingButton = true;
      let itemId = this.user._id;
      this.user.companies = this.selectedCompanies.map((c) => {
        return {
          company: {
            _id: c,
          },
        };
      });
      this.user.chatGroups = this.selectedChatGroups;
      await this.$store.dispatch("usersModule/update", {
        id: itemId,
        data: this.user,
      });
    },
    async updateUser() {
      try {
        this.$store.commit("loadingModule/showLoading", true);

        const userToUpdate = JSON.parse(JSON.stringify(this.user));

        userToUpdate.corporation.companies = this.selectedCompanies.map(
          (c) => ({
            company: {
              _id: c,
            },
          })
        );

        userToUpdate.chatGroups = this.user.chatGroups
          .map((cg) => cg._id)
          .filter((id) => id);

        const userUpdatePromise = this.$store.dispatch("usersModule/update", {
          id: userToUpdate._id,
          data: userToUpdate,
        });

        const chatGroupUpdatePromises = this.user.chatGroups.map(
          (chatGroup) => {
            if (chatGroup._id) {
              return this.$store.dispatch("chatGroupsModule/update", {
                id: chatGroup._id,
                data: {
                  botIds: chatGroup.botIds,
                },
              });
            }
            return Promise.resolve();
          }
        );

        await Promise.all([userUpdatePromise, ...chatGroupUpdatePromises]);

        this.$store.commit(
          "successModule/showSuccess",
          "Usuario y grupos de chat actualizados correctamente"
        );

        await this.initialData();
      } catch (error) {
        handleError(error, this.$store.commit);
      } finally {
        this.$store.commit("loadingModule/showLoading", false);
      }
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
    getBotName(botId) {
      const bot = this.bots.find((b) => b._id === botId);
      return bot ? bot.name : botId;
    },
    openEditChatGroupDialog(group) {
      this.editChatGroup = { ...group };
      this.editChatGroupDialog = true;
    },
    async saveEditChatGroup() {
      await this.$store.dispatch("chatGroupsModule/update", {
        id: this.editChatGroup._id,
        data: this.editChatGroup,
      });
      this.editChatGroupDialog = false;
      await this.initialData();
    },
    openDeleteChatGroupDialog(group) {
      this.deleteChatGroup = group;
      this.deleteChatGroupDialog = true;
    },
    async confirmDeleteChatGroup() {
      await this.$store.dispatch(
        "chatGroupsModule/remove",
        this.deleteChatGroup._id
      );
      this.deleteChatGroupDialog = false;
      await this.initialData();
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
      return this.user?.chatsPermissions?.companies.map((c) => c._id) || [];
    },
    chatGroupsForSelect() {
      return [
        ...this.chatGroups,
        { name: "Crear nuevo grupo...", _id: "CREATE_NEW" },
      ];
    },
  },
  watch: {},
};
</script>

<style lang="scss" scoped></style>
