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
            <span class="font-weight-bold" style="display: block"
              >Tipo de segmento:</span
            >
            <v-radio-group
              style="display: inline-block"
              v-model="editedItem.type"
            >
              <v-radio label="Estático" value="static"></v-radio>
              <v-radio label="Dinámico" value="dynamic"></v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12" sm="12" md="12" v-if="initialTodofullLabels && initialTodofullLabels.length > 0">
            <span class="font-weight-bold">Etiquetas (Antiguo)</span>
            <TodofullLabelsSelector
              :initialData="initialTodofullLabels"
              @onSelectTodofullLabels="onSelectTodofullLabels"
            ></TodofullLabelsSelector>
          </v-col>
          <v-col cols="12" sm="12" md="12" v-if="initialExcludeTodofullLabels && initialExcludeTodofullLabels.length > 0">
            <span class="font-weight-bold">Excluir etiquetas (Antiguo)</span>
            <TodofullLabelsSelector
              :initialData="initialExcludeTodofullLabels"
              @onSelectTodofullLabels="onSelectEcludeTodofullLabels"
            ></TodofullLabelsSelector>
          </v-col>
          <v-col cols="12" sm="12" md="12">
            <span class="font-weight-bold">Filtros de etiquetas</span>

            <div
              v-for="(group, groupIndex) in editedItem.todofullLabelsFilter
                .groups"
              :key="groupIndex"
              class="label-group mb-4"
            >
              <div
                v-for="(condition, condIndex) in group.conditions"
                :key="condIndex"
                class="condition-row mb-2"
              >
                <div class="d-flex align-center">
                  <v-select
                    dense
                    hide-details
                    class="mr-2"
                    style="width: 150px"
                    placeholder="Tipo"
                    outlined
                    :items="[
                      { text: 'Tiene', value: 'include' },
                      { text: 'No tiene', value: 'exclude' },
                    ]"
                    v-model="condition.type"
                  ></v-select>
                  <TodofullLabelsSelector
                    :initialData="condition.labels"
                    @onSelectTodofullLabels="
                      (labels) =>
                        onSelectConditionLabels(groupIndex, condIndex, labels)
                    "
                    class="flex-grow-1"
                    :maxElements="1"
                  ></TodofullLabelsSelector>
                  <v-btn
                    icon
                    color="error"
                    @click="removeCondition(groupIndex, condIndex)"
                    class="ml-2"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>

              <div class="group-actions mt-2">
                <v-btn
                  text
                  color="primary"
                  @click="addCondition(groupIndex)"
                  class="mr-2"
                >
                  <v-icon left>mdi-plus</v-icon>
                  Añadir "Y"
                </v-btn>
              </div>
            </div>

            <div class="mt-4">
              <v-btn outlined color="primary" @click="addOrGroup" class="mr-2">
                <v-icon left>mdi-plus</v-icon>
                Añadir "O"
              </v-btn>
            </div>
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
            <span v-if="editedItem.filters.minSaleOrderCount">Min Ventas</span>
            <v-text-field
              v-if="editedItem.filters.minSaleOrderCount"
              clearable
              dense
              single-line
              outlined
              hide-details="auto"
              type="number"
              v-model="editedItem.filters.minSaleOrderCount"
            ></v-text-field>
            <span>Rango de ventas</span>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  clearable
                  dense
                  single-line
                  outlined
                  hide-details="auto"
                  type="number"
                  placeholder="Min"
                  v-model="editedItem.filters.saleOrderCountRange.min"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  clearable
                  dense
                  single-line
                  outlined
                  hide-details="auto"
                  type="number"
                  placeholder="Max"
                  v-model="editedItem.filters.saleOrderCountRange.max"
                ></v-text-field>
              </v-col>
            </v-row>
            <span v-if="editedItem.filters.minPosOrderCount">Min TPV</span>
            <v-text-field
              v-if="editedItem.filters.minPosOrderCount"
              clearable
              dense
              single-line
              outlined
              hide-details="auto"
              type="number"
              v-model="editedItem.filters.minPosOrderCount"
            ></v-text-field>

            <span>Rango de TPV</span>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  clearable
                  dense
                  single-line
                  outlined
                  hide-details="auto"
                  type="number"
                  placeholder="Min"
                  v-model="editedItem.filters.posOrderCountRange.min"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  clearable
                  dense
                  single-line
                  outlined
                  hide-details="auto"
                  type="number"
                  placeholder="Max"
                  v-model="editedItem.filters.posOrderCountRange.max"
                ></v-text-field>
              </v-col>
            </v-row>
            <span v-if="editedItem.filters.minSalePosOrderCount"
              >Min Ventas + TPV</span
            >
            <v-text-field
              v-if="editedItem.filters.minSalePosOrderCount"
              clearable
              dense
              single-line
              outlined
              hide-details="auto"
              type="number"
              v-model="editedItem.filters.minSalePosOrderCount"
            ></v-text-field>
            <span>Rango de Ventas + TPV</span>
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  clearable
                  dense
                  single-line
                  outlined
                  hide-details="auto"
                  type="number"
                  placeholder="Min"
                  v-model="editedItem.filters.salePosOrderCountRange.min"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  clearable
                  dense
                  single-line
                  outlined
                  hide-details="auto"
                  type="number"
                  placeholder="Max"
                  v-model="editedItem.filters.salePosOrderCountRange.max"
                ></v-text-field>
              </v-col>
            </v-row>
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
                  { text: 'Se envió', value: 'sent' },
                  { text: 'No se envió', value: 'not_sent' },
                  { text: 'Se ha abierto', value: 'opened' },
                  { text: 'No se ha abierto', value: 'not_opened' },
                  { text: 'Se ha contestado', value: 'replied' },
                  { text: 'No se ha contestado', value: 'not_replied' },
                ]"
                v-model="editedItem.filters.campaignInteraction"
                @change="onInteractionChange"
                class="campaign-select"
                clearable
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

                  <div
                    v-if="editedItem.filters.campaignFilter.type === 'is'"
                    class="nested-item deeper"
                  >
                    <span class="font-weight-bold mt-3"
                      >Seleccionar campañas</span
                    >
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
                    <span class="font-weight-bold mt-3"
                      >Intervalo de tiempo</span
                    >
                    <v-select
                      dense
                      hide-details
                      placeholder="Selecciona intervalo"
                      outlined
                      :items="[
                        { text: 'Cualquier momento', value: 'any_time' },
                        { text: 'Último mes', value: 'last_month' },
                        { text: 'Últimos 3 meses', value: 'last_3_months' },
                        { text: 'Últimos 6 meses', value: 'last_6_months' },
                        { text: 'Último año', value: 'last_year' },
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
          saleOrderCountRange: {
            min: null,
            max: null,
          },
          posOrderCountRange: {
            min: null,
            max: null,
          },
          salePosOrderCountRange: {
            min: null,
            max: null,
          },
          salesTeams: [],
          rfmScores: [],
          campaignInteraction: null,
          campaignFilter: {
            type: null,
            campaigns: [],
            timeInterval: "any_time",
          },
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
        { text: "Cualquier campaña", value: "any" },
        { text: "Cualquiera de las cinco últimas campañas", value: "last_5" },
        { text: "Cualquiera de las 10 últimas campañas", value: "last_10" },
        { text: "Cualquiera de las 20 últimas campañas", value: "last_20" },
        { text: "Cualquiera de las 50 últimas campañas", value: "last_50" },
        { text: "Es", value: "is" },
        { text: "No es", value: "is_not" },
      ],
      isTimeIntervalEnabled: true,
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
        this.editedItem.company =
          this.$store.getters["authModule/getCurrentCompany"].company._id;
        try {
          await this.$store.dispatch(ENTITY + "Module/create", this.editedItem);
        } finally {
          this.loadingButton = false;
        }
      }
      this.$emit("onSave");
    },
    onInteractionChange(value) {
      this.$set(this.editedItem.filters, "campaignInteraction", value);

      if (!value) {
        this.$set(this.editedItem.filters.campaignFilter, "type", null);
        this.$set(this.editedItem.filters.campaignFilter, "campaigns", []);
        this.$set(
          this.editedItem.filters.campaignFilter,
          "timeInterval",
          "any_time"
        );
      }
      // if campaignInteraction is null, remove all campaignFilter properties
      if (!value) {
        this.$set(this.editedItem.filters, "campaignFilter", {});
      }
    },
    onCampaignSelectionChange(value) {
      if (value !== "is") {
        this.$set(this.editedItem.filters.campaignFilter, "campaigns", []);
      }
    },
    addCondition(groupIndex) {
      this.editedItem.todofullLabelsFilter.groups[groupIndex].conditions.push({
        type: "include",
        labels: [],
      });
    },

    removeCondition(groupIndex, condIndex) {
      this.editedItem.todofullLabelsFilter.groups[groupIndex].conditions.splice(
        condIndex,
        1
      );

      // Remove group if it's empty and not the last one
      if (
        this.editedItem.todofullLabelsFilter.groups[groupIndex].conditions
          .length === 0 &&
        this.editedItem.todofullLabelsFilter.groups.length > 1
      ) {
        this.editedItem.todofullLabelsFilter.groups.splice(groupIndex, 1);
      }
    },

    addOrGroup() {
      this.editedItem.todofullLabelsFilter.groups.push({
        operator: "and",
        conditions: [
          {
            type: "include",
            labels: [],
          },
        ],
      });
    },

    onSelectConditionLabels(groupIndex, condIndex, selectedLabels) {
      this.$set(
        this.editedItem.todofullLabelsFilter.groups[groupIndex].conditions[
          condIndex
        ],
        "labels",
        selectedLabels
      );
    },
  },
  watch: {
    "editedItem.filters.campaignFilter": {
      deep: true,
      handler() {
        // This watcher will trigger whenever any nested property of campaignFilter changes
        console.log(
          "Campaign filter updated:",
          this.editedItem.filters.campaignFilter
        );
      },
    },
  },
  created() {
    // Initialize todofullLabelsFilter if it doesn't exist or is empty
    if (
      !this.editedItem.todofullLabelsFilter ||
      !this.editedItem.todofullLabelsFilter.groups
    ) {
      this.$set(this.editedItem, "todofullLabelsFilter", {
        operator: "or",
        groups: [
          {
            operator: "and",
            conditions: [],
          },
        ],
      });
    }
  },
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
    content: "";
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
    content: "";
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

.label-group {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  background-color: #f5f5f5;

  .group-header {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }

  .condition-row {
    background-color: white;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
  }

  .group-actions {
    border-top: 1px solid #e0e0e0;
    padding-top: 8px;
  }
}
</style>
