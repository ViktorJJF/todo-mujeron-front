<template>
  <div style="font-size: 10px !important">
    <v-row justify="center">
      <material-card
        width="100%"
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
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="selectedOrderStates"
                    :items="orderStates"
                    item-text="label"
                    item-value="value"
                    placeholder="Selecciona un estado"
                    outlined
                    multiple
                    chips
                    persistent-hint
                    dense
                  ></v-select>
                  <v-select
                    v-model="selectedPendingTasks"
                    outlined
                    :items="['Guía', 'Carro', 'Faja']"
                    placeholder="Tareas pendientes"
                    multiple
                    chips
                    persistent-hint
                    dense
                    hide-details="auto"
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-dialog v-model="dialog" max-width="700px">
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
                              <p class="body-1 font-weight-bold ma-0">
                                Nombres
                              </p>
                              <VTextFieldWithValidation
                                rules="required"
                                v-model="editedItem.name"
                                label="Nombre del marca"
                              /> </v-col
                            ><v-col cols="12" sm="6" md="6">
                              <p class="body-1 font-weight-bold ma-0">
                                Categoría
                              </p>
                              <v-select
                                dense
                                hide-details
                                placeholder="Categoría"
                                outlined
                                :items="
                                  $store.state.categoriesModule.categories
                                "
                                item-text="name"
                                item-value="_id"
                                v-model="editedItem.categoryId"
                              ></v-select>
                            </v-col>
                            <v-col cols="12" sm="6" md="6">
                              <p class="body-1 font-weight-bold ma-0">Marca</p>
                              <v-select
                                dense
                                hide-details
                                placeholder="Marca"
                                outlined
                                :items="$store.state.brandsModule.brands"
                                item-text="name"
                                item-value="_id"
                                v-model="editedItem.brandId"
                              ></v-select>
                            </v-col>
                            <v-divider class="mx-3 my-3"></v-divider>
                            <v-row
                              dense
                              v-for="(detail,
                              detailIndex) in editedItem.details"
                              :key="detailIndex"
                            >
                              <v-col cols="12" sm="6" md="6">
                                <p class="body-1 font-weight-bold ma-0">
                                  Precio
                                </p>
                                <VTextFieldWithValidation
                                  :prefix="
                                    detail.country == 'Peru' ? 'S/.' : '$'
                                  "
                                  rules=""
                                  v-model="detail.price"
                                  label="Precio"
                                />
                              </v-col>
                              <v-col cols="12" sm="6" md="6">
                                <p class="body-1 font-weight-bold ma-0">País</p>
                                <v-select
                                  dense
                                  hide-details
                                  placeholder="País"
                                  outlined
                                  :items="$store.state.countries"
                                  v-model="detail.country"
                                ></v-select>
                              </v-col>

                              <v-col cols="12" sm="12" md="12">
                                <p class="body-1 font-weight-bold ma-0">Url</p>
                                <v-combobox
                                  dense
                                  v-model="detail.urls"
                                  chips
                                  clearable
                                  multiple
                                  outlined
                                  append-icon=""
                                >
                                  <template
                                    v-slot:selection="{
                                      attrs,
                                      item,
                                      select,
                                      selected,
                                    }"
                                  >
                                    <v-chip
                                      small
                                      v-bind="attrs"
                                      :input-value="selected"
                                      close
                                      @click="select"
                                      @click:close="remove(detail.urls, item)"
                                    >
                                      {{ item }}
                                    </v-chip>
                                  </template>
                                </v-combobox>
                              </v-col>
                            </v-row>
                          </v-row>
                          <v-btn
                            color="primary"
                            text
                            @click="addDetail(editedItem.details)"
                            >Agregar nuevo precio/pais</v-btn
                          >
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
              <v-row>
                <v-col cols="12" sm="12">
                  <span>
                    <strong>Mostrando:</strong>
                    {{
                      $store.state.itemsPerPage > items.length
                        ? items.length
                        : $store.state.itemsPerPage
                    }}
                    de {{ totalItems }} registros
                  </span>
                </v-col>
              </v-row>
              <div class="text-center pt-2">
                <v-pagination
                  @input="initialize(page)"
                  v-model="page"
                  :length="pageCount"
                  :total-visible="$store.state.maxPaginationButtons"
                ></v-pagination>
              </div>
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
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn color="error" fab small dark @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true"
              >Aún no cuentas con brands</v-alert
            >
          </template>
          <template v-slot:[`item.total`]="{ item }">
            {{ item.line_items.reduce((a, b) => a + parseFloat(b.total), 0) }}
          </template>
          <template v-slot:[`item.templateMessagesLogs`]="{ item }">
            {{
              item.templateMessagesLogs && item.templateMessagesLogs.length > 0
                ? "✅"
                : ""
            }}
            <ul>
              <li
                v-for="(templateMessageLog,
                logIdx) in item.templateMessagesLogs"
                :key="logIdx"
              >
                <span v-if="templateMessageLog">{{
                  templateMessageLog.name
                }}</span>
              </li>
            </ul>
          </template>
          <template v-slot:[`item.date_modified`]="{ item }">{{
            item.date_modified | formatDate
          }}</template>

          <template v-slot:item.odooOrderName="{ item }">
            <div v-if="item.odooOrderName">
              <a
                class="text-link"
                target="_blank"
                :href="getSaleOrderLink(item.odooOrderId)"
              >
                {{ item.odooOrderName }}
              </a>
            </div>
            <div v-else>
              <div class="d-flex justify-center">
                <v-btn icon @click="handleGenialRetry(item)">
                  <v-icon>mdi-cached</v-icon>
                </v-btn>
                <v-tooltip
                  v-if="!item.odooOrderName && item.lastOdooError"
                  bottom
                  color="error"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="error" v-bind="attrs" v-on="on">
                      <v-icon>mdi-alert-circle-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ item.lastOdooError }}</span>
                </v-tooltip>
              </div>
            </div>
          </template>
          <template v-slot:item.odooInfo="{ item }">
            <template v-if="item.odooInfo">
              <div v-if="item.odooInfo.team_id">
                Team ID: {{ item.odooInfo.team_id }}
              </div>
              <div v-if="item.odooInfo.rmf_score">
                RFM: {{ item.odooInfo.rmf_score }}
              </div>
              <div v-if="item.odooInfo.sale_order_count">
                Ventas: {{ item.odooInfo.sale_order_count }}
              </div>
              <div v-if="item.odooInfo.sale_order_count">
                Tickets: {{ item.odooInfo.helpdesk_ticket_count }}
              </div>
              <div v-if="item.odooInfo.sale_order_count">
                TPV: {{ item.odooInfo.pos_order_count }}
              </div>
            </template>
          </template>

          <template v-slot:item.client="{ item }">
            <div>
              <a
                v-if="getClientOdooId(item)"
                target="_blank"
                class="text-link"
                :href="getOrderPartnerLink(getClientOdooId(item))"
              >
                {{ getClientFullName(item) }}
              </a>
              <span v-else>
                {{ getClientFullName(item) }}
              </span>
            </div>
          </template>

          <template v-slot:item.phone="{ item }">
            <div
              v-if="
                item.ecommercesContactId && item.ecommercesContactId.cleanLeadId
              "
              style="cursor: pointer; color: blue; text-decoration: underline;"
              @click.stop="
                chatDialog = true;
                selectedCleanLead = item.ecommercesContactId.cleanLeadId;
                getCleanLeadsChats(item.ecommercesContactId.cleanLeadId._id);
              "
            >
              {{
                item.ecommercesContactId
                  ? item.ecommercesContactId.phone
                  : "Sin número"
              }}
            </div>
            <div v-else>
              {{
                item.ecommercesContactId
                  ? item.ecommercesContactId.phone
                  : "Sin número"
              }}
            </div>
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip dark v-if="item.status == 'cancelled'" color="error"
              >Cancelado</v-chip
            >
            <v-chip dark v-if="item.status == 'completed'" color="success"
              >Completado</v-chip
            >
            <v-chip dark v-if="item.status == 'pending'" color="lime"
              >Pendiente</v-chip
            >
            <v-chip dark v-if="item.status == 'processing'" color="blue"
              >Procesando</v-chip
            >
            <v-chip dark v-if="item.status == 'failed'" color="amber"
              >Fallido</v-chip
            >
            <v-chip dark v-if="item.status == 're-intento'" color="yellow"
              >Re intentó</v-chip
            >
            <v-chip
              dark
              v-if="item.status == 'on-hold'"
              color="orange lighten-3"
              >En Espera</v-chip
            >
            <v-chip dark v-if="item.status == 'trash'" color="orange lighten-1"
              >Trash</v-chip
            >
          </template>

          <template v-slot:item.action="{ item }">
            <v-btn
              class="mr-2 mb-2"
              small
              color="secondary"
              @click="openDetails(item)"
            >
              Detalles
            </v-btn>
            <v-btn
              class="mr-2 mb-2"
              small
              color="primary"
              @click="openGuideDetails(item)"
            >
              Guía
            </v-btn>
            <v-btn
              class="mr-2 mb-2"
              small
              color="primary"
              @click="openAbandonedCart(item)"
            >
              Carro
            </v-btn>
            <v-btn
              class="mb-2"
              small
              color="primary"
              @click="openSizeConfirmation(item)"
            >
              Faja
            </v-btn>
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
            de {{ totalItems }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            @input="initialize(page)"
            v-model="page"
            :length="pageCount"
            :total-visible="$store.state.maxPaginationButtons"
          ></v-pagination>
        </div>
      </material-card>
    </v-row>

    <v-dialog v-model="detailsModal" width="800">
      <order-details :order="currentOrder" />
    </v-dialog>
    <v-dialog v-if="guideDetailsModal" v-model="guideDetailsModal" width="400">
      <Guide @onClose="guideDetailsModal = false" :order="currentOrder" />
    </v-dialog>
    <v-dialog
      v-if="abandonedCartModal"
      v-model="abandonedCartModal"
      width="400"
    >
      <AbandonedCart
        @onClose="abandonedCartModal = false"
        :order="currentOrder"
      />
    </v-dialog>
    <v-dialog
      v-if="sizeConfirmationModal"
      v-model="sizeConfirmationModal"
      width="400"
    >
      <SizeConfirmation
        @onClose="sizeConfirmationModal = false"
        :order="currentOrder"
      />
    </v-dialog>
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
              selectedCleanLead = null;
              selectedChatId = null;
              chatDialog = false;
              noChat = false;
            "
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title
            >Chat en vivo con {{ selectedCleanLead.telefono }}</v-toolbar-title
          >
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn
              dark
              text
              @click="
                selectedCleanLead = null;
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
  </div>
</template>

<script>
const ENTITY = "ecommercesOrders";
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import { es } from "date-fns/locale";
import OrderDetails from "./Details.vue";
import Guide from "./Guide.vue";
import AbandonedCart from "./AbandonedCart.vue";
import SizeConfirmation from "./SizeConfirmation.vue";
import ecommercesOrdersApi from "@/services/api/ecommercesOrders";
import odooService from "@/services/api/odoo";
import chatService from "@/services/api/chats";
import environment from "@/environment";

export default {
  components: {
    MaterialCard,
    OrderDetails,
    VTextFieldWithValidation,
    Guide,
    AbandonedCart,
    SizeConfirmation,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    //datos del componente
    chatDialog: false,
    noChat: false,
    selectedOrderStates: [],
    selectedPendingTasks: [],
    orderStates: [
      { label: "Cancelado", value: "cancelled" },
      { label: "Completado", value: "completed" },
      { label: "Pendiente", value: "pending" },
      { label: "Procesando", value: "processing" },
      { label: "Fallido", value: "failed" },
      { label: "Re intentó", value: "re-intento" },
      { label: "En Espera", value: "on-hold" },
    ],
    fieldsToSearch: ["idOrder", "odooOrderName", "status", "phone"],
    headers: [
      {
        text: "Última modificación",
        align: "left",
        sortable: false,
        value: "date_modified",
      },
      {
        text: "N°Orden",
        align: "left",
        sortable: false,
        value: "idOrder",
      },
      {
        text: "Fuente",
        align: "left",
        sortable: false,
        value: "url",
      },
      {
        text: "Genial",
        align: "left",
        sortable: false,
        value: "odooOrderName",
        width: "50px",
      },

      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "status",
      },
      {
        text: "Cliente",
        align: "left",
        sortable: false,
        value: "client",
      },
      {
        text: "Teléfonos",
        align: "left",
        sortable: false,
        value: "phone",
      },
      {
        text: "Total",
        align: "left",
        sortable: false,
        value: "total",
      },
      {
        text: "Odoo",
        align: "left",
        sortable: false,
        value: "odooInfo",
        width: "100px",
      },
      {
        text: "Mensajes Plantillas",
        align: "left",
        sortable: false,
        value: "templateMessagesLogs",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    delayTimer: null,
    [ENTITY]: [],
    editedIndex: -1,
    editedItem: CLASS_ITEMS(),
    defaultItem: CLASS_ITEMS(),
    //configuracion de la tabla
    pagination: {},
    dataTableLoading: true,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    detailsModal: false,
    guideDetailsModal: false,
    abandonedCartModal: false,
    sizeConfirmationModal: false,
    currentOrder: null,
    selectedChatId: null,
  }),
  computed: {
    getEnvironment() {
      return environment;
    },
    totalItems() {
      return this.$store.state[ENTITY + "Module"].total;
    },
    totalPages() {
      return this.$store.state[ENTITY + "Module"].totalPages;
    },
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
    telefonoId() {
      //buscar con algun campo en particular?
      this.initialize(1);
    },
    selectedOrderStates() {
      this.initialize(1);
    },
    selectedPendingTasks() {
      this.initialize(1);
    },
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize(page = 1) {
      //llamada asincrona de items
      let payload = {
        sort: "date_modified",
        order: -1,
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
      };
      if (this.selectedOrderStates.length > 0) {
        payload.orderStates = this.selectedOrderStates;
      }
      if (this.selectedPendingTasks.length > 0) {
        payload.pendingTasks = this.selectedPendingTasks;
      }
      payload.companies = [this.$store.getters["authModule/getCurrentCompany"].company._id];
      await Promise.all([
        this.$store.dispatch(ENTITY + "Module/list", payload),
      ]);
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      );
      // fetch odoo info for each lead
      this[ENTITY].forEach((order, index) => {
        if (
          order.ecommercesContactId &&
          order.ecommercesContactId.cleanLeadId &&
          order.ecommercesContactId.cleanLeadId.odoo_id
        ) {
          const odoo_id = order.ecommercesContactId.cleanLeadId.odoo_id;
          odooService
            .getPartnerInfo(odoo_id)
            .then((res) => {
              // const result = res.data.payload.result;
              this.$set(this[ENTITY], index, {
                ...this[ENTITY][index],
                odoo_id,
                odooInfo:
                  order.ecommercesContactId.cleanLeadId.odoo_metadata ||
                  res.data.payload.result,
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    },
    openDetails(order) {
      this.currentOrder = order;
      this.detailsModal = true;
    },
    openGuideDetails(order) {
      this.currentOrder = order;
      this.guideDetailsModal = true;
    },
    openAbandonedCart(order) {
      this.currentOrder = order;
      this.abandonedCartModal = true;
    },
    openSizeConfirmation(order) {
      this.currentOrder = order;
      this.sizeConfirmationModal = true;
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
        await this.$store.dispatch("brandsModule/delete", itemId);
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
          this.initialize();
        } finally {
          this.loadingButton = false;
        }
      }
    },
    addDetail(details) {
      details.push({
        price: "",
        country: "",
        url: "",
      });
    },
    remove(urls, url) {
      let index = urls.indexOf(url);
      urls.splice(index, 1);
    },
    getClientFullName(order) {
      const firstName = order.ecommercesContactId
        ? order.ecommercesContactId.first_name
        : "";
      const lastName = order.ecommercesContactId
        ? order.ecommercesContactId.last_name
        : "";
      return `${firstName} ${lastName}`;
    },

    getClientOdooId(order) {
      return order.ecommercesContactId?.cleanLeadId?.odoo_id;
    },

    getSaleOrderLink(id) {
      return `https://mujeron.odoo.com/web#action=344&cids=1&id=${id}&menu_id=224&model=sale.order&view_type=form`;
    },
    getOrderPartnerLink(id) {
      return `https://mujeron.odoo.com/web#id=${id}&action=209&model=res.partner&view_type=form&cids=1&menu_id=224`;
    },
    async handleGenialRetry(order) {
      const res = await ecommercesOrdersApi.genialRetry(order._id);

      const successful = res.ok === true;

      const lastOdooError = !successful
        ? res.error.data?.message ??
          res.error.message ??
          "Unknown error occurred"
        : undefined;

      Object.assign(order, {
        odooOrderId: successful ? res.payload.order_new_id : undefined,
        odooOrderName: successful ? res.payload.order_new_name : undefined,
        lastOdooError: lastOdooError,
      });

      let index = this[[ENTITY]].findIndex((o) => o._id === order._id);

      this[[ENTITY]].splice(index, 1, order);
    },
    async getCleanLeadsChats(id) {
      try {
        const chats = (await chatService.getAllByCleanLeadId(id)).data.payload;
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

<style lang="scss" scoped>
.selected {
  background-color: #f5f5f5 !important;
}

.text-link {
  color: blue;
  text-decoration: none;
}
</style>
