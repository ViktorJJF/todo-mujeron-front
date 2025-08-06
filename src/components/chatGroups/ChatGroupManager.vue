<template>
  <div class="chat-group-manager">
    <v-container>
      <v-row>
        <v-col cols="12" class="d-flex align-center mb-4">
          <v-spacer></v-spacer>
          <v-btn color="primary" small @click="createGroup">
            <v-icon left>mdi-plus</v-icon>
            Nuevo Grupo
          </v-btn>
        </v-col>
      </v-row>
        <div v-if="!chatGroups.length" class="text-center py-6">
          <v-icon size="48" color="grey lighten-2">mdi-account-group-outline</v-icon>
          <p class="mt-3 grey--text">No hay grupos creados</p>
          <v-btn color="primary" @click="createGroup">Crear Grupo</v-btn>
        </div>

        <v-list v-else>
          <v-expansion-panels>
            <v-expansion-panel v-for="group in chatGroups" :key="group._id">
              <v-expansion-panel-header>
                <div class="d-flex align-center justify-space-between w-100">
                  <div>
                    <div class="font-weight-medium">{{ group.name }}</div>
                    <div class="caption grey--text">
                      {{ getGroupUsers(group).length }} usuarios
                    </div>
                  </div>
                  <v-menu bottom left>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn icon small v-bind="attrs" v-on="on" @click.stop>
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list dense>
                      <v-list-item @click="editGroup(group)">
                        <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
                        <v-list-item-content>Editar</v-list-item-content>
                      </v-list-item>
                      <v-list-item @click="deleteGroup(group)">
                        <v-list-item-icon><v-icon color="error">mdi-delete</v-icon></v-list-item-icon>
                        <v-list-item-content>Eliminar</v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-expansion-panel-header>
              
              <v-expansion-panel-content>
                <!-- Users Section -->
                <div class="mb-4">
                  <div class="d-flex align-center mb-2">
                    <v-icon small class="mr-2">mdi-account-multiple</v-icon>
                    <span class="subtitle-2">Usuarios</span>
                    <v-spacer></v-spacer>
                    <v-btn x-small color="primary" @click="openAddUserDialog(group)">
                      <v-icon small>mdi-plus</v-icon>
                      Agregar
                    </v-btn>
                  </div>
                  
                  <div v-if="getGroupUsers(group).length === 0" class="text-center py-3 grey--text">
                    No hay usuarios en este grupo
                  </div>
                  
                  <div v-else class="d-flex flex-wrap">
                    <v-chip
                      v-for="user in getGroupUsers(group)"
                      :key="user._id"
                      small
                      class="ma-1"
                      color="blue lighten-4"
                      close
                      @click:close="removeUserFromGroup(group, user)"
                    >
                      <v-avatar left x-small>
                        <v-icon x-small>mdi-account</v-icon>
                      </v-avatar>
                      {{ user.first_name }} {{ user.last_name }}
                    </v-chip>
                  </div>
                </div>
                
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-list>
      </v-container>

    <!-- Simple Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title>{{ editingGroup ? 'Editar' : 'Crear' }} Grupo</v-card-title>
        <v-card-text>
          <VTextFieldWithValidation
            v-model="groupName"
            label="Nombre del grupo"
            rules="required"
            :disabled="loading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog" :disabled="loading">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="saveGroup">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Simple Add User Dialog -->
    <v-dialog v-model="userDialog" max-width="400px">
      <v-card>
        <v-card-title>Agregar Usuario</v-card-title>
        <v-card-text>
          <v-combobox
            v-model="selectedUserId"
            :items="availableUsers"
            item-text="displayName"
            item-value="_id"
            label="Buscar y seleccionar usuario"
            :disabled="loading"
            clearable
            searchable
            :filter="filterUsers"
            return-object
            @change="onUserSelected"
          >
            <template v-slot:selection="{ item }">
              <span>{{ item.displayName }}</span>
            </template>
            <template v-slot:item="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="24" class="mr-2">
                  <v-icon small>mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.first_name }} {{ item.last_name }}</div>
                  <div class="caption grey--text">{{ item.email }}</div>
                </div>
              </div>
            </template>
          </v-combobox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeUserDialog" :disabled="loading">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="addUser" :disabled="!selectedUserId">Agregar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Simple Add Bot Dialog -->
    <v-dialog v-model="botDialog" max-width="400px">
      <v-card>
        <v-card-title>Agregar Bot</v-card-title>
        <v-card-text>
          <VSelectWithValidation
            v-model="selectedBotId"
            :items="availableBots"
            item-text="name"
            item-value="_id"
            label="Seleccionar bot"
            :disabled="loading"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeBotDialog" :disabled="loading">Cancelar</v-btn>
          <v-btn color="primary" :loading="loading" @click="addBot">Agregar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog" max-width="350px">
      <v-card>
        <v-card-title>¿Eliminar grupo?</v-card-title>
        <v-card-text>¿Estás seguro de eliminar "{{ groupToDelete?.name }}"?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDeleteDialog" :disabled="loading">Cancelar</v-btn>
          <v-btn color="error" :loading="loading" @click="confirmDelete">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation";
