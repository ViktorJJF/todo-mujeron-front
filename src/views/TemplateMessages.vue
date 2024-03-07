<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="98%"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Audiencias"
        text="Listado de Mensajes de Plantilla"
      >
        <v-col cols="12" sm="10">
          <v-row class="mb-3">
            <v-col cols="12" sm="6" md="6">
              <v-select
                color="primary"
                prepend-icon="mdi-map"
                dense
                hide-details
                outlined
                :items="bots"
                v-model="selectedBot"
                @change="initialize(selectedBot)"
                label="Selecciona un bot"
                item-text="name"
                return-object
              ></v-select>
            </v-col>
          </v-row>
        </v-col>
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="templateMessages"
          :items-per-page="100"
        >
          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
            >
              <v-icon>mdi-account-multiple-plus</v-icon>
            </v-btn>
            <v-btn color="error" fab small dark @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:[`item.is_active`]="{ item }">
            <v-checkbox
              v-model="item.is_active"
              :value="item.is_active"
              @change="updateIsActive(item, $event)"
            ></v-checkbox>
          </template>
        </v-data-table>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MaterialCard from "@/components/material/Card";
import templateMessagesService from "@/services/api/templateMessages";
import botsService from "@/services/api/bots";

export default {
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  components: {
    MaterialCard,
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Crear plantilla" : "Editar plantilla";
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  data() {
    return {
      bots: [],
      selectedBot: null,
      templateMessages: [],
      loadingButton: false,
      editedItem: {},
      defaultItem: {},
      dialog: false,
      editedIndex: -1,
      headers: [
        {
          text: "Nombre",
          align: "left",
          sortable: false,
          value: "name",
        },
        {
          text: "Estado",
          align: "left",
          sortable: false,
          value: "status",
        },
        { text: "¿Activo?", value: "is_active", sortable: false },
      ],
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize(selectedBot) {
      this.selectedBot = selectedBot;
      if (!this.selectedBot) {
        this.bots = (
          await botsService.list({
            platform: "whatsapp",
            companies: [ this.$store.getters["authModule/getCurrentCompany"].company._id ],
          })
        ).data.payload;
        this.selectedBot = this.bots.length > 0 ? this.bots[0] : null;
      }
      let responses = await Promise.all([
        templateMessagesService.list({
          botId: this.selectedBot._id,
          sort: "name",
          order: "1",
        }),
      ]);
      this.templateMessages = responses[0].data.payload;
      // leyendo plantillas de api facebook
      if (this.selectedBot) {
        let res = await axios.get("/api/graph-api/whatsapp/message-templates", {
          params: { botId: this.selectedBot._id },
        });
        let templates = res.data.payload;
        // check if has to sync
        let hasToSync = false;
        for (const template of templates) {
          let index = this.templateMessages.findIndex(
            (item) => item.name == template.name
          );
          if (index == -1) {
            hasToSync = true;
            // create
            await templateMessagesService.create({
              ...template,
              external_id: template.id,
              botId: this.selectedBot._id,
            });
          } else if (this.templateMessages[index].status != template.status) {
            // update
            await templateMessagesService.update(
              this.templateMessages[index]._id,
              { status: template.status }
            );
          }
        }
        if (hasToSync) {
          this.initialize(this.selectedBot);
        }
      }
    },
    close() {
      this.dialog = false;
      this.currentView = null;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    async save() {},
    async deleteItem(item) {
      const index = this.audiences.indexOf(item);
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        axios.delete("/api/graph-api/audiences/" + item.external_id);
        // eliminando de sistema
        this.$store.dispatch("facebookAudiences" + "Module/delete", item._id);
        this.audiences.splice(index, 1);
      }
    },
    editItem(item) {
      this.editedIndex = this.audiences.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    updateIsActive(item, status) {
      item.is_active = !!status;
      templateMessagesService.update(item._id, item);
    },
  },
};
</script>

<style lang="scss" scoped>
</style>