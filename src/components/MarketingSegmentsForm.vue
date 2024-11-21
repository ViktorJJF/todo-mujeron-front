<template>
  <v-card>
    <v-card-title>
      <v-icon color="primary" class="mr-1">mdi-update</v-icon>
      <span class="headline">{{ formTitle }}</span>
    </v-card-title>
    <v-divider></v-divider>
    <ValidationObserver ref="obs" v-slot="{ passes }">
      <v-container v-if="!isFinalStep" class="pa-5">
        <v-row>
          <v-col v-if="!activatePreview" cols="12" sm="12" md="12">
            <span class="font-weight-bold">Nombre del segmento</span>
            <VTextFieldWithValidation
              rules="required"
              v-model="editedItem.name"
              label="Nombre"
            />
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold" style="display:block;"
              >Tipo de segmento:</span
            >
            <v-radio-group
              style="display:inline-block;"
              v-model="editedItem.type"
            >
              <v-radio label="Estático" value="static"></v-radio>
              <v-radio label="Dinámico" value="dynamic"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">Etiquetas</span>
            <TodofullLabelsSelector
              :initialData="initialTodofullLabels"
              @onSelectTodofullLabels="onSelectTodofullLabels"
            ></TodofullLabelsSelector>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">Excluir etiquetas</span>
            <TodofullLabelsSelector
              :initialData="initialExcludeTodofullLabels"
              @onSelectTodofullLabels="onSelectEcludeTodofullLabels"
            ></TodofullLabelsSelector>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Sobre ID Genial</span>
            <v-checkbox
              v-model="editedItem.filters.includeWithIDGenial"
              label="Incluir leads con ID Genial"
            ></v-checkbox>
            <v-checkbox
              v-model="editedItem.filters.includeWithoutIDGenial"
              label="Incluir leads sin ID Genial"
            ></v-checkbox>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Email</span>
            <v-checkbox
              v-model="editedItem.filters.includeWithEmail"
              label="Incluir leads con email (Mailchimp)"
            ></v-checkbox>
            <v-checkbox
              v-model="editedItem.filters.includeWithoutEmail"
              label="Incluir leads sin email (Mailchimp)"
            ></v-checkbox>
          </v-col>
          <v-col cols="12" sm="6" md="6">
            <span class="font-weight-bold">Otros filtros</span>
            <v-checkbox
              v-model="editedItem.filters.includeWithChats"
              label="Incluir leads con chats"
            ></v-checkbox>
            <v-checkbox
              v-model="editedItem.filters.includeWithSales"
              label="Incluir leads con ventas"
            ></v-checkbox>
            <span>Min Ventas</span>
            <v-text-field
              clearable
              dense
              single-line
              outlined
              hide-details="auto"
              type="number"
              v-model="editedItem.filters.minSaleOrderCount"
            ></v-text-field>
            <span>Min TPV</span>
            <v-text-field
              clearable
              dense
              single-line
              outlined
              hide-details="auto"
              type="number"
              v-model="editedItem.filters.minPosOrderCount"
            ></v-text-field>
            <span>Min Ventas + TPV</span>
            <v-text-field
              clearable
              dense
              single-line
              outlined
              hide-details="auto"
              type="number"
              v-model="editedItem.filters.minSalePosOrderCount"
            ></v-text-field>
            <span>Equipos de ventas</span>
            <v-select
              dense
              hide-details
              placeholder="Selecciona equipos de ventas"
              outlined
              :items="odooValues.teamValues"
              v-model="editedItem.filters.salesTeams"
              multiple
            ></v-select>
            <span>Calificación de RFM</span>
            <v-select
              dense
              hide-details
              placeholder="Selecciona RFM"
              outlined
              :items="odooValues.rfmValues"
              v-model="editedItem.filters.rfmScores"
              multiple
            ></v-select>
          </v-col>
          <div class="campaign-filter-container">
            <div class="campaign-filter-group">
              <span class="font-weight-bold">Interacción con la campaña</span>
              <v-select
                dense
                hide-details
                placeholder="Selecciona interacción"
                outlined
                :items="[
                  {text: 'Se envió', value: 'sent'},
                  {text: 'No se envió', value: 'not_sent'},
                  {text: 'Se ha abierto', value: 'opened'},
                  {text: 'No se ha abierto', value: 'not_opened'},
                  {text: 'Se ha contestado', value: 'replied'},
                  {text: 'No se ha contestado', value: 'not_replied'},
                  {text: 'Se ha hecho clic', value: 'clicked'},
                  {text: 'No se ha hecho clic', value: 'not_clicked'}
                ]"
                v-model="editedItem.filters.campaignInteraction"
                @change="onInteractionChange"
                class="campaign-select"
              ></v-select>

              <template v-if="editedItem.filters.campaignInteraction">
                <div class="nested-filter">
                  <div class="nested-item">
                    <span class="font-weight-bold mt-3">Campaña</span>
                    <v-select
                      dense
                      hide-details
                      placeholder="Cualquier campaña"
                      outlined
                      :items="campaignOptions"
                      v-model="editedItem.filters.campaignFilter.type"
                      @change="onCampaignSelectionChange"
                      class="campaign-select"
                    ></v-select>
                  </div>

                  <div v-if="editedItem.filters.campaignFilter.type === 'is'" class="nested-item deeper">
                    <span class="font-weight-bold mt-3">Seleccionar campañas</span>
                    <v-select
                      dense
                      hide-details
                      placeholder="Selecciona campañas"
                      outlined
                      :items="marketingCampaigns"
                      v-model="editedItem.filters.campaignFilter.campaigns"
                      item-value="_id"
                      item-text="name"
                      multiple
                      chips
                      class="campaign-select"
                    ></v-select>
                  </div>

                  <div v-if="isTimeIntervalEnabled" class="nested-item">
                    <span class="font-weight-bold mt-3">Intervalo de tiempo</span>
                    <v-select
                      dense
                      hide-details
                      placeholder="Selecciona intervalo"
                      outlined
                      :items="[
                        {text: 'Cualquier momento', value: 'any_time'},
                        {text: 'Último mes', value: 'last_month'},
                        {text: 'Últimos 3 meses', value: 'last_3_months'},
                        {text: 'Últimos 6 meses', value: 'last_6_months'},
                        {text: 'Último año', value: 'last_year'}
                      ]"
                      v-model="editedItem.filters.campaignFilter.timeInterval"
                      class="campaign-select"
                    ></v-select>
                  </div>
                </div>
              </template>
            </div>
          </div>
          <v-col v-if="!activatePreview" cols="12" sm="12">
            <span class="font-weight-bold">Descripción</span>
            <v-textarea
              placeholder="descripcion"
              outlined
              v-model="editedItem.description"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-container>
      <v-container v-else class="pa-5">
        <v-card-title class="text-h5">
          ¿Cómo te gustaría llamar a tu nuevo segmento?
        </v-card-title>
        <VTextFieldWithValidation rules="required" v-model="editedItem.name" />
        <p class="mt-2">
          Estas guardando un segmento con los siguientes criterios
        </p>
        <div>
          <b>Etiquetas: </b>
          <v-chip
            v-for="label in editedItem.todofullLabels"
            color="primary"
            :key="label._id"
          >
            <strong>{{ label.name }}</strong>
          </v-chip>
        </div>
        <!-- <div><b>Desde: </b>{{ editedItem.dateFrom }}</div>
        <div><b>Hasta: </b>{{ editedItem.dateTo }}</div> -->
      </v-container>
      <v-card-actions rd-actions>
        <div class="flex-grow-1"></div>
        <v-btn
          v-if="!activatePreview"
          :loading="loadingButton"
          color="success"
          @click="passes(save)"
          >Guardar</v-btn
        >
        <v-btn
          v-else
          :loading="loadingButton"
          color="secondary"
          @click="
            $emit('onPreview', {
              todofullLabels: editedItem.todofullLabels,
              botIds: editedItem.botIds,
            })
          "
          >Previsualizar</v-btn
        >
        <v-btn outlined color="error" text @click="$emit('onClose')"
          >Cancelar</v-btn
        >
      </v-card-actions>
    </ValidationObserver>
  </v-card>