import { handleError } from "@/utils/utils.js";

export default {
  name: "ChatGroupManager",
  components: {
    VTextFieldWithValidation,
    VSelectWithValidation,
  },
  data() {
    return {
      loading: false,
      
      // Group management
      dialog: false,
      editingGroup: null,
      groupName: "",
      
      // User management
      userDialog: false,
      selectedUserId: null,
      currentGroup: null,
      
      // Bot management
      botDialog: false,
      selectedBotId: null,
      
      // Delete confirmation
      deleteDialog: false,
      groupToDelete: null,
      
      // Data
      users: [],
      bots: [],
    };
  },
  computed: {
    chatGroups() {
      return this.$store.state.chatGroupsModule.chatGroups || [];
    },
    availableUsers() {
      if (!this.currentGroup) return [];
      return this.users
        .filter(user => !this.currentGroup.userIds?.includes(user._id))
        .map(user => ({
          ...user,
          displayName: `${user.first_name} ${user.last_name}`
        }));
    },
    availableBots() {
      if (!this.currentGroup) return [];
      return this.bots.filter(bot => !this.currentGroup.botIds?.includes(bot._id));
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      await Promise.all([
        this.loadChatGroups(),
        this.loadUsers(),
        this.loadBots(),
      ]);
    },
    
    async loadChatGroups() {
      try {
        await this.$store.dispatch("chatGroupsModule/list");
      } catch (error) {
        handleError(error, this.$store.commit);
      }
    },
    
    async loadUsers() {
      try {
        await this.$store.dispatch("usersModule/list");
        this.users = this.$store.state.usersModule.users || [];
      } catch (error) {
        handleError(error, this.$store.commit);
      }
    },
    
    async loadBots() {
      try {
        await this.$store.dispatch("botsModule/list");
        this.bots = this.$store.state.botsModule.bots || [];
      } catch (error) {
        handleError(error, this.$store.commit);
      }
    },
    
    // Group CRUD
    createGroup() {
      this.editingGroup = null;
      this.groupName = "";
      this.dialog = true;
    },
    
    editGroup(group) {
      this.editingGroup = group;
      this.groupName = group.name;
      this.dialog = true;
    },
    
    closeDialog() {
      this.dialog = false;
      this.editingGroup = null;
      this.groupName = "";
    },
    
    async saveGroup() {
      if (!this.groupName.trim()) return;
      
      this.loading = true;
      
      try {
        const groupData = {
          name: this.groupName.trim(),
          companies: [this.$store.getters["authModule/getCurrentCompany"]?.company?._id],
          userIds: [],
          botIds: [],
        };
        
        if (this.editingGroup) {
          await this.$store.dispatch("chatGroupsModule/update", {
            id: this.editingGroup._id,
            data: { name: this.groupName.trim() }
          });
        } else {
          await this.$store.dispatch("chatGroupsModule/create", groupData);
        }
        
        this.closeDialog();
        this.$store.commit("successModule/showSuccess", 
          this.editingGroup ? "Grupo actualizado" : "Grupo creado"
        );
      } catch (error) {
        handleError(error, this.$store.commit);
      } finally {
        this.loading = false;
      }
    },
    
    deleteGroup(group) {
      this.groupToDelete = group;
      this.deleteDialog = true;
    },
    
    closeDeleteDialog() {
      this.deleteDialog = false;
      this.groupToDelete = null;
    },
    
    async confirmDelete() {
      if (!this.groupToDelete) return;
      
      this.loading = true;
      
      try {
        await this.$store.dispatch("chatGroupsModule/remove", this.groupToDelete._id);
        this.closeDeleteDialog();
        this.$store.commit("successModule/showSuccess", "Grupo eliminado");
      } catch (error) {
        handleError(error, this.$store.commit);
      } finally {
        this.loading = false;
      }
    },
    
    // User management
    openAddUserDialog(group) {
      this.currentGroup = group;
      this.selectedUserId = null;
      this.userDialog = true;
    },
    
    closeUserDialog() {
      this.userDialog = false;
      this.currentGroup = null;
      this.selectedUserId = null;
    },
    
    async addUser() {
      if (!this.selectedUserId || !this.currentGroup) return;
      
      this.loading = true;
      
      try {
        const userId = typeof this.selectedUserId === 'object' ? this.selectedUserId._id : this.selectedUserId;
        const updatedUserIds = [...(this.currentGroup.userIds || []), userId];
        await this.$store.dispatch("chatGroupsModule/update", {
          id: this.currentGroup._id,
          data: { userIds: updatedUserIds }
        });
        
        this.closeUserDialog();
        this.$store.commit("successModule/showSuccess", "Usuario agregado");
      } catch (error) {
        handleError(error, this.$store.commit);
      } finally {
        this.loading = false;
      }
    },
    
    onUserSelected() {
      // Handle user selection
    },
    
    filterUsers(item, queryText) {
      const text = queryText.toLowerCase();
      const firstName = item.first_name ? item.first_name.toLowerCase() : '';
      const lastName = item.last_name ? item.last_name.toLowerCase() : '';
      const email = item.email ? item.email.toLowerCase() : '';
      
      return firstName.includes(text) || 
             lastName.includes(text) || 
             email.includes(text);
    },
    
    async removeUserFromGroup(group, userId) {
      this.loading = true;
      
      try {
        // Handle both object and string IDs
        const userIdToRemove = typeof userId === 'object' ? userId._id : userId;
        const updatedUserIds = (group.userIds || []).filter(id => {
          const currentId = typeof id === 'object' ? id._id : id;
          return currentId !== userIdToRemove;
        });
        
        await this.$store.dispatch("chatGroupsModule/update", {
          id: group._id,
          data: { userIds: updatedUserIds }
        });
        
        this.$store.commit("successModule/showSuccess", "Usuario removido");
      } catch (error) {
        handleError(error, this.$store.commit);
      } finally {
        this.loading = false;
      }
    },
    
    // Bot management
    openAddBotDialog(group) {
      this.currentGroup = group;
      this.selectedBotId = null;
      this.botDialog = true;
    },
    
    closeBotDialog() {
      this.botDialog = false;
      this.currentGroup = null;
      this.selectedBotId = null;
    },
    
    async addBot() {
      if (!this.selectedBotId || !this.currentGroup) return;
      
      this.loading = true;
      
      try {
        const updatedBotIds = [...(this.currentGroup.botIds || []), this.selectedBotId];
        await this.$store.dispatch("chatGroupsModule/update", {
          id: this.currentGroup._id,
          data: { botIds: updatedBotIds }
        });
        
        this.closeBotDialog();
        this.$store.commit("successModule/showSuccess", "Bot agregado");
      } catch (error) {
        handleError(error, this.$store.commit);
      } finally {
        this.loading = false;
      }
    },
    
    async removeBotFromGroup(group, botId) {
      this.loading = true;
      
      try {
        // Handle both object and string IDs
        const botIdToRemove = typeof botId === 'object' ? botId._id : botId;
        const updatedBotIds = (group.botIds || []).filter(id => {
          const currentId = typeof id === 'object' ? id._id : id;
          return currentId !== botIdToRemove;
        });
        
        await this.$store.dispatch("chatGroupsModule/update", {
          id: group._id,
          data: { botIds: updatedBotIds }
        });
        
        this.$store.commit("successModule/showSuccess", "Bot removido");
      } catch (error) {
        handleError(error, this.$store.commit);
      } finally {
        this.loading = false;
      }
    },
    
    // Helper methods
    getGroupUsers(group) {
      if (!group.userIds || !Array.isArray(group.userIds)) return [];
      
      return group.userIds.map(userId => {
        if (typeof userId === 'object' && userId._id) {
          return userId;
        }
        return this.users.find(user => user._id === userId);
      }).filter(Boolean);
    },
    
    getGroupBots(group) {
      if (!group.botIds || !Array.isArray(group.botIds)) return [];
      
      return group.botIds.map(botId => {
        if (typeof botId === 'object' && botId._id) {
          return botId;
        }
        return this.bots.find(bot => bot._id === botId);
      }).filter(Boolean);
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-group-manager {
  .v-list-item {
    border-radius: 8px;
    margin-bottom: 8px;
    
    &:hover {
      background-color: #f5f5f5;
    }
  }
}
</style>