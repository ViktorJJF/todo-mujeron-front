<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Bots"
        text="Resumen de Bots"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="bots"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold"
                >Filtrar por nombre: {{ search }}</span
              >
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    dense
                    hide-details
                    v-model="search"
                    append-icon="search"
                    placeholder="Escribe el nomb"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="900px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="primary"
                        dark
                        class="mb-2"
                        v-on="on"
                        v-show="rolPermisos['Write']"
                        >Agregar bot</v-btn
                      >
                      <v-facebook-login
                        :login-options="{
                          scope:
                            'ads_management,instagram_manage_messages,pages_messaging,pages_manage_metadata,instagram_manage_comments,instagram_manage_insights,pages_read_engagement,instagram_basic,pages_show_list,business_management,instagram_content_publish,catalog_management',
                        }"
                        @login="facebookLogged"
                        app-id="309102442977190"
                        class="mb-3"
                      ></v-facebook-login>
                    </template>
                    <v-card>
                      <v-card-title>
                        <v-icon color="primary" class="mr-1">mdi-update</v-icon>
                        <span class="headline">{{ formTitle }}</span>
                      </v-card-title>
                      <v-divider></v-divider>
                      <ValidationObserver ref="obs" v-slot="{ passes }">
                        <v-container class="pa-5">
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <h3 class="mt-1">Datos generales</h3>
                            </v-col>
                          </v-row>

                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Nombre</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Ingresa el nombre del bot"
                              />
                            </v-col>
                          </v-row>
                          <!-- <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Url Webhook</p>
                              <VTextFieldWithValidation rules="" v-model="editedItem.webhookUrl"
                                label="Ingresa el url" />
                            </v-col>
                          </v-row> -->
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Plataforma</p>
                              <v-select
                                :items="platforms"
                                v-model="editedItem.platform"
                                dense
                                hide-details
                                placeholder="Seleccione la plataforma"
                                outlined
                              />
                            </v-col>
                          </v-row>
                          <template v-if="editedItem.platform === 'telegram'">
                            <v-row dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Telegram HTTP Api
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.tgApi"
                                  label="Ingresa el API"
                                />
                              </v-col>
                            </v-row>
                          </template>
                          <template>
                            <v-row
                              dense
                              v-if="
                                editedItem.platform !== 'whatsapp_automated'
                              "
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Nombre Fanpage
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.fanpageName"
                                  label="Ingresa el nombre de la Fanpage"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                editedItem.platform !== 'whatsapp' &&
                                editedItem.platform !== 'whatsapp_automated'
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  URL Fanpage
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.fanpageUrl"
                                  label="Ingresa la url de la fanpage"
                                />
                              </v-col>
                            </v-row>
                            <v-row dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  {{
                                    editedItem.platform !== "whatsapp"
                                      ? "Fanpage ID"
                                      : "ID WhatsApp"
                                  }}
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.fanpageId"
                                  label="Ingresa el ID de la plataforma"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              dense
                              v-if="
                                editedItem.platform !== 'whatsapp_automated'
                              "
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  {{
                                    editedItem.platform !== "whatsapp"
                                      ? "Fanpage Token"
                                      : "Token de usuario Meta"
                                  }}
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.fbPageToken"
                                  label="Ingresa el token de acceso"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                editedItem.platform !== 'whatsapp' &&
                                editedItem.platform !== 'whatsapp_automated'
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Facebook App Secret
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.fbAppSecret"
                                  label="Ingresa el FB App Secret"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                editedItem.platform === 'whatsapp' ||
                                editedItem.platform === 'whatsapp_automated'
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Número WhatsApp
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.phone"
                                  label="Ingresa el número de WhatsApp registrado"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                (editedItem.platform === 'whatsapp' ||
                                  editedItem.platform ===
                                    'whatsapp_automated') &&
                                editedItem.phone
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Tipo de Conversación
                                </p>
                                <v-select
                                  :items="conversationTypes"
                                  v-model="editedItem.conversationType"
                                  dense
                                  hide-details
                                  placeholder="Seleccione el tipo de conversación"
                                  outlined
                                  item-text="text"
                                  item-value="value"
                                  clearable
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                (editedItem.platform === 'whatsapp' ||
                                  editedItem.platform ===
                                    'whatsapp_automated') &&
                                editedItem.phone &&
                                editedItem.conversationType === 'many_to_one'
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Grupo de Conversación
                                </p>
                                <v-select
                                  :items="groups"
                                  v-model="editedItem.groupId"
                                  dense
                                  hide-details
                                  placeholder="Seleccione el grupo"
                                  outlined
                                  item-text="text"
                                  item-value="value"
                                  clearable
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                (editedItem.platform === 'whatsapp' ||
                                  editedItem.platform ===
                                    'whatsapp_automated') &&
                                editedItem.phone &&
                                editedItem.conversationType === 'one_to_one'
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">Usuario</p>
                                <v-autocomplete
                                  :items="users"
                                  v-model="editedItem.userId"
                                  dense
                                  hide-details
                                  placeholder="Seleccione el usuario"
                                  outlined
                                  item-text="text"
                                  item-value="value"
                                  clearable
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                editedItem.platform === 'whatsapp' ||
                                editedItem.platform === 'whatsapp_automated'
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Imagina WhatsApp ID
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.imaginaWhatsappId"
                                  label="Ingresa el número de WhatsApp registrado"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="
                                editedItem.platform === 'whatsapp' ||
                                editedItem.platform === 'whatsapp_automated'
                              "
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Imagina WhatsApp Api Key
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.imaginaApiKey"
                                  label="Ingresa el número de WhatsApp registrado"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="editedItem.platform === 'whatsapp'"
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Id de Número WhatsApp
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.phone_number_id"
                                  label="Ingresa el id del numero registrado"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              v-if="editedItem.platform === 'whatsapp_automated'"
                              dense
                            >
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Legimus Channel ID
                                </p>
                                <VTextFieldWithValidation
                                  rules=""
                                  v-model="editedItem.legimusChannelId"
                                  label="Ingresa el Legimus Channel ID"
                                />
                              </v-col>
                            </v-row>
                          </template>

                          <v-divider></v-divider>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <h3 class="mt-3">Capacidades</h3>
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="6">
                              <v-checkbox
                                v-model="
                                  editedItem.capabilities.isEligibleForCampaigns
                                "
                                label="Elegible para Campañas"
                              ></v-checkbox>
                            </v-col>
                            <v-col cols="12" sm="6">
                              <v-checkbox
                                v-model="
                                  editedItem.capabilities
                                    .isEligibleForMassiveMessaging
                                "
                                label="Elegible para Mensajería Masiva"
                              ></v-checkbox>
                            </v-col>
                          </v-row>

                          <v-divider></v-divider>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <h3 class="mt-3">Credenciales de Dialogflow</h3>
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Dialogflow Google Project ID
                              </p>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.googleProjectId"
                                label="Ingresa el Google Project Id"
                              />
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Dialogflow Google Email
                              </p>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.googleClientEmail"
                                label="Ingresa el Google Email"
                              />
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Dialogflow Google Private Key
                              </p>
                              <v-textarea
                                hide-details="auto"
                                outlined
                                placeholder="Ingresa el Google Private Key"
                                v-model="editedItem.googlePrivateKey"
                              ></v-textarea>
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Dialogflow Código Idioma
                              </p>
                              <VTextFieldWithValidation
                                rules=""
                                v-model="editedItem.dialogflowLanguageCode"
                                label="Ingresa el código Idioma (ejmp: es)"
                              />
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Tiempo autoreconexión (hh:mm)
                              </p>
                              <v-menu
                                ref="menu"
                                v-model="menu2"
                                :close-on-content-click="false"
                                :nudge-right="40"
                                :return-value.sync="
                                  editedItem.autoActivateAfter
                                "
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="290px"
                              >
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field
                                    v-model="editedItem.autoActivateAfter"
                                    prepend-icon="mdi-clock-time-four-outline"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                    dense
                                    outlined
                                    hide-details="auto"
                                  ></v-text-field>
                                </template>
                                <v-time-picker
                                  v-if="menu2"
                                  v-model="editedItem.autoActivateAfter"
                                  full-width
                                  @click:minute="
                                    $refs.menu.save(
                                      editedItem.autoActivateAfter
                                    )
                                  "
                                  format="24hr"
                                ></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-container>
                        <v-card-actions rd-actions>
                          <div class="flex-grow-1"></div>
                          <v-btn outlined color="error" text @click="close"
                            >Cancelar</v-btn
                          >
                          <v-btn
                            :loading="loadingButton"
                            color="success"
                            @click="passes(save)"
                            >Guardar</v-btn
                          >
                        </v-card-actions>
                      </ValidationObserver>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-3"
              small
              color="secondary"
              @click="editItem(item)"
              v-if="rolPermisos['Edit']"
              >Editar</v-btn
            >
            <v-btn
              small
              color="error"
              @click="deleteItem(item)"
              v-if="rolPermisos['Delete']"
              >Eliminar</v-btn
            >
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con bots</v-alert
            >
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">{{
            item.createdAt | formatDate
          }}</template>
          <template v-slot:[`item.capabilities`]="{ item }">
            <div v-if="item.capabilities">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    :color="
                      item.capabilities.isEligibleForCampaigns
                        ? 'primary'
                        : 'grey'
                    "
                    class="mr-4"
                  >
                    mdi-bullhorn-outline
                  </v-icon>
                </template>
                <span
                  >Campañas:
                  {{
                    item.capabilities.isEligibleForCampaigns
                      ? "Activado"
                      : "Desactivado"
                  }}</span
                >
              </v-tooltip>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                    :color="
                      item.capabilities.isEligibleForMassiveMessaging
                        ? 'primary'
                        : 'grey'
                    "
                  >
                    mdi-forum-outline
                  </v-icon>
                </template>
                <span
                  >Mensajería Masiva:
                  {{
                    item.capabilities.isEligibleForMassiveMessaging
                      ? "Activado"
                      : "Desactivado"
                  }}</span
                >
              </v-tooltip>
            </div>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status" color="success">Activo</v-chip>
            <v-chip v-else color="error">Inactivo</v-chip>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > bots.length
                ? bots.length
                : $store.state.itemsPerPage
            }}
            de {{ bots.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import VFacebookLogin from "vue-facebook-login-component";
import MaterialCard from "@/components/material/Card";
import Bots from "@/classes/Bots";
import auth from "@/services/api/auth";
import { convertMsToTime } from "@/utils/utils";
import graphApi from "@/services/api/graphApi";
import chatGroups from "@/services/api/chatGroups";
import users from "@/services/api/users";
import companies from "@/services/api/companies";

export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    VFacebookLogin,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "dd/MM/yyyy");
    },
  },
  data: () => ({
    menu2: false,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    chatGroupDialog: false,
    newChatGroup: {
      name: "",
      botIds: [],
      userIds: [],
      companies: [],
    },
    allUsers: [],
    allCompanies: [],
    platforms: [
      { text: "Facebook", value: "facebook" },
      { text: "Telegram", value: "telegram" },
      { text: "Instagram", value: "instagram" },
      { text: "WhatsApp", value: "whatsapp" },
      { text: "WhatsApp Imagina ", value: "whatsapp_automated" },
    ],
    headers: [
      {
        text: "Nombre Bot",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Última Actualización",
        align: "left",
        sortable: false,
        value: "createdAt",
      },
      { text: "Capacidades", value: "capabilities", sortable: false },
      { text: "Acciones", value: "action", sortable: false },
    ],
    bots: [],
    groups: [],
    users: [],
    conversationTypes: [
      { text: "Muchos a Uno", value: "many_to_one" },
      { text: "Uno a Uno", value: "one_to_one" },
    ],
    editedIndex: -1,
    editedItem: Bots(),
    defaultItem: Bots(),
    rolPermisos: {},
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo bot" : "Editar bot";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    "editedItem.conversationType"(newVal) {
      // Clear previous selections when conversation type changes
      if (newVal === "many_to_one") {
        this.editedItem.userId = null;
      } else if (newVal === "one_to_one") {
        this.editedItem.groupId = null;
      } else if (newVal === null || newVal === undefined) {
        // Clear both userId and groupId when conversation type is removed
        this.editedItem.userId = null;
        this.editedItem.groupId = null;
      }
    },
    "editedItem.userId"(newVal) {
      // Clear groupId when userId is selected
      if (newVal) {
        this.editedItem.groupId = null;
      }
    },
    "editedItem.groupId"(newVal) {
      // Clear userId when groupId is selected
      if (newVal) {
        this.editedItem.userId = null;
      }
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
          menu: "Configuracion/Propiedades",
          model: "Facebook",
          company:
            this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize() {
      await Promise.all([
        this.$store.dispatch("botsModule/list", {
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
        }),
        this.loadGroups(),
        this.loadUsers(),
      ]);
      this.bots = this.$deepCopy(this.$store.state.botsModule.bots);
      // dar formato a autoActivateAfter
      for (const bot of this.bots) {
        if (bot.autoActivateAfter) {
          bot.autoActivateAfter = convertMsToTime(bot.autoActivateAfter);
        }
      }
      // this.locaciones = this.$store.state.locacionesModule.locaciones;
    },

    async loadGroups() {
      try {
        const response = await chatGroups.list({
          "corporation[]":
            this.$store.getters["authModule/getCurrentCompany"].company.corporation,
        });
        this.groups = response.data.payload
          .map((group) => ({
            text: group.name,
            value: group._id,
          }))
          .sort((a, b) => a.text.localeCompare(b.text));
      } catch (error) {
        console.error("Error loading chat groups:", error);
      }
    },

    async loadUsers() {
      try {
        const response = await users.list();
        this.users = response.data.payload
          .map((user) => ({
            text: `${user.first_name} ${user.last_name} (${user.email})`,
            value: user._id,
          }))
          .sort((a, b) => a.text.localeCompare(b.text));
      } catch (error) {
        console.error("Error loading users:", error);
      }
    },
    editItem(item) {
      this.editedIndex = this.bots.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      const index = this.bots.indexOf(item);
      let itemId = this.bots[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("botsModule/delete", itemId);
        this.bots.splice(index, 1);
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
      let autoActivateAfter;
      if (this.editedItem.autoActivateAfter) {
        let [hours, minutes] = this.editedItem.autoActivateAfter.split(":"); // 10:30
        autoActivateAfter = hours * 60 * 60 * 1000 + minutes * 60 * 1000;
      }
      if (this.editedIndex > -1) {
        let itemId = this.bots[this.editedIndex]._id;
        try {
          await this.$store.dispatch("botsModule/update", {
            id: itemId,
            data: { ...this.editedItem, autoActivateAfter },
          });
          Object.assign(this.bots[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          this.editedItem.company =
            this.$store.getters["authModule/getCurrentCompany"].company._id;
          let newItem = await this.$store.dispatch("botsModule/create", {
            ...this.editedItem,
            autoActivateAfter,
          });
          this.bots.push(newItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },

    async facebookLogged(e) {
      console.log("🚀 Aqui *** -> e", e);
      const responses = await graphApi.createMetaIntegration(
        e.authResponse.accessToken
      );
      console.log(responses);
    },

    async openCreateChatGroupDialog() {
      // reset form
      this.newChatGroup = {
        name: "",
        companies: [],
        userIds: [],
        botIds: [],
      };

      if (this.editedIndex > -1) {
        this.newChatGroup.botIds.push(this.editedItem._id);
      }

      if (!this.allUsers.length) {
        const usersResponse = await users.list();
        this.allUsers = usersResponse.data.payload.map((user) => ({
          text: `${user.first_name} ${user.last_name}`,
          value: user._id,
        }));
      }
      if (!this.allCompanies.length) {
        const companiesResponse = await companies.list();
        this.allCompanies = companiesResponse.data.payload.map((company) => ({
          text: company.alias,
          value: company._id,
        }));
      }
      this.chatGroupDialog = true;
    },

    async createNewChatGroup() {
      await this.$store.dispatch("chatGroupsModule/create", this.newChatGroup);
      this.chatGroupDialog = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>