</template>

<script>
const ENTITY = "marketingSegments"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import TodofullLabelsSelector from "@/components/TodofullLabelsSelector.vue";
export default {
  props: {
    editedIndex: {
      type: Number,
      default: -1,
    },
    editedItem: {
      type: Object,
      default: () => ({
        name: "",
        description: "",
        todofullLabels: [],
        filters: {
          includeWithEmail: true,
          includeWithoutEmail: true,
          includeWithChats: true,
          includeWithSales: false,
          includeWithIDGenial: true,
          includeWithoutIDGenial: true,
          minSaleOrderCount: 0,
          minPosOrderCount: 0,
          minSalePosOrderCount: 0,
          salesTeams: [],
          rfmScores: [],
          campaignInteraction: null,
          campaignFilter: {
            type: null,
            campaigns: [],
            timeInterval: 'any_time'
          }
        },
        botIds: [],
        type: "static",
      }),
    },
    activatePreview: {
      type: Boolean,
      default: false,
    },
    isFinalStep: {
      type: Boolean,
      default: false,
    },
    odooValues: {
      type: Object,
      default: () => ({
        rfmScores: [],
        salesTeams: [],
      }),
    },
    marketingCampaigns: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    VTextFieldWithValidation,
    TodofullLabelsSelector,
  },
  data() {
    return {
      menuFrom: false,
      menuTo: false,
      menuStartDate: false,
      menuEndDate: false,
      dialog: false,
      loadingButton: false,
      defaultItem: CLASS_ITEMS(),
      botIds: [1],
      disabled: false,
      campaignOptions: [
        {text: 'Cualquier campaña', value: 'any'},
        {text: 'Cualquiera de las cinco últimas campañas', value: 'last_5'},
        {text: 'Cualquiera de las 10 últimas campañas', value: 'last_10'},
        {text: 'Cualquiera de las 20 últimas campañas', value: 'last_20'},
        {text: 'Cualquiera de las 50 últimas campañas', value: 'last_50'},
        {text: 'Todas las cinco últimas campañas', value: 'all_last_5'},
        {text: 'Todas las 10 últimas campañas', value: 'all_last_10'},
        {text: 'Todas las 20 últimas campañas', value: 'all_last_20'},
        {text: 'Todas las 50 últimas campañas', value: 'all_last_50'},
        {text: 'Es', value: 'is'},
        {text: 'No es', value: 'is_not'}
      ],
      isTimeIntervalEnabled: true
    };
  },
  async mounted() {
    // getting segments
    await Promise.all([
      this.$store.dispatch("botsModule/list", { platform: "whatsapp" }),
    ]);
    this.botIds = this.$store.state.botsModule.bots;
    this.editedItem.botIds = this.botIds.map((bot) => bot._id);
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? this.$t(this.entity + ".NEW_ITEM")
        : this.$t(this.entity + ".EDIT_ITEM");
    },
    entity() {
      return ENTITY;
    },
    initialTodofullLabels() {
      return this.editedIndex === -1 ? [] : this.editedItem.todofullLabels;
    },
    initialExcludeTodofullLabels() {
      return this.editedIndex === -1
        ? []
        : this.editedItem.excludeTodofullLabels;
    },
  },
  methods: {
    onSelectTodofullLabels(selectedLabels) {
      this.editedItem.todofullLabels = selectedLabels;
    },
    onSelectEcludeTodofullLabels(selectedLabels) {
      this.editedItem.excludeTodofullLabels = selectedLabels;
    },
    async save() {
      this.loadingButton = true;
      if (this.editedIndex > -1) {
        try {
          await this.$store.dispatch(ENTITY + "Module/update", {
            id: this.editedItem._id,
            data: this.editedItem,
          });
        } finally {
          this.loadingButton = false;
        }
      } else {
        this.editedItem.company = this.$store.getters["authModule/getCurrentCompany"].company._id;
        try {
          await this.$store.dispatch(ENTITY + "Module/create", this.editedItem);
        } finally {
          this.loadingButton = false;
        }
      }
      this.$emit("onSave");
    },
    onInteractionChange(value) {
      this.$set(this.editedItem.filters, 'campaignInteraction', value);
      
      if (!value) {
        this.$set(this.editedItem.filters.campaignFilter, 'type', null);
        this.$set(this.editedItem.filters.campaignFilter, 'campaigns', []);
        this.$set(this.editedItem.filters.campaignFilter, 'timeInterval', 'any_time');
      }
    },
    onCampaignSelectionChange(value) {
      if (value !== 'is') {
        this.$set(this.editedItem.filters.campaignFilter, 'campaigns', []);
      }
    }
  },
  watch: {
    'editedItem.filters.campaignFilter': {
      deep: true,
      handler() {
        // This watcher will trigger whenever any nested property of campaignFilter changes
        console.log('Campaign filter updated:', this.editedItem.filters.campaignFilter);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.campaign-filter-container {
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 3px 0;
  width: 50%;
}

.campaign-filter-group {
  .campaign-select {
    margin-top: 4px;
  }
}

.nested-filter {
  margin-left: 24px;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    left: -16px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #e0e0e0;
  }
}

.nested-item {
  position: relative;
  padding: 8px 0 8px 16px;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 20px;
    width: 24px;
    height: 2px;
    background-color: #e0e0e0;
  }

  &.deeper {
    margin-left: 16px;
  }
}

.font-weight-bold {
  display: block;
  margin-bottom: 4px;
  color: rgba(0, 0, 0, 0.87);
}
</style>
