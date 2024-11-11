<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="1500px"
        icon="mdi-cellphone-dock"
        color="primary"
        :title="$t(entity + '.TITLE')"
        :text="$t(entity + '.SUBTITLE')"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
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
                    placeholder="Escribe el nombre del mensaje de plantilla"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="700px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        color="primary"
                        dark
                        class="mb-2"
                        v-on="on"
                        v-show="rolPermisos['Write']"
                        >{{ $t(entity + ".NEW_ITEM") }}</v-btn
                      >
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
                              <p class="body-1 font-weight-bold">Nombre</p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Nombre del mensaje de plantilla"
                              />
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold ma-0">
                                Tipo de mensaje
                              </p>

                              <v-select
                                :items="[
                                  { text: 'Texto', value: 'text' },
                                  { text: 'Media', value: 'media' },
                                  { text: 'Documento', value: 'document' },
                                ]"
                                item-text="text"
                                item-value="value"
                                outlined
                                dense
                                hide-details
                                v-model="editedItem.type"
                                label="Selecciona el tipo de mensaje"
                                required
                              ></v-select>
                            </v-col>
                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">Mensaje</p>
                              <v-textarea
                                v-model="editedItem.message"
                                label="Escribe el mensaje"
                                rows="3"
                                outlined
                                dense
                                :rules="[
                                  (v) => !!v || 'Este campo es requerido',
                                ]"
                              ></v-textarea>
                            </v-col>

                            <v-col
                              cols="12"
                              sm="12"
                              md="12"
                              v-if="editedItem.type === 'media'"
                            >
                              <p class="body-1 font-weight-bold">
                                URL del medio
                              </p>
                              <v-text-field
                                v-model="editedItem.mediaUrl"
                                label="Ingresa la URL de la imagen o video"
                                outlined
                                dense
                                prepend-icon="mdi-camera"
                              ></v-text-field>
                              <v-img
                                v-if="editedItem.mediaUrl"
                                :src="editedItem.mediaUrl"
                                max-height="200"
                                contain
                                class="mt-2 grey lighten-2"
                              >
                                <template v-slot:placeholder>
                                  <v-row
                                    class="fill-height ma-0"
                                    align="center"
                                    justify="center"
                                  >
                                    <v-progress-circular
                                      indeterminate
                                      color="primary"
                                    ></v-progress-circular>
                                  </v-row>
                                </template>
                              </v-img>
                            </v-col>

                            <v-col
                              cols="12"
                              sm="12"
                              md="12"
                              v-if="editedItem.type === 'document'"
                            >
                              <p class="body-1 font-weight-bold">
                                URL del documento
                              </p>
                              <v-text-field
                                v-model="editedItem.documentUrl"
                                label="Ingresa la URL del documento"
                                outlined
                                dense
                                prepend-icon="mdi-file-document"
                              ></v-text-field>
                              <v-alert
                                v-if="editedItem.documentUrl"
                                dense
                                text
                                color="info"
                                class="mt-2"
                              >
                                <v-icon left>mdi-file-document-outline</v-icon>
                                Documento adjunto:
                                {{ editedItem.documentUrl.split("/").pop() }}
                              </v-alert>
                            </v-col>

                            <v-col cols="12" sm="12" md="12">
                              <p class="body-1 font-weight-bold">
                                Shortcodes disponibles
                              </p>
                              <v-card outlined class="pa-3">
                                <p class="mb-1">
                                  Puedes usar los siguientes shortcodes en tu
                                  mensaje:
                                </p>
                                <v-chip class="mr-2 mb-2" small
                                  ><span v-pre>{{ contact.name }}</span></v-chip
                                >
                                <v-chip class="mr-2 mb-2" small
                                  ><span v-pre>{{
                                    contact.number
                                  }}</span></v-chip
                                >

                                <p class="caption mt-2 mb-0">
                                  Los shortcodes serán reemplazados con la
                                  información del contacto al enviar el mensaje.
                                </p>
                              </v-card>
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
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  class="mr-1 mb-1"
                  color="blue"
                  fab
                  small
                  dark
                  @click="testWhatsappMessage(item)"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-whatsapp</v-icon>
                </v-btn>
              </template>
              <span>Enviar mensaje de prueba</span>
            </v-tooltip>
            <v-btn color="error" fab small dark @click="deleteItem(item)">
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
              $store.state.itemsPerPage > items.length
                ? items.length
                : $store.state.itemsPerPage
            }}
            de {{ items.length }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination v-model="page" :length="pageCount"></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog v-model="testDialog" max-width="600">
      <ValidationObserver ref="obs" v-slot="{ passes }">
        <v-card v-if="selectedTemplate">
          <v-card-title>
            <v-icon color="primary" class="mr-1">mdi-whatsapp</v-icon>
            <span class="headline">Enviar Mensaje de Prueba</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-container class="pa-5">
            <v-row dense>
              <v-col cols="12">
                <p class="body-1 font-weight-bold">Número de origen</p>
                <VSelectWithValidation
                  rules="required"
                  :items="bots"
                  v-model="selectedBot"
                  itemText="name"
                  itemValue="_id"
                  label="Selecciona el número desde el que se enviará el mensaje"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="testMode"
                  :items="[
                    { text: 'Mensaje individual', value: 'single' },
                    { text: 'Mensajes masivos (Campaña)', value: 'bulk' },
                  ]"
                  label="Modo de envío"
                  outlined
                  dense
                ></v-select>
              </v-col>

              <!-- Single message mode -->
              <v-col cols="12" v-if="testMode === 'single'">
                <p class="body-1 font-weight-bold">Número de Teléfono</p>
                <v-text-field
                  v-model="testPhone"
                  label="Escribe el número de teléfono"
                  placeholder="Ej: 521234567890"
                  outlined
                  dense
                  required
                ></v-text-field>
              </v-col>

              <!-- Bulk message mode -->
              <v-col cols="12" v-if="testMode === 'bulk'">
                <p class="body-1 font-weight-bold">Nombre de la Campaña</p>
                <v-text-field
                  v-model="campaignName"
                  label="Escribe el nombre de la campaña"
                  outlined
                  dense
                  required
                ></v-text-field>

                <p class="body-1 font-weight-bold">Números de Teléfono</p>
                <v-textarea
                  v-model="bulkPhones"
                  :placeholder="
                    '521234567890' +
                      '\n' +
                      '521234567891' +
                      '\n' +
                      '521234567892'
                  "
                  outlined
                  dense
                  rows="4"
                  required
                ></v-textarea>
                <v-alert dense text type="info" class="mt-2">
                  Escribe un número por línea, incluyendo el código de país
                </v-alert>
              </v-col>

              <v-col cols="12">
                <p class="body-1 font-weight-bold">Vista previa del mensaje (no editable)</p>
                <v-textarea
                  v-model="selectedTemplate.message"
                  label="Mensaje de plantilla"
                  rows="6"
                  outlined
                  dense
                  readonly
                ></v-textarea>

                <!-- Preview for media messages -->
                <v-img
                  v-if="
                    selectedTemplate.type === 'media' &&
                      selectedTemplate.mediaUrl
                  "
                  :src="selectedTemplate.mediaUrl"
                  max-height="150"
                  contain
                  class="mt-2 grey lighten-2"
                ></v-img>

                <!-- Preview for document messages -->
                <v-alert
                  v-if="
                    selectedTemplate.type === 'document' &&
                      selectedTemplate.documentUrl
                  "
                  dense
                  text
                  type="info"
                  class="mt-2"
                >
                  <v-icon left>mdi-file-document-outline</v-icon>
                  Documento adjunto:
                  {{ selectedTemplate.documentUrl.split("/").pop() }}
                </v-alert>
              </v-col>
            </v-row>
          </v-container>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="success"
              @click="passes(sendTestMessage)"
              :loading="loadingTestButton"
            >
              {{ testMode === "single" ? "Enviar mensaje" : "Enviar mensajes" }}
            </v-btn>
            <v-btn color="grey" @click="closeTest">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </ValidationObserver>
    </v-dialog>
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
const ENTITY = "imaginaTemplateMessages"; // nombre de la entidad en minusculas (se repite en services y modules del store)
// const ITEMS_SPANISH = 'marcas';
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation";
import ImaginaTemplateMessages from "@/classes/ImaginaTemplateMessages";
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
import { checkIsImage, checkIsAudio, checkIsVideo } from "@/utils/utils";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    VSelectWithValidation,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    headers: [
      {
        text: "Agregado",
        align: "left",
        sortable: false,
        value: "createdAt",
      },
      {
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    [ENTITY]: [],
    advisors: [],
    editedIndex: -1,
    editedItem: ImaginaTemplateMessages(),
    defaultItem: ImaginaTemplateMessages(),
    menu1: false,
    menu2: false,
    rolPermisos: {},
    todofullLabels: [],
    imaginaTemplateMessages: [],
    testDialog: false,
    testPhone: "",
    loadingTestButton: false,
    selectedTemplate: null,
    testMode: "single",
    bulkPhones: "",
    selectedBot: null,
    bots: [],
    campaignName: "",
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
  },
  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    await this.$store.dispatch("imaginaTemplateMessagesModule/list", {
      companies: [
        this.$store.getters["authModule/getCurrentCompany"].company._id,
      ],
    });
    this.initialize();
    this.rolAuth();
  },
  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/Propiedades",
          model: "GravityForms",
          company: this.$store.getters["authModule/getCurrentCompany"].company
            ._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    async initialize() {
      //llamada asincrona de items and bots
      await Promise.all([
        this.$store.dispatch("todofullLabelsModule/list", {
          sort: "name",
          order: 1,
        }),
        this.$store.dispatch("botsModule/list", {
          sort: "name",
          order: 1,
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
          platform: "whatsapp_automated",
        }),
        this.$store.dispatch(ENTITY + "Module/list", {
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
        }),
      ]);
      this.todofullLabels = this.$store.state["todofullLabelsModule"][
        "todofullLabels"
      ];
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      );
      console.log("🚀 Aqui *** -> this[ENTITY]", this[ENTITY]);
      this.bots = this.$deepCopy(this.$store.state.botsModule.bots);
    },
    editItem(item) {
      this.editedIndex = this[ENTITY].indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async deleteItem(item) {
      const index = this[ENTITY].indexOf(item);
      if (index !== -1) {
        const itemId = this[ENTITY][index]._id;
        if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
          await this.$store.dispatch(`${ENTITY}Module/delete`, itemId);
          this[ENTITY].splice(index, 1);
        }
      }
    },
    close() {
      this.dialog = false;
      this.$nextTick(() => {
        this.editedItem = { ...this.defaultItem };
        this.editedIndex = -1;
      });
    },
    async save() {
      this.loadingButton = true;
      this.editedItem.company = this.$store.getters[
        "authModule/getCurrentCompany"
      ].company._id;
      // in case of mediaUrl, infer the type and mediaType
      if (this.editedItem.mediaUrl) {
        this.editedItem.type = "media";
        const isImage = checkIsImage(this.editedItem.mediaUrl);
        const isAudio = checkIsAudio(this.editedItem.mediaUrl);
        const isVideo = checkIsVideo(this.editedItem.mediaUrl);
        this.editedItem.mediaType = isImage
          ? "image"
          : isAudio
          ? "audio"
          : isVideo
          ? "video"
          : null;
      }
      // in case of documentUrl, infer the type and documentType
      if (this.editedItem.documentUrl) {
        this.editedItem.type = "document";
        this.editedItem.documentType = this.editedItem.documentUrl
          .split(".")
          .pop();
        this.editedItem.documentName = this.editedItem.documentUrl
          .split("/")
          .pop();
      }
      if (this.editedIndex > -1) {
        Object.keys(this.editedItem).forEach((key) => {
          if (this.editedItem[key] === "") {
            this.editedItem[key] = null; // or you can use undefined if preferred
          }
        });
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
    remove(itemId, labels) {
      console.log(" Aqui *** -> itemId, labels", itemId, labels);
      let index = labels.findIndex((label) => label._id == itemId);
      labels.splice(index, 1);
    },
    testWhatsappMessage(item) {
      this.selectedTemplate = item;
      this.testDialog = true;
    },
    closeTest() {
      this.testDialog = false;
      this.$nextTick(() => {
        this.testPhone = "";
        this.bulkPhones = "";
        this.selectedTemplate = null;
        this.testMode = "single";
        this.selectedBot = null;
      });
    },
    async sendTestMessage() {
      try {
        this.loadingTestButton = true;

        if (this.testMode === "single" && !this.testPhone) {
          alert("Debes ingresar un número de teléfono");
        }

        if (this.testMode === "bulk" && !this.bulkPhones.trim()) {
          alert("Debes ingresar al menos un número de teléfono");
        }

        // Get array of phone numbers
        const recipients =
          this.testMode === "single"
            ? [this.testPhone]
            : this.bulkPhones.split("\n").filter((phone) => phone.trim());

        // Validate phone numbers
        if (this.testMode === "bulk" && recipients.length === 0) {
          throw new Error("No se encontraron números de teléfono válidos");
        }

        // Prepare base message data
        const payload = {
          type: this.selectedTemplate.type,
          message: this.selectedTemplate.message,
          botId: this.selectedBot,
          campaignName: this.campaignName,
          recipients,
          userId: this.$store.state.authModule.user._id,
        };

        if (this.selectedTemplate.type === "media") {
          payload.media_url = this.selectedTemplate.mediaUrl;
          payload.media_type = this.selectedTemplate.mediaType;
        }

        if (this.selectedTemplate.type === "document") {
          payload.document_url = this.selectedTemplate.documentUrl;
          payload.document_type = this.selectedTemplate.documentType;
          payload.document_name = this.selectedTemplate.documentName;
        }
        await this.$store.dispatch(
          "imaginaTemplateMessagesModule/sendBulkMessages",
          payload
        );

        this.closeTest();
      } catch (error) {
        console.log("🚀 Aqui *** -> error", error);
      } finally {
        this.loadingTestButton = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
