<template>
  <v-container fluid>
    <v-row justify="center">
      <material-card
        icon="mdi-cellphone-dock"
        color="primary"
        :title="$t(entity + '.TITLE')"
        :text="$t(entity + '.SUBTITLE')"
      >
        <v-col cols="12" sm="12">
          <v-sheet max-width="700">
            <v-slide-group
              @change="
                selectedPlatforms = selectedPlatformsIndexes.map(
                  (index) => $store.state.platforms[index]
                );
                initialize();
              "
              v-model="selectedPlatformsIndexes"
              :multiple="true"
              show-arrows
            >
              <v-slide-item
                v-for="platform in $store.state.platforms"
                :key="platform"
                v-slot="{ active, toggle }"
              >
                <v-btn
                  class="mx-2"
                  :input-value="active"
                  active-class="purple white--text"
                  depressed
                  rounded
                  @click="toggle"
                >
                  {{ platform }}
                </v-btn>
              </v-slide-item>
            </v-slide-group>
          </v-sheet>
        </v-col>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > items.length
                ? $store.state.llmTrackerModule.total
                : $store.state.itemsPerPage
            }}
            de {{ $store.state.llmTrackerModule.total }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            v-model="page"
            :length="$store.state.llmTrackerModule.totalPages"
            @input="initialize(page)"
          ></v-pagination>
        </div>
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="items"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <!-- <span class="font-weight-bold"
                >Filtrar por nombre: {{ search }}</span
              > -->
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Busca algo"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="700px">
                    <v-card>
                      <v-card-title>
                        <v-icon color="primary" class="mr-1">Prompt</v-icon>
                        <span class="headline">Prompt</span>
                      </v-card-title>
                      <v-divider></v-divider>
                      <v-container class="pa-5">
                        <v-row dense class="openai-prompt">
                          {{ editedItem.prompt }}
                        </v-row>
                      </v-container>
                      <v-card-actions rd-actions>
                        <v-btn color="primary" @click="dialog = false"
                          >Listo</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
              <!-- <span class="font-weight-bold">Ordenar por</span
              ><v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    outlined
                    dense
                    :items="headers"
                    name="text"
                  ></v-select>
                </v-col>
              </v-row> -->
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
              v-if="rolPermisos['Edit']"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
            <v-btn
              color="error"
              fab
              small
              dark
              @click="deleteItem(item)"
              v-if="rolPermisos['Delete']"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true">{{
              $t("users.NO_DATA")
            }}</v-alert>
          </template>
          <template v-slot:[`item.description`]="{ item }"
            ><span class="format-breaklines">
              {{ item.description }}
            </span></template
          >
          <template v-slot:[`item.user`]="{ item }">
            <div v-if="!item.leadId">
              {{ extractUserNameFromPrompt(item.prompt) }}
            </div>
            <div v-else>
              <div
                style="cursor: pointer; color: blue; text-decoration: underline;"
                @click.stop="
                  chatDialog = true;
                  selectedLead = item;
                  getLeadChat(item.leadId._id, item.platform);
                "
              >
                {{ extractUserNameFromPrompt(item.prompt) }}
              </div>
            </div>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">{{
            item.createdAt | formatDate
          }}</template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status" color="success">Activo</v-chip>
            <v-chip v-else color="error">Inactivo</v-chip>
          </template>
          <template v-slot:[`item.postUrl`]="{ item }">
            <a :href="item.postUrl" target="_blank">Visitar post</a>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > items.length
                ? $store.state.llmTrackerModule.total
                : $store.state.itemsPerPage
            }}
            de {{ $store.state.llmTrackerModule.total }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            v-model="page"
            :length="$store.state.llmTrackerModule.totalPages"
            @input="initialize(page)"
          ></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog
      v-if="chatDialog"
      v-model="chatDialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn
            icon
            dark
            @click="
              selectedLead = null;
              selectedChatId = null;
              chatDialog = false;
              noChat = false;
            "
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title
            >Chat en vivo con
            {{ selectedLead.appName || selectedLead.nombre }}</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              dark
              text
              @click="
                selectedLead = null;
                selectedChatId = null;
                chatDialog = false;
                noChat = false;
              "
            >
              Finalizar
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <div>
          <!-- chat iframe content -->
          <iframe
            v-if="selectedChatId"
            :src="
              `${
                getEnvironment === 'local'
                  ? 'http://localhost:3030'
                  : getEnvironment === 'development'
                  ? 'https://dev.chat.todofull.club'
                  : 'https://chat.todofull.club'
              }/apps/chat?chatId=${selectedChatId}&isChatOneToOne=true`
            "
            width="100%"
            height="100%"
            frameborder="0"
            scrolling="no"
            style="height: 100vh;"
          ></iframe>
          <h3 v-else-if="!noChat">Cargando...</h3>
          <h3 v-if="noChat">Sin chat</h3>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
const ENTITY = "llmTracker"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import chatService from "@/services/api/chats";
import { es } from "date-fns/locale";

export default {
  components: {
    MaterialCard,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    selectedPlatformsIndexes: [],
    selectedPlatforms: [],
    selectedChatId: null,
    noChat: false,
    chatDialog: null,
    selectedLead: null,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    fieldsToSearch: ["postUrl", "response", "query"],
    dialog: false,
    headers: [
      {
        text: "Fecha",
        align: "left",
        sortable: false,
        value: "createdAt",
      },
      {
        text: "Usuario",
        align: "left",
        sortable: false,
        value: "user",
      },
      {
        text: "Input",
        align: "left",
        sortable: false,
        value: "query",
      },
      {
        text: "Respuesta",
        align: "left",
        sortable: false,
        value: "response",
      },
      {
        text: "Plataforma",
        align: "left",
        sortable: false,
        value: "platform",
      },
      {
        text: "Post",
        align: "left",
        sortable: false,
        value: "postUrl",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    [ENTITY]: [],
    editedIndex: -1,
    editedItem: CLASS_ITEMS(),
    defaultItem: CLASS_ITEMS(),
    menu1: false,
    menu2: false,
    rolPermisos: {},
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t(this.entity + ".NEW_ITEM")
        : this.$t(this.entity + ".EDIT_ITEM");
    },
    items() {
      return this[ENTITY];
    },
    entity() {
      return ENTITY;
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.initialize(this.page);
      }, 600);
    },
  },
  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.initialize();
    this.rolAuth();
  },
  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/Propiedades/Genial",
          model: "Marcas",
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize(page = 1) {
      //llamada asincrona de items
      let payload = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: "createdAt",
        order: "desc",
        companies: [this.$store.getters["authModule/getCurrentCompany"].company._id],
      };
      if (this.selectedPlatforms.length > 0) {
        payload.platforms = this.selectedPlatforms;
      }
      await Promise.allSettled([
        this.$store.dispatch("botsModule/list", payload),
        this.$store.dispatch(ENTITY + "Module/list", payload),
      ]);
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      );
    },
    editItem(item) {
      this.editedIndex = this[ENTITY].indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async deleteItem(item) {
      const index = this[ENTITY].indexOf(item);
      let itemId = this[ENTITY][index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("llmTrackerModule/delete", itemId);
        this[ENTITY].splice(index, 1);
      }
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    async save() {
      this.loadingButton = true;
      if (this.editedIndex > -1) {
        let itemId = this[ENTITY][this.editedIndex]._id;
        try {
          await this.$store.dispatch(ENTITY + "Module/update", {
            id: itemId,
            data: this.editedItem,
          });
          Object.assign(this[ENTITY][this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          let newItem = await this.$store.dispatch(
            ENTITY + "Module/create",
            this.editedItem
          );
          this[ENTITY].push(newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },
    extractUserNameFromPrompt(prompt) {
      // code to extract string between "Nombre del usuario" and "\n \n"
      let name = prompt.match(/Nombre del usuario: (.*)\n/);
      return name ? name[1] : "Sin nombre";
    },
    async getLeadChat(id, platform) {
      console.log("🐞 LOG HERE id lead chat:", id);
      try {
        const chats = (await chatService.getAllByLeadId(id, platform)).data
          .payload;
        if (chats.length > 0) {
          this.selectedChatId = chats[0]._id;
        } else {
          this.noChat = true;
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
