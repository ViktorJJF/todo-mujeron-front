<template>
  <v-container>
    <v-row justify="center">
      <material-card width="90%" icon="mdi-cellphone-dock" color="primary" title="Bots" text="Resumen de Bots">
        <v-data-table no-results-text="No se encontraron resultados" :search="search" hide-default-footer
          :headers="headers" :items="bots" sort-by="calories" @page-count="pageCount = $event" :page.sync="page"
          :items-per-page="$store.state.itemsPerPage">
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold">Filtrar por nombre: {{ search }}</span>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field dense hide-details v-model="search" append-icon="search" placeholder="Escribe el nomb"
                    single-line outlined></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="900px">
                    <template v-slot:activator="{ on }">
                      <v-btn color="primary" dark class="mb-2" v-on="on" v-show="rolPermisos['Write']">Agregar
                        bot</v-btn>
                      <v-facebook-login
                        :login-options="{
                          scope:
                            'ads_management,instagram_manage_messages,pages_messaging,pages_manage_metadata,instagram_manage_comments,instagram_manage_insights,pages_read_engagement,instagram_basic,pages_show_list,business_management',
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
                              <VTextFieldWithValidation rules="required" v-model="editedItem.name"
                                label="Ingresa el nombre del bot" />
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
                              <v-select :items="platforms" v-model="editedItem.platform" dense hide-details
                                placeholder="Seleccione la plataforma" outlined />
                            </v-col>
                          </v-row>
                          <template v-if="editedItem.platform === 'telegram'">
                            <v-row dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Telegram HTTP Api
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.tgApi" label="Ingresa el API" />
                              </v-col>
                            </v-row>
                          </template>
                          <template>
                            <v-row dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Nombre Fanpage
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.fanpageName"
                                  label="Ingresa el nombre de la Fanpage" />
                              </v-col>
                            </v-row>
                            <v-row v-if="editedItem.platform !== 'whatsapp'" dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  URL Fanpage
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.fanpageUrl"
                                  label="Ingresa la url de la fanpage" />
                              </v-col>
                            </v-row>
                            <v-row dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  {{ editedItem.platform !== 'whatsapp' ? 'Fanpage ID' : 'ID WhatsApp' }}
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.fanpageId"
                                  label="Ingresa el ID de la plataforma" />
                              </v-col>
                            </v-row>
                            <v-row dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  {{ editedItem.platform !== 'whatsapp' ? 'Fanpage Token' : 'Token de usuario Meta' }}
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.fbPageToken"
                                  label="Ingresa el token de acceso" />
                              </v-col>
                            </v-row>
                            <v-row v-if="editedItem.platform !== 'whatsapp'" dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Facebook App Secret
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.fbAppSecret"
                                  label="Ingresa el FB App Secret" />
                              </v-col>
                            </v-row>
                            <v-row v-if="editedItem.platform === 'whatsapp'" dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Número WhatsApp
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.phone"
                                  label="Ingresa el número de WhatsApp registrado" />
                              </v-col>
                            </v-row>
                            <v-row v-if="editedItem.platform === 'whatsapp'" dense>
                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold">
                                  Id de Número WhatsApp
                                </p>
                                <VTextFieldWithValidation rules="" v-model="editedItem.phone_number_id"
                                  label="Ingresa el id del numero registrado" />
                              </v-col>
                            </v-row>

                          </template>

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
                              <VTextFieldWithValidation rules="" v-model="editedItem.googleProjectId"
                                label="Ingresa el Google Project Id" />
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Dialogflow Google Email
                              </p>
                              <VTextFieldWithValidation rules="" v-model="editedItem.googleClientEmail"
                                label="Ingresa el Google Email" />
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Dialogflow Google Private Key
                              </p>
                              <v-textarea hide-details="auto" outlined placeholder="Ingresa el Google Private Key"
                                v-model="editedItem.googlePrivateKey"></v-textarea>
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Dialogflow Código Idioma
                              </p>
                              <VTextFieldWithValidation rules="" v-model="editedItem.dialogflowLanguageCode"
                                label="Ingresa el código Idioma (ejmp: es)" />
                            </v-col>
                          </v-row>
                          <v-row dense>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Tiempo autoreconexión (hh:mm)
                              </p>
                              <v-menu ref="menu" v-model="menu2" :close-on-content-click="false" :nudge-right="40"
                                :return-value.sync="
                                  editedItem.autoActivateAfter
                                " transition="scale-transition" offset-y max-width="290px" min-width="290px">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-text-field v-model="editedItem.autoActivateAfter"
                                    prepend-icon="mdi-clock-time-four-outline" readonly v-bind="attrs" v-on="on" dense
                                    outlined hide-details="auto"></v-text-field>
                                </template>
                                <v-time-picker v-if="menu2" v-model="editedItem.autoActivateAfter" full-width
                                  @click:minute="
                                    $refs.menu.save(
                                      editedItem.autoActivateAfter
                                    )
                                  " format="24hr"></v-time-picker>
                              </v-menu>
                            </v-col>
                          </v-row>
                        </v-container>
                        <v-card-actions rd-actions>
                          <div class="flex-grow-1"></div>
                          <v-btn outlined color="error" text @click="close">Cancelar</v-btn>
                          <v-btn :loading="loadingButton" color="success" @click="passes(save)">Guardar</v-btn>
                        </v-card-actions>
                      </ValidationObserver>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <v-btn class="mr-3" small color="secondary" @click="editItem(item)"
              v-if="rolPermisos['Edit']">Editar</v-btn>
            <v-btn small color="error" @click="deleteItem(item)" v-if="rolPermisos['Delete']">Eliminar</v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true">Aún no cuentas con bots</v-alert>
          </template>
          <template v-slot:[`item.createdAt`]="{ item }">{{
            item.createdAt | formatDate
          }}</template>
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
    platforms: [
      { text: "Facebook", value: "facebook" },
      { text: "Telegram", value: "telegram" },
      { text: "Instagram", value: "instagram" },
      { text: "WhatsApp", value: "whatsapp" },
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
      { text: "Acciones", value: "action", sortable: false },
    ],
    bots: [],
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
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize() {
      await Promise.all([this.$store.dispatch("botsModule/list", {
        companies: [this.$store.getters["authModule/getCurrentCompany"].company._id]
      })]);
      this.bots = this.$deepCopy(this.$store.state.botsModule.bots);
      // dar formato a autoActivateAfter
      for (const bot of this.bots) {
        if (bot.autoActivateAfter) {
          bot.autoActivateAfter = convertMsToTime(bot.autoActivateAfter);
        }
      }
      // this.locaciones = this.$store.state.locacionesModule.locaciones;
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
          this.editedItem.company = this.$store.getters["authModule/getCurrentCompany"].company._id;
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
      const responses = await graphApi.createMetaIntegration(e.authResponse.accessToken);
      console.log(responses);
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
