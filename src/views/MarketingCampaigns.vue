<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="98%"
        icon="mdi-cellphone-dock"
        color="primary"
        :title="$t(entity + '.TITLE')"
        :text="$t(entity + '.SUBTITLE')"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          hide-default-footer
          :headers="headers"
          :items="items"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :single-expand="singleExpand"
          :expanded.sync="expanded"
          item-key="_id"
          show-expand
          @click:row="getCleanleadsChunks"
        >
          <template v-slot:top>
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
            <v-container>
              <v-row>
                <v-col cols="12" sm="6"
                  ><v-btn
                    color="primary"
                    dark
                    class="mb-2"
                    v-show="rolPermisos['Write']"
                    @click.stop="dialogNewCampaign = true"
                    >Nueva campaña</v-btn
                  >
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12">
                  <span>
                    <strong>Mostrando:</strong>
                    {{
                      $store.state.itemsPerPage > items.length
                        ? $store.state.marketingCampaignsModule.total
                        : $store.state.itemsPerPage
                    }}
                    de
                    {{ $store.state.marketingCampaignsModule.total }} registros
                  </span>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
              <div class="w-full mt-2">
                <div
                  class="d-flex justify-space-between align-center mt-1 mb-3"
                >
                  <v-btn
                    color="secondary"
                    @click="openBulkScheduleDialog(item)"
                    v-if="item.chunks && item.chunks.length > 0"
                  >
                    <v-icon left>mdi-calendar-clock</v-icon>
                    Programar Todas las Tandas
                  </v-btn>
                  <v-btn
                    outlined
                    color="info"
                    class="ml-2"
                    @click="refreshCampaignItem(item)"
                    :loading="item.isRefreshing"
                    v-if="item.chunks && item.chunks.length > 0"
                    title="Refrescar detalle tandas"
                  >
                    <v-icon left>mdi-refresh</v-icon>
                    Refrescar Campaña
                  </v-btn>
                  <v-btn
                    color="warning"
                    class="ml-2"
                    @click="stopAllPendingCampaignsForItem(item)"
                    v-if="
                      item.chunks &&
                      item.chunks.length > 0 &&
                      hasScheduledChunks(item)
                    "
                    :loading="item.stoppingAllChunksLoading"
                  >
                    <v-icon left>mdi-stop-circle</v-icon>
                    Detener Tandas Programadas (Campaña)
                  </v-btn>
                </div>

                <div
                  class="d-flex justify-space-between align-center mt-1"
                  v-if="item.chunks && item.chunks.length > 0"
                >
                  <div>
                    <b>
                      Tandas de {{ item.chunkSize }} usuarios - Total:
                      {{ item.chunkPages }}
                      {{ item.chunkPages == 1 ? "tanda" : "tandas" }}
                    </b>
                  </div>
                  <div
                    class="mr-16 pr-16"
                    v-if="item.autoSendChunksSequentiallyOnStart"
                  >
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on }">
                        <span class="mr-2" v-on="on">
                          <v-icon>mdi-clock-outline</v-icon>
                          {{ item.millisecondsBetweenChunks }} ms
                        </span>
                      </template>
                      <span>
                        Tiempo entre cada tanda al presionar 'Iniciar'
                      </span>
                    </v-tooltip>
                    <v-btn
                      v-if="!timers[item._id]?.timer"
                      class="mr-2"
                      @click="startSendingCampaignsSequentially(item)"
                    >
                      <v-icon>mdi-play</v-icon>
                      Iniciar
                    </v-btn>
                    <v-btn
                      v-else
                      class="mr-2"
                      @click="pauseSendingCampaignsSequentially(item)"
                    >
                      <v-icon>mdi-pause</v-icon>
                      Pausar
                    </v-btn>
                  </div>
                </div>
                <v-list>
                  <v-list-item
                    v-for="(chunk, chunkIndex) in item.chunks"
                    :key="item._id + chunkIndex"
                  >
                    <v-list-item-action>
                      <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                          <v-btn
                            v-if="
                              getTandaProgrammedStatusPackage(item, chunkIndex)
                                .status === null ||
                              getTandaProgrammedStatusPackage(item, chunkIndex)
                                .status === PROGRAMMED_CHUNK_STATUSES.ERROR
                            "
                            @click="openScheduleDialog(item, chunk, chunkIndex)"
                            color="info"
                            small
                            v-on="on"
                            :disabled="
                              // This disabled check might still be useful for race conditions
                              isChunkSentOrProcessing(item, chunkIndex)
                            "
                          >
                            <v-icon>mdi-send</v-icon>
                          </v-btn>

                          <v-btn
                            v-if="
                              getTandaProgrammedStatusPackage(item, chunkIndex)
                                .status === PROGRAMMED_CHUNK_STATUSES.PENDING ||
                              getTandaProgrammedStatusPackage(item, chunkIndex)
                                .status === PROGRAMMED_CHUNK_STATUSES.PROCESSING
                            "
                            @click="
                              stopSpecificScheduledChunk(item, chunkIndex)
                            "
                            color="error"
                            small
                            v-on="on"
                            :loading="isStoppingChunk(item, chunkIndex)"
                          >
                            <v-icon>mdi-stop</v-icon>
                          </v-btn>
                        </template>
                        <span
                          >{{
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .status === PROGRAMMED_CHUNK_STATUSES.PENDING ||
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .status === PROGRAMMED_CHUNK_STATUSES.PROCESSING
                              ? "Detener Programación"
                              : "Enviar/Programar"
                          }}
                          Tanda {{ chunkIndex + 1 }}
                        </span>
                        <span
                          v-if="
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .status === PROGRAMMED_CHUNK_STATUSES.PENDING
                          "
                        >
                          ({{
                            getRelativeTime(
                              getTandaProgrammedStatusPackage(item, chunkIndex)
                                .scheduledDateTime
                            )
                          }})
                        </span>
                      </v-tooltip>
                    </v-list-item-action>
                    <v-list-item-content>
                      <div class="d-flex align-center">
                        <span
                          style="cursor: pointer"
                          @click="getChunkDetail(item, chunk, chunkIndex)"
                          >{{ "Tanda " + (chunkIndex + 1) }}</span
                        >
                        <programmed-chunk-status
                          v-if="
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .status
                          "
                          :status="
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .status
                          "
                          :error-message="
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .errorMessage
                          "
                          :error-phones="
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .errorPhones
                          "
                          :scheduled-date-time="
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .scheduledDateTime
                          "
                          class="ml-4"
                        />
                        <v-btn
                          v-if="
                            getTandaProgrammedStatusPackage(item, chunkIndex)
                              .status ===
                              PROGRAMMED_CHUNK_STATUSES.PROCESSING &&
                            !isStoppingChunk(item, chunkIndex)
                          "
                          icon
                          x-small
                          color="warning"
                          class="ml-2"
                          title="Detener procesamiento de tanda"
                          @click.stop="stopManuallyChunk(item, chunkIndex)"
                        >
                          <v-icon small>mdi-cancel</v-icon>
                        </v-btn>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </div>
            </td>
          </template>
          <template v-slot:[`item.action`]="{ item }">
            <!-- <v-btn
              class="mr-1 mb-1"
              color="primary"
              fab
              small
              dark
              @click="editItem(item)"
              v-if="rolPermisos['Edit']"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn> -->
            <v-btn color="error" fab small dark @click="deleteItem(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
          <template v-slot:no-data>
            <v-alert type="error" :value="true">{{
              $t(entity + ".NO_DATA")
            }}</v-alert>
          </template>
          <template v-slot:[`item.description`]="{ item }"
            ><span class="format-breaklines">
              {{ item.description }}
            </span></template
          >
          <template v-slot:[`item.updatedAt`]="{ item }">{{
            item.updatedAt | formatDate
          }}</template>
          <template v-slot:[`item.url`]="{ item }">
            <a :href="item.url" target="_blank"
              ><v-btn color="primary" small>Visitar</v-btn>
            </a>
          </template>
          <template v-slot:[`item.attributes`]="{ item }">
            <ul
              v-for="(attribute, attIndex) in item.attributes"
              :key="attIndex"
            >
              <li>
                <b>{{ attribute.name }}: </b>{{ attribute.options.join(",") }}
              </li>
            </ul>
          </template>
          <template v-slot:[`item.categories`]="{ item }">
            <ul
              v-for="(category, cattIndex) in item.categories"
              :key="cattIndex"
            >
              <li>{{ category.name }}</li>
            </ul>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status == 'Enviado'" color="success"
              >Enviado</v-chip
            >
            <v-chip v-else color="warning">Pendiente</v-chip>
          </template>
          <template v-slot:[`item.scheduleDateTime`]="{ item }">
            {{
              item.scheduleDateTime
                ? formatDate(item.scheduleDateTime)
                : "Sin fecha programada"
            }}
          </template>
          <template v-slot:[`item.segment`]="{ item }">
            {{ item.segment ? item.segment.name : "Sin segmento" }}
          </template>
          <template v-slot:[`item.template`]="{ item }">
            {{ item.template ? item.template.name : "Sin template" }}
          </template>
          <template v-slot:[`item.range`]="{ item }">
            {{ item.segmentCount }}
            {{
              item.segment && item.segment.type === "static" ? "(Estático)" : ""
            }}
          </template>
          <template v-slot:[`item.cost`]="{ item }">
            <span
              v-show="item.bot && item.bot.platform !== 'whatsapp_automated'"
              >$ {{ (item.segmentCount * 0.0757).toFixed(2) }}</span
            >
            <span
              v-show="
                (item.bot && item.bot.platform === 'whatsapp_automated') ||
                !item.bot
              "
            >
              Gratis
            </span>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > items.length
                ? $store.state.marketingCampaignsModule.total
                : $store.state.itemsPerPage
            }}
            de {{ $store.state.marketingCampaignsModule.total }} registros
          </span>
        </v-col>
        <div class="text-center pt-2">
          <v-pagination
            v-model="page"
            :length="$store.state.marketingCampaignsModule.totalPages"
            @input="initialize(page)"
          ></v-pagination>
        </div>
      </material-card>
    </v-row>
    <v-dialog v-model="dialogNewCampaign" max-width="700px">
      <v-card>
        <MarketingCampaignsForm
          @onSave="
            dialogNewCampaign = false;
            initialize();
          "
        ></MarketingCampaignsForm>
      </v-card>
    </v-dialog>
    <v-dialog v-model="isShowingDetail" max-width="700px">
      <v-card>
        <v-container fluid>
          <v-card-title>
            <span class="headline">Detalle</span>
          </v-card-title>
          <v-divider class="mb-3"></v-divider>
          <h3 v-if="!chunkDetail">Cargando datos...</h3>
          <ul v-else>
            <li v-for="(lead, index) in chunkDetail.leads" :key="index">
              {{ lead.telefono }}
            </li>
          </ul>
        </v-container>
      </v-card>
    </v-dialog>

    <!-- Dialog for scheduling chunks -->
    <v-dialog v-model="scheduleDialog.show" max-width="500px" eager>
      <v-card>
        <v-card-title class="headline primary white--text">
          Programar envío
        </v-card-title>
        <v-card-text class="pt-4">
          <p class="mb-4 text-h6">
            Programar envío de la
            <strong
              >Tanda
              {{
                scheduleDialog.chunkIndex != null
                  ? scheduleDialog.chunkIndex + 1
                  : ""
              }}</strong
            >
          </p>
          <v-radio-group v-model="scheduleDialog.type" row class="my-3">
            <v-radio value="now" label="Enviar ahora"></v-radio>
            <v-radio
              value="schedule"
              label="Programar para más tarde"
            ></v-radio>
          </v-radio-group>

          <!-- Inputs for scheduling - THIS SECTION SHOULD APPEAR when type is 'schedule' -->
          <div v-if="scheduleDialog.type === 'schedule'">
            <v-card outlined class="pa-4 mb-4">
              <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold"
                >Configurar tiempo de espera</v-card-title
              >
              <v-row align="center">
                <v-col cols="6">
                  <v-text-field
                    v-model="scheduleDialog.hours"
                    label="Horas"
                    type="number"
                    min="0"
                    max="23"
                    outlined
                    hide-details
                    dense
                    @input="validateScheduleInputs"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="scheduleDialog.minutes"
                    label="Minutos"
                    type="number"
                    min="0"
                    max="59"
                    outlined
                    hide-details
                    dense
                    @input="validateScheduleInputs"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              <div class="d-flex align-center">
                <v-icon color="info" class="mr-2"
                  >mdi-information-outline</v-icon
                >
                <span>
                  El envío se realizará en
                  <strong>{{ scheduleDialog.hours || "0" }}</strong>
                  {{ parseInt(scheduleDialog.hours) === 1 ? "hora" : "horas" }}
                  y
                  <strong>{{ scheduleDialog.minutes || "0" }}</strong>
                  {{
                    parseInt(scheduleDialog.minutes) === 1
                      ? "minuto"
                      : "minutos"
                  }}.
                </span>
              </div>
            </v-card>
            <v-alert
              v-if="isScheduleValid"
              color="primary"
              dense
              border="left"
              colored-border
              icon="mdi-clock-time-four-outline"
              class="mb-0"
            >
              <strong>Hora prevista de envío:</strong>
              {{ getScheduledTimeString }}
            </v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="closeScheduleDialog">
            CANCELAR
          </v-btn>
          <v-btn
            color="primary"
            :loading="scheduleDialog.loading"
            :disabled="scheduleDialog.type === 'schedule' && !isScheduleValid"
            @click="confirmScheduleChunk"
          >
            {{
              scheduleDialog.type === "now" ? "ENVIAR AHORA" : "PROGRAMAR ENVÍO"
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog for BULK scheduling chunks -->
    <v-dialog v-model="bulkScheduleDialog.show" max-width="600px" eager>
      <v-card>
        <v-card-title class="headline secondary white--text">
          <v-icon left dark>mdi-calendar-clock</v-icon>
          Programar Envío Secuencial de Todas las Tandas
        </v-card-title>
        <v-card-text class="pt-4">
          <p v-if="bulkScheduleDialog.item" class="mb-4 text-h6">
            Campaña: <strong>{{ bulkScheduleDialog.item.name }}</strong> ({{
              bulkScheduleDialog.item.chunks
                ? bulkScheduleDialog.item.chunks.length
                : 0
            }}
            tandas)
          </p>
          <v-radio-group v-model="bulkScheduleDialog.type" row class="my-3">
            <v-radio
              value="now"
              label="Enviar todas ahora secuencialmente"
            ></v-radio>
            <v-radio
              value="schedule"
              label="Programar envío secuencial con retraso acumulativo"
            ></v-radio>
          </v-radio-group>

          <!-- Inputs for 'Enviar todas ahora secuencialmente' -->
          <div v-if="bulkScheduleDialog.type === 'now'">
            <!-- Configuration View -->
            <div v-if="!bulkScheduleDialog.isBulkNowSending">
              <v-card outlined class="pa-4 mb-4">
                <v-card-title
                  class="px-0 pt-0 text-subtitle-1 font-weight-bold"
                >
                  Configurar envío inmediato secuencial
                </v-card-title>
                <v-text-field
                  v-model="
                    bulkScheduleDialog.millisecondsBetweenChunksForBulkNow
                  "
                  label="Tiempo entre tandas (ms)"
                  type="number"
                  min="0"
                  outlined
                  dense
                  @input="validateBulkScheduleInputs"
                  hint="Tiempo de espera en milisegundos entre el envío de cada tanda."
                  persistent-hint
                ></v-text-field>
              </v-card>
            </div>

            <!-- Progress View -->
            <div
              v-if="
                bulkScheduleDialog.isBulkNowSending &&
                bulkScheduleDialog.item &&
                bulkScheduleDialog.item.chunks
              "
            >
              <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold">
                Enviando Tandas...
              </v-card-title>
              <v-list dense style="max-height: 300px; overflow-y: auto">
                <v-list-item
                  v-for="(chunk, index) in bulkScheduleDialog.item.chunks"
                  :key="'bulk-send-progress-' + index"
                >
                  <v-list-item-icon class="mr-3">
                    <v-progress-circular
                      v-if="chunk._bulkSendStatus === 'sending'"
                      indeterminate
                      color="primary"
                      size="20"
                    ></v-progress-circular>
                    <v-icon
                      v-if="chunk._bulkSendStatus === 'sent'"
                      color="success"
                      >mdi-check-circle</v-icon
                    >
                    <v-icon
                      v-if="chunk._bulkSendStatus === 'error'"
                      color="error"
                      >mdi-alert-circle</v-icon
                    >
                    <v-icon
                      v-if="chunk._bulkSendStatus === 'cancelled'"
                      color="warning"
                      >mdi-cancel</v-icon
                    >
                    <v-icon
                      v-if="chunk._bulkSendStatus === 'pending'"
                      color="grey"
                      >mdi-clock-outline</v-icon
                    >
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Tanda {{ index + 1 }}</v-list-item-title>
                    <v-list-item-subtitle
                      v-if="chunk._bulkSendStatus === 'error'"
                    >
                      Error: {{ chunk._bulkSendMessage }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-else-if="chunk._bulkSendStatus === 'sending'"
                    >
                      Enviando...
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-else-if="chunk._bulkSendStatus === 'sent'"
                    >
                      Solicitud de envío realizada.
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-else-if="chunk._bulkSendStatus === 'cancelled'"
                    >
                      {{ chunk._bulkSendMessage || "Cancelado." }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle v-else>
                      Pendiente...
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-alert
                v-if="
                  !bulkScheduleDialog.loading && allChunksProcessedInBulkNow
                "
                :type="
                  bulkScheduleDialog.item.chunks.some(
                    (c) => c._bulkSendStatus === 'error'
                  )
                    ? 'warning'
                    : 'success'
                "
                class="mt-3"
                dense
                outlined
              >
                {{
                  bulkScheduleDialog.item.chunks.some(
                    (c) => c._bulkSendStatus === "error"
                  )
                    ? "Proceso completado con errores."
                    : "Todas las tandas han sido procesadas."
                }}
              </v-alert>
            </div>
          </div>

          <!-- Inputs for 'Programar envío secuencial con retraso acumulativo' -->
          <div v-if="bulkScheduleDialog.type === 'schedule'">
            <v-card outlined class="pa-4 mb-4">
              <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold">
                Configurar retraso base para programación
              </v-card-title>
              <v-row align="center">
                <v-col cols="6">
                  <v-text-field
                    v-model="bulkScheduleDialog.baseDelayHours"
                    label="Horas de retraso base"
                    type="number"
                    min="0"
                    outlined
                    hide-details
                    dense
                    @input="validateBulkScheduleInputs"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="bulkScheduleDialog.baseDelayMinutes"
                    label="Minutos de retraso base"
                    type="number"
                    min="0"
                    max="59"
                    outlined
                    hide-details
                    dense
                    @input="validateBulkScheduleInputs"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
            </v-card>
            <v-alert
              v-if="
                isBulkBaseScheduleDelayValid &&
                bulkScheduleDialog.type === 'schedule'
              "
              color="primary"
              dense
              border="left"
              colored-border
              icon="mdi-clock-time-four-outline"
              class="mb-0"
            >
              <strong>Hora prevista de envío (primera tanda):</strong>
              {{ getBulkBaseScheduledTimeString }}
            </v-alert>
            <v-alert
              v-if="
                !isBulkBaseScheduleDelayValid &&
                bulkScheduleDialog.type === 'schedule'
              "
              color="warning"
              dense
              border="left"
              colored-border
              icon="mdi-alert-circle-outline"
              class="mb-0"
            >
              Debe ingresar un retraso mayor a 0 para programar.
            </v-alert>

            <!-- Lista de tandas con hora prevista -->
            <div
              v-if="
                bulkScheduleDialog.type === 'schedule' &&
                isBulkBaseScheduleDelayValid &&
                bulkScheduleDialog.item &&
                bulkScheduleDialog.item.chunks
              "
            >
              <v-divider class="my-3"></v-divider>
              <p class="text-subtitle-1 font-weight-bold">
                Horarios de envío por tanda:
              </p>
              <v-list dense>
                <v-list-item
                  v-for="(chunk, index) in bulkScheduleDialog.item.chunks"
                  :key="'bulk-schedule-chunk-' + index"
                >
                  <v-list-item-content>
                    <v-list-item-title>Tanda {{ index + 1 }}</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ getBulkChunkScheduledTimeString(index) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey darken-1"
            text
            @click="handleCloseOrCancelBulkDialog"
            :disabled="
              bulkScheduleDialog.type === 'now' &&
              bulkScheduleDialog.isBulkNowSending &&
              bulkScheduleDialog.loading
            "
          >
            {{ bulkDialogCloseButtonText }}
          </v-btn>
          <v-btn
            v-if="
              !(
                bulkScheduleDialog.type === 'now' &&
                bulkScheduleDialog.isBulkNowSending
              )
            "
            :color="bulkScheduleDialog.type === 'now' ? 'success' : 'primary'"
            :loading="
              bulkScheduleDialog.loading &&
              !(
                bulkScheduleDialog.type === 'now' &&
                bulkScheduleDialog.isBulkNowSending
              )
            "
            :disabled="getConfirmBulkDisabledState()"
            @click="confirmBulkSchedule"
          >
            {{
              bulkScheduleDialog.type === "now"
                ? "ENVIAR TODAS AHORA"
                : "PROGRAMAR ENVÍOS"
            }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
//Nota: Modifica los campos de la tabla
const ENTITY = "marketingCampaigns"; // nombre de la entidad en minusculas (se repite en services y modules del store)
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);
// const ITEMS_SPANISH = 'marcas';
import { format } from "date-fns";
import { buildSuccess } from "@/utils/utils.js";
import MaterialCard from "@/components/material/Card";
import auth from "@/services/api/auth";
import { es } from "date-fns/locale";
import MarketingCampaignsForm from "@/components/MarketingCampaignsForm";
import marketingCampaignsService from "@/services/api/marketingCampaigns";
import ProgrammedChunkStatus from "@/components/common/ProgrammedChunkStatus.vue";
import { PROGRAMMED_CHUNK_STATUSES } from "@/services/api/marketingCampaigns";

export default {
  components: {
    MaterialCard,
    MarketingCampaignsForm,
    ProgrammedChunkStatus,
  },
  filters: {
    formatDate: function (value) {
      return format(
        new Date(value),
        "d 'de' MMMM 'del' yyyy 'a las' hh:mm:ss aaa",
        {
          locale: es,
        }
      );
    },
  },
  data: () => ({
    chunkDetail: null,
    isShowingDetail: false,
    expanded: [],
    singleExpand: false,
    dialogNewCampaign: false,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    fieldsToSearch: ["name"],
    search: "",
    dialog: false,
    headers: [
      {
        text: "Nombre de la campaña",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Segmento",
        align: "left",
        sortable: false,
        value: "segment",
      },
      {
        text: "Template",
        align: "left",
        sortable: false,
        value: "templateMessage",
      },
      {
        text: "Alcance leads",
        align: "left",
        sortable: false,
        value: "range",
      },
      {
        text: "Costo",
        align: "left",
        sortable: false,
        value: "cost",
      },
      {
        text: "Fecha",
        align: "left",
        sortable: false,
        value: "scheduleDateTime",
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "status",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    [ENTITY]: [],
    advisors: [],
    editedIndex: -1,
    editedItem: CLASS_ITEMS(),
    defaultItem: CLASS_ITEMS(),
    menu1: false,
    menu2: false,
    rolPermisos: {},
    timers: {},
    stoppingAllGlobally: false, // for global stop button loading state
    stoppingChunkStates: {}, // To track loading state for individual chunk stops e.g. { 'campaignId_chunkIndex': true }
    PROGRAMMED_CHUNK_STATUSES: PROGRAMMED_CHUNK_STATUSES, // Make constants available in the template
    scheduleDialog: {
      show: false,
      type: "schedule",
      hours: "0",
      minutes: "15",
      chunkIndex: null,
      item: null,
      chunk: null,
      loading: false,
    },
    bulkScheduleDialog: {
      // New data property for bulk scheduling
      show: false,
      type: "schedule", // 'now' or 'schedule'
      millisecondsBetweenChunksForBulkNow: "1000", // For 'now' type
      baseDelayHours: "0", // For 'schedule' type
      baseDelayMinutes: "15", // For 'schedule' type
      item: null,
      loading: false,
      isBulkNowSending: false, // Added for bulk "now" sending UI state
    },
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
    getScheduledTimeString() {
      if (!this.scheduleDialog.show) return ""; // Prevent computation if not shown
      const now = new Date();
      const futureTime = new Date(
        now.getTime() +
          parseInt(this.scheduleDialog.hours || 0) * 60 * 60 * 1000 +
          parseInt(this.scheduleDialog.minutes || 0) * 60 * 1000
      );
      return format(futureTime, "dd/MM/yyyy HH:mm", { locale: es });
    },
    isScheduleValid() {
      const hours = parseInt(this.scheduleDialog.hours || 0);
      const minutes = parseInt(this.scheduleDialog.minutes || 0);
      return hours > 0 || minutes > 0;
    },
    // New computed properties for bulk schedule dialog
    getBulkBaseScheduledTimeString() {
      if (
        this.bulkScheduleDialog.type !== "schedule" ||
        !this.bulkScheduleDialog.show
      )
        return "";
      const now = new Date();
      const futureTime = new Date(
        now.getTime() +
          parseInt(this.bulkScheduleDialog.baseDelayHours || 0) *
            60 *
            60 *
            1000 +
          parseInt(this.bulkScheduleDialog.baseDelayMinutes || 0) * 60 * 1000
      );
      return format(futureTime, "dd/MM/yyyy HH:mm", { locale: es });
    },
    isBulkBaseScheduleDelayValid() {
      if (this.bulkScheduleDialog.type !== "schedule") return true;
      const hours = parseInt(this.bulkScheduleDialog.baseDelayHours || 0);
      const minutes = parseInt(this.bulkScheduleDialog.baseDelayMinutes || 0);
      return hours > 0 || minutes > 0;
    },
    isBulkNowScheduleDelayValid() {
      if (this.bulkScheduleDialog.type !== "now") return true;
      const delay = parseInt(
        this.bulkScheduleDialog.millisecondsBetweenChunksForBulkNow || "0"
      );
      return !isNaN(delay) && delay >= 0;
    },
    hasScheduledChunks() {
      // Utility to check if an item has any chunks that are actively scheduled or processing by backend
      return (item) => {
        if (!item || !item.scheduledChunks) return false;
        return Object.values(item.scheduledChunks).some((scheduledChunk) => {
          if (!scheduledChunk || !scheduledChunk.status) return false;
          // These statuses are set in _processCampaignItem based on backend data
          // and represent states where a campaign-level stop might be relevant.
          return (
            scheduledChunk.status === "scheduled" || // Programmed for future
            scheduledChunk.status === "past_due_schedule" || // Programmed for past, not yet processed by backend
            scheduledChunk.status === "processing_by_backend" || // Actively being sent/processed by backend
            scheduledChunk.status === "scheduled_pending_api" // UI requested schedule, potentially waiting for backend action or confirmation
          );
        });
      };
    },
    allChunksProcessedInBulkNow() {
      if (
        !this.bulkScheduleDialog.item ||
        !this.bulkScheduleDialog.item.chunks ||
        !this.bulkScheduleDialog.isBulkNowSending
      ) {
        return false;
      }
      return this.bulkScheduleDialog.item.chunks.every(
        (chunk) =>
          chunk._bulkSendStatus === "sent" || chunk._bulkSendStatus === "error"
      );
    },
    bulkDialogCloseButtonText() {
      if (
        this.bulkScheduleDialog.type === "now" &&
        this.bulkScheduleDialog.isBulkNowSending
      ) {
        if (this.bulkScheduleDialog.loading) {
          // Sending in progress
          return "ENVIANDO..."; // Or consider this button a "Stop"
        } else {
          // Sending finished
          return "CERRAR";
        }
      }
      return "CANCELAR";
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
  beforeDestroy() {
    Object.keys(this.timers).forEach((itemId) => {
      if (this.timers[itemId]?.timer) {
        clearTimeout(this.timers[itemId].timer);
      }
      // Ensure any bulk timers are also cleared if they exist
      if (this.timers[itemId]?.bulkNowTimer) {
        clearTimeout(this.timers[itemId].bulkNowTimer);
      }
    });
  },
  methods: {
    _processCampaignItem(campaign) {
      // Initialize chunksPagesSent if it doesn't exist
      if (campaign.chunksPagesSent === undefined) {
        this.$set(campaign, "chunksPagesSent", []);
      }

      const existingScheduledChunks = campaign.scheduledChunks || {};
      // Ensure the campaign.scheduledChunks itself is reactive if it wasn't already.
      // And initialize with a copy of existing to preserve any UI state not from backend.
      this.$set(campaign, "scheduledChunks", { ...existingScheduledChunks });

      // Process programmedChunks from backend data
      if (
        campaign.programmedChunks &&
        Array.isArray(campaign.programmedChunks)
      ) {
        console.log(
          `Processing ${campaign.programmedChunks.length} programmedChunks for campaign ${campaign.name}`
        );
        const newScheduledChunksUpdates = {}; // Collect updates here
        for (const progChunk of campaign.programmedChunks) {
          const chunkIndex = progChunk.chunkPage - 1; // assuming chunkPage is 1-indexed
          if (chunkIndex >= 0) {
            console.log(
              `Processing progChunk ${progChunk.chunkPage} with status: ${progChunk.status}`,
              progChunk
            );
            const scheduledTime = progChunk.sendAt;
            const sendAtDate = new Date(scheduledTime);
            const now = new Date();
            let uiStatus;

            // Check status field and distinguish between successful send and partial errors
            if (progChunk.status === "sent") {
              uiStatus = "sent_by_backend";
              if (!campaign.chunksPagesSent.includes(progChunk.chunkPage)) {
                campaign.chunksPagesSent.push(progChunk.chunkPage);
              }
            } else if (progChunk.status === "sent_with_some_errors") {
              console.log(
                `Found sent_with_some_errors for chunk ${progChunk.chunkPage}, setting uiStatus to sent_with_some_errors_by_backend`
              );
              uiStatus = "sent_with_some_errors_by_backend";
              if (!campaign.chunksPagesSent.includes(progChunk.chunkPage)) {
                campaign.chunksPagesSent.push(progChunk.chunkPage);
              }
            } else if (progChunk.status === "processing") {
              uiStatus = "processing_by_backend";
            } else if (
              progChunk.status === "scheduled" ||
              progChunk.status === "pending"
            ) {
              if (sendAtDate > now) {
                uiStatus = "scheduled";
              } else {
                // Scheduled in the past, but not sent/processing by backend yet
                uiStatus = "past_due_schedule";
              }
            } else if (
              progChunk.status === "error" ||
              progChunk.status === "failed"
            ) {
              uiStatus = "error";
              // Don't add error chunks to chunksPagesSent - they should be retryable
              const sentIndex = campaign.chunksPagesSent.indexOf(progChunk.chunkPage);
              if (sentIndex > -1) {
                campaign.chunksPagesSent.splice(sentIndex, 1);
              }
            } else {
              // Default case - check by date if no clear status
              if (sendAtDate > now) {
                uiStatus = "scheduled";
              } else {
                uiStatus = "past_due_schedule";
              }
            }

            console.log(
              `Chunk ${progChunk.chunkPage} final uiStatus: ${uiStatus}`
            );

            // Prepare the update for this specific chunkIndex
            newScheduledChunksUpdates[chunkIndex] = {
              // Preserve existing UI-specific values (like user-set delayHours/Minutes) if they exist
              // and overwrite with backend data where appropriate.
              ...(campaign.scheduledChunks[chunkIndex] || {}), // Spread existing state for this chunk first
              scheduledTime: scheduledTime,
              status: uiStatus,
              errorMessage: progChunk.errorMessage || null,
              lastRealError: progChunk.lastRealError || null,
              errorPhones: progChunk.errorPhones || null,
              // If progChunk provides these, use them, otherwise keep existing or undefined
              delayHours:
                progChunk.delayHours !== undefined
                  ? progChunk.delayHours
                  : campaign.scheduledChunks[chunkIndex]
                  ? campaign.scheduledChunks[chunkIndex].delayHours
                  : undefined,
              delayMinutes:
                progChunk.delayMinutes !== undefined
                  ? progChunk.delayMinutes
                  : campaign.scheduledChunks[chunkIndex]
                  ? campaign.scheduledChunks[chunkIndex].delayMinutes
                  : undefined,
            };
          }
        }
        console.log(
          "Final newScheduledChunksUpdates:",
          newScheduledChunksUpdates
        );
        console.log("Final chunksPagesSent:", campaign.chunksPagesSent);
        // Apply all collected updates to campaign.scheduledChunks reactively
        // This ensures we don't lose other chunkIndexes that weren't in programmedChunks
        this.$set(campaign, "scheduledChunks", {
          ...campaign.scheduledChunks,
          ...newScheduledChunksUpdates,
        });
      } else if (campaign.scheduledChunks === undefined) {
        // Ensure scheduledChunks object exists even if no programmedChunks
        this.$set(campaign, "scheduledChunks", {});
      }

      // Calculate chunk pages considering both current segment/chunk size and existing programmed chunks
      const segmentCount = campaign.segmentCount || 0;
      const chunkSize = campaign.chunkSize || segmentCount;
      let chunkPages = chunkSize > 0 ? Math.ceil(segmentCount / chunkSize) : 0;
      if (segmentCount > 0 && chunkPages === 0 && chunkSize > 0) chunkPages = 1;

      // Consider existing programmed chunks to ensure we don't lose chunks that were created previously
      if (
        campaign.programmedChunks &&
        Array.isArray(campaign.programmedChunks) &&
        campaign.programmedChunks.length > 0
      ) {
        const maxProgrammedChunkPage = Math.max(
          ...campaign.programmedChunks.map((pc) => pc.chunkPage)
        );
        chunkPages = Math.max(chunkPages, maxProgrammedChunkPage);
      }

      this.$set(campaign, "chunkPages", chunkPages);

      // Initialize or update UI chunks array (item.chunks)
      const currentUiChunksLength = campaign.chunks
        ? campaign.chunks.length
        : 0;
      if (currentUiChunksLength !== chunkPages || !campaign.chunks) {
        const newUiChunks = [];
        for (let i = 0; i < chunkPages; i++) {
          newUiChunks.push({}); // Add any default chunk properties if needed
        }
        this.$set(campaign, "chunks", newUiChunks);
      }

      // Ensure other reactive UI state properties are initialized if they don't exist
      if (campaign.stoppingAllChunksLoading === undefined) {
        this.$set(campaign, "stoppingAllChunksLoading", false);
      }
      if (campaign.isRefreshing === undefined) {
        this.$set(campaign, "isRefreshing", false);
      }
    },

    async refreshCampaignItem(item) {
      this.$set(item, "isRefreshing", true);
      try {
        // Use marketingCampaignsService.listOne directly instead of store dispatch
        const response = await marketingCampaignsService.listOne(item._id);
        // Extract the campaign data from the payload property
        const updatedItem = response.data.payload;

        if (updatedItem) {
          const index = this[ENTITY].findIndex(
            (campaign) => campaign._id === item._id
          );
          if (index !== -1) {
            // Preserve UI-specific states
            const preservedUiStates = {
              stoppingAllChunksLoading:
                this[ENTITY][index].stoppingAllChunksLoading,
              isRefreshing: true, // Keep refreshing true until finally
            };

            // Create a new object for the campaign to ensure reactivity
            const newCampaignData = { ...updatedItem, ...preservedUiStates };

            this.$set(this[ENTITY], index, newCampaignData);
            this._processCampaignItem(this[ENTITY][index]); // Process the updated item
            buildSuccess(
              `Campaña '${item.name}' actualizada.`,
              this.$store.commit
            );
          } else {
            buildSuccess(
              `Campaña ${item.name} no encontrada en lista local.`,
              this.$store.commit,
              "warning"
            );
          }
        } else {
          buildSuccess(
            `No se pudo obtener la campaña ${item.name}.`,
            this.$store.commit,
            "warning"
          );
        }
      } catch (error) {
        console.error(`Error refrescando campaña ${item._id}:`, error);
        buildSuccess(
          `Error refrescando campaña ${item.name}.`,
          this.$store.commit,
          "error"
        );
      } finally {
        const currentItemInList = this[ENTITY].find(
          (campaign) => campaign._id === item._id
        );
        if (currentItemInList) {
          this.$set(currentItemInList, "isRefreshing", false);
        } else {
          this.$set(item, "isRefreshing", false);
        }
      }
    },

    getTandaProgrammedStatusPackage(item, chunkIndex) {
      const statusPackage = {
        status: null,
        errorMessage: null,
        lastRealError: null,
        errorPhones: null,
        scheduledDateTime: null,
      };

      const scheduledChunkInfo =
        item.scheduledChunks && item.scheduledChunks[chunkIndex];

      // Check for error status first - this should take priority over sent status
      if (scheduledChunkInfo && (
        scheduledChunkInfo.status === "error" ||
        scheduledChunkInfo.status === "schedule_failed"
      )) {
        statusPackage.status = PROGRAMMED_CHUNK_STATUSES.ERROR;
        statusPackage.errorMessage = scheduledChunkInfo.errorMessage || "Error al procesar la tanda.";
        statusPackage.lastRealError = scheduledChunkInfo.lastRealError || null;
        statusPackage.errorPhones = scheduledChunkInfo.errorPhones;
        statusPackage.scheduledDateTime = scheduledChunkInfo.scheduledTime;
        return statusPackage;
      }

      if (
        item.chunksPagesSent &&
        item.chunksPagesSent.includes(chunkIndex + 1)
      ) {
        // Default to SENT, but check if there are errors to change to SENT_WITH_SOME_ERRORS
        statusPackage.status = PROGRAMMED_CHUNK_STATUSES.SENT;
        statusPackage.scheduledDateTime =
          scheduledChunkInfo && scheduledChunkInfo.scheduledTime
            ? scheduledChunkInfo.scheduledTime
            : new Date().toISOString();

        // Include error information and adjust status if there are errors
        if (scheduledChunkInfo) {
          statusPackage.errorMessage = scheduledChunkInfo.errorMessage;
          statusPackage.lastRealError = scheduledChunkInfo.lastRealError;
          statusPackage.errorPhones = scheduledChunkInfo.errorPhones;

          // If this chunk was sent with some errors, use the specific status
          if (
            scheduledChunkInfo.status === "sent_with_some_errors_by_backend"
          ) {
            statusPackage.status =
              PROGRAMMED_CHUNK_STATUSES.SENT_WITH_SOME_ERRORS;
          }
        }
        return statusPackage;
      }

      if (scheduledChunkInfo) {
        statusPackage.scheduledDateTime = scheduledChunkInfo.scheduledTime;
        statusPackage.errorMessage = scheduledChunkInfo.errorMessage;
        statusPackage.lastRealError = scheduledChunkInfo.lastRealError;
        statusPackage.errorPhones = scheduledChunkInfo.errorPhones;
        const backendStatus = scheduledChunkInfo.status;

        if (backendStatus === "sent_by_backend") {
          statusPackage.status = PROGRAMMED_CHUNK_STATUSES.SENT;
        } else if (backendStatus === "sent_with_some_errors_by_backend") {
          statusPackage.status =
            PROGRAMMED_CHUNK_STATUSES.SENT_WITH_SOME_ERRORS;
        } else if (
          backendStatus === "processing_by_backend" ||
          backendStatus === "scheduled_pending_api"
        ) {
          statusPackage.status = PROGRAMMED_CHUNK_STATUSES.PROCESSING;
        } else if (
          backendStatus === "scheduled" ||
          backendStatus === "past_due_schedule"
        ) {
          statusPackage.status = PROGRAMMED_CHUNK_STATUSES.PENDING;
        } else if (backendStatus === "schedule_failed" || backendStatus === "error") {
          statusPackage.status = PROGRAMMED_CHUNK_STATUSES.ERROR;
          statusPackage.errorMessage =
            scheduledChunkInfo.errorMessage ||
            scheduledChunkInfo.error ||
            "Error al programar la tanda.";
          statusPackage.lastRealError = scheduledChunkInfo.lastRealError;
        } else if (backendStatus === "stopped_by_user") {
          statusPackage.status = null;
        }
      }
      return statusPackage;
    },

    isChunkSentOrProcessing(item, chunkIndex) {
      if (
        item.chunksPagesSent &&
        item.chunksPagesSent.includes(chunkIndex + 1)
      ) {
        return true;
      }
      const scheduledChunk =
        item.scheduledChunks && item.scheduledChunks[chunkIndex];
      if (scheduledChunk) {
        return (
          scheduledChunk.status === "sent_by_backend" ||
          scheduledChunk.status === "sent_with_some_errors_by_backend" ||
          scheduledChunk.status === "processing_by_backend" ||
          scheduledChunk.status === "scheduled_pending_api"
        );
      }
      return false;
    },

    isChunkScheduled(item, chunkIndex) {
      return (
        item.scheduledChunks &&
        item.scheduledChunks[chunkIndex] &&
        (item.scheduledChunks[chunkIndex].status === "scheduled" ||
          item.scheduledChunks[chunkIndex].status === "past_due_schedule")
      );
    },

    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/Propiedades/Mailchimp",
          model: "Credenciales",
          company:
            this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize(page = 1) {
      let payload = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: "createdAt",
        order: "desc",
        companies: [
          this.$store.getters["authModule/getCurrentCompany"].company._id,
        ],
        includeCount: true,
      };
      this.$store.commit("loadingModule/showLoading"); // Show loading at the start
      await Promise.all([
        this.$store.dispatch(ENTITY + "Module/list", { ...payload }),
      ]);

      this[ENTITY] = this.$store.state[ENTITY + "Module"][ENTITY];
      for (const campaign of this[ENTITY]) {
        this._processCampaignItem(campaign);
      }
      this.$store.commit("loadingModule/showLoading", false); // Hide loading at the end
      this.rolAuth(); // Call rolAuth after initialize is done with data processing
    },

    editItem(item) {
      this.editedIndex = this[ENTITY].indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    async deleteItem(item) {
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch(ENTITY + "Module/delete", item._id);
        // Consider re-fetching or locally removing item after deletion
        await this.initialize(); // Or a more targeted removal
      }
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    async startSendingCampaignsSequentially(item, overrideDelayMs = null) {
      item.status = "Procesando";
      if (!item.chunksPagesSent) {
        this.$set(item, "chunksPagesSent", []);
      } else {
        item.chunksPagesSent = [];
      }

      if (this.timers[item._id] && this.timers[item._id].timer) {
        clearTimeout(this.timers[item._id].timer);
      }

      let chunkIndex = 0;
      this.timers[item._id] = {
        chunkIndex,
        timer: null,
        isPaused: false,
        currentDelay:
          overrideDelayMs !== null
            ? overrideDelayMs
            : item.millisecondsBetweenChunks || 0,
      };

      const sendNextChunk = () => {
        if (!this.timers[item._id] || this.timers[item._id].isPaused) {
          return;
        }

        if (chunkIndex < item.chunks.length) {
          if (!item.chunksPagesSent.includes(chunkIndex + 1)) {
            item.chunksPagesSent.push(chunkIndex + 1);
          }
          this.sendChunkCampaign(item, item.chunks[chunkIndex], chunkIndex);
          this.timers[item._id].chunkIndex = chunkIndex;
          this.timers[item._id].timer = setTimeout(() => {
            chunkIndex++;
            sendNextChunk();
          }, this.timers[item._id].currentDelay);
        } else {
          item.status = "Finalizado";
          if (this.timers[item._id]) {
            clearTimeout(this.timers[item._id].timer);
            this.timers[item._id].timer = null;
          }
        }
      };
      sendNextChunk();
    },

    async pauseSendingCampaignsSequentially(item) {
      item.status = "Pausado";
      if (this.timers[item._id]) {
        clearTimeout(this.timers[item._id].timer);
        this.timers[item._id].isPaused = true;
      }
    },

    async save() {
      this.loadingButton = true;
      this.editedItem.company =
        this.$store.getters["authModule/getCurrentCompany"].company._id;
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
        try {
          let newItem = await this.$store.dispatch(
            ENTITY + "Module/create",
            this.editedItem
          );
          this[ENTITY].push(newItem);
          this._processCampaignItem(newItem); // Process newly created item
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },

    formatDate(date) {
      try {
        let formatted = format(new Date(date), "MM/dd/yyyy 'a las' hh':'mm", {
          locale: es,
        });
        return formatted;
      } catch (error) {
        console.error(error);
        return "Fecha inválida";
      }
    },

    getCleanleadsChunks(el) {
      console.log("seleccionado: ", el);
    },

    sendChunkCampaign(item, chunk, chunkIndex, scheduleOptions = null) {
      chunk.isClicked = true;
      if (!item.chunksPagesSent) {
        this.$set(item, "chunksPagesSent", []);
      }
      if (!scheduleOptions || !scheduleOptions.isProgrammed) {
        if (!item.chunksPagesSent.includes(chunkIndex + 1)) {
          item.chunksPagesSent.push(chunkIndex + 1);
        }
        if (item.scheduledChunks && item.scheduledChunks[chunkIndex]) {
          this.$set(item.scheduledChunks[chunkIndex], "status", "sent"); // UI update
        }
      }

      marketingCampaignsService
        .sendChunk(
          chunkIndex + 1,
          item.chunkSize,
          item.segment,
          item._id,
          scheduleOptions
        )
        .then(() => {
          if (!scheduleOptions || !scheduleOptions.isProgrammed) {
            buildSuccess(
              `Tanda ${chunkIndex + 1} enviada/procesando.`,
              this.$store.commit
            );
          }
          // For programmed, success is handled in confirmScheduleChunk or bulk schedule
          // Potentially refresh item data after send/schedule operation
          // this.refreshCampaignItem(item);
        })
        .catch((error) => {
          console.error("Error sending/scheduling chunk:", error);
          buildSuccess(
            `Error procesando Tanda ${chunkIndex + 1}.`,
            this.$store.commit,
            "error"
          );
          if (!scheduleOptions || !scheduleOptions.isProgrammed) {
            const sentIndex = item.chunksPagesSent.indexOf(chunkIndex + 1);
            if (sentIndex > -1) {
              item.chunksPagesSent.splice(sentIndex, 1);
            }
            // Revert status if it was optimistically set to 'sent'
            if (
              item.scheduledChunks &&
              item.scheduledChunks[chunkIndex] &&
              item.scheduledChunks[chunkIndex].status === "sent"
            ) {
              // Decide how to revert: to 'scheduled' if it was, or clear. For now, let backend state on refresh handle it.
              // this.$delete(item.scheduledChunks[chunkIndex], 'status');
            }
          }
        });
    },

    openScheduleDialog(item, chunk, chunkIndex) {
      let hours = "0";
      let minutes = "15";

      const scheduledInfo =
        item.scheduledChunks && item.scheduledChunks[chunkIndex];
      if (scheduledInfo) {
        if (scheduledInfo.delayHours !== undefined) {
          hours = scheduledInfo.delayHours.toString();
        }
        if (scheduledInfo.delayMinutes !== undefined) {
          minutes = scheduledInfo.delayMinutes.toString();
        }
      }

      this.scheduleDialog = {
        show: true,
        type: "now", // Default to 'now'
        hours,
        minutes,
        chunkIndex,
        item,
        chunk,
        loading: false,
      };
    },

    confirmScheduleChunk() {
      const { item, chunk, chunkIndex, type, hours, minutes } =
        this.scheduleDialog;
      this.scheduleDialog.loading = true;

      if (type === "now") {
        this.sendChunkCampaign(item, chunk, chunkIndex, {
          isProgrammed: false,
        });
        // Optimistically update status for "Send Now" via getTandaProgrammedStatusPackage
        if (item.scheduledChunks && item.scheduledChunks[chunkIndex]) {
          this.$set(item.scheduledChunks[chunkIndex], "status", "sent"); // Or a processing status if backend is async
        } else if (item.scheduledChunks) {
          this.$set(item.scheduledChunks, chunkIndex, { status: "sent" });
        }
        if (!item.chunksPagesSent.includes(chunkIndex + 1)) {
          // Ensure chunksPagesSent is updated
          item.chunksPagesSent.push(chunkIndex + 1);
        }

        this.closeScheduleDialog(); // Close dialog first
        // this.refreshCampaignItem(item); // Optionally refresh to confirm backend state
      } else {
        // type === 'schedule'
        this.validateScheduleInputs();
        const hoursNum = parseInt(hours || 0);
        const minutesNum = parseInt(minutes || 0);

        if (!this.isScheduleValid) {
          // Use computed prop
          buildSuccess(
            "Por favor, ingrese un tiempo de retraso válido.",
            this.$store.commit,
            "warning"
          );
          this.scheduleDialog.loading = false;
          return;
        }

        const now = new Date();
        const delayMilliseconds =
          hoursNum * 60 * 60 * 1000 + minutesNum * 60 * 1000;
        const scheduledTime = new Date(now.getTime() + delayMilliseconds);

        const scheduleAPIOptions = {
          isProgrammed: true,
          currentTime: now.toISOString(),
          delayMilliseconds: delayMilliseconds,
          sendAt: scheduledTime.toISOString(),
        };

        if (!item.scheduledChunks) this.$set(item, "scheduledChunks", {});
        this.$set(item.scheduledChunks, chunkIndex, {
          scheduledTime: scheduledTime.toISOString(),
          status: "scheduled", // Optimistic UI update
          delayHours: hoursNum,
          delayMinutes: minutesNum,
        });

        marketingCampaignsService
          .sendChunk(
            chunkIndex + 1,
            item.chunkSize,
            item.segment,
            item._id,
            scheduleAPIOptions
          )
          .then(() => {
            buildSuccess(
              `Tanda ${chunkIndex + 1} programada para ${format(
                scheduledTime,
                "dd/MM/yyyy HH:mm",
                { locale: es }
              )}`,
              this.$store.commit
            );
            // this.refreshCampaignItem(item); // Optionally refresh
          })
          .catch((error) => {
            console.error("Error al programar la tanda:", error);
            buildSuccess(
              `Error al programar la tanda ${chunkIndex + 1}`,
              this.$store.commit,
              "error"
            );
            if (item.scheduledChunks && item.scheduledChunks[chunkIndex]) {
              this.$delete(item.scheduledChunks, chunkIndex); // Revert optimistic update
            }
          })
          .finally(() => {
            this.closeScheduleDialog();
          });
      }
    },

    closeScheduleDialog() {
      this.scheduleDialog.show = false;
      this.scheduleDialog.loading = false;
      // Reset type to 'now' for next opening if desired
      // this.scheduleDialog.type = 'now';
    },

    async getChunkDetail(item, chunk, chunkIndex) {
      this.isShowingDetail = true;
      this.chunkDetail = null; // Clear previous detail
      try {
        const response = await marketingCampaignsService.chunkDetail(
          chunkIndex + 1,
          item.chunkSize,
          item.segment,
          item // Pass the whole campaign item if backend needs more context like item._id
        );
        this.chunkDetail = response.data.payload;
      } catch (error) {
        console.error("Error fetching chunk detail:", error);
        buildSuccess(
          "Error al cargar detalle de la tanda.",
          this.$store.commit,
          "error"
        );
        this.isShowingDetail = false;
      }
    },

    getChunkStatusColor(item, chunkIndex) {
      /* This method might be deprecated by ProgrammedChunkStatus */
      if (item.chunksPagesSent && item.chunksPagesSent.includes(chunkIndex + 1))
        return "green";
      const scheduledChunkInfo =
        item.scheduledChunks && item.scheduledChunks[chunkIndex];
      if (scheduledChunkInfo) {
        switch (scheduledChunkInfo.status) {
          case "sent_by_backend":
            return "green";
          case "processing_by_backend":
            return "blue";
          case "scheduled":
            return "orange";
          case "past_due_schedule":
            return "red";
        }
      }
      return "grey";
    },

    getChunkStatusText(item, chunkIndex) {
      /* This method might be deprecated by ProgrammedChunkStatus */
      if (item.chunksPagesSent && item.chunksPagesSent.includes(chunkIndex + 1))
        return "Enviado";
      const scheduledChunkInfo =
        item.scheduledChunks && item.scheduledChunks[chunkIndex];
      if (scheduledChunkInfo) {
        switch (scheduledChunkInfo.status) {
          case "sent_by_backend":
            return "Enviado (confirmado)";
          case "processing_by_backend":
            return "Procesando...";
          case "scheduled": {
            const scheduledTime = new Date(scheduledChunkInfo.scheduledTime);
            return `Programado: ${format(scheduledTime, "dd/MM HH:mm", {
              locale: es,
            })}`;
          }
          case "past_due_schedule":
            return "Envío pendiente (retrasado)";
        }
      }
      return "No enviado";
    },

    getRelativeTime(scheduledTimeISO) {
      /* This method might be deprecated or adapted */
      if (!scheduledTimeISO) return "";
      const scheduled = new Date(scheduledTimeISO);
      const now = new Date();
      const diffMs = scheduled.getTime() - now.getTime();

      if (diffMs < 0) return "Envío pendiente";

      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) return format(scheduled, "dd/MM HH:mm", { locale: es });
      if (diffHours > 0) return `En ${diffHours}h ${diffMinutes % 60}m`;
      if (diffMinutes > 0) return `En ${diffMinutes} min`;
      return "En breve";
    },

    validateScheduleInputs() {
      let hours = parseInt(this.scheduleDialog.hours || 0);
      hours = isNaN(hours) || hours < 0 ? 0 : hours > 23 ? 23 : hours;
      this.scheduleDialog.hours = hours.toString();

      let minutes = parseInt(this.scheduleDialog.minutes || 0);
      minutes = isNaN(minutes) || minutes < 0 ? 0 : minutes > 59 ? 59 : minutes;
      this.scheduleDialog.minutes = minutes.toString();
    },

    openBulkScheduleDialog(item) {
      // Reset any previous bulk send statuses
      if (item.chunks && item.chunks.length > 0) {
        item.chunks.forEach((chunk) => {
          this.$set(chunk, "_bulkSendStatus", "pending");
          this.$set(chunk, "_bulkSendMessage", "");
        });
      }
      this.bulkScheduleDialog.item = item; // item now has chunks with _bulkSendStatus
      this.bulkScheduleDialog.millisecondsBetweenChunksForBulkNow =
        item.autoSendChunksSequentiallyOnStart &&
        typeof item.millisecondsBetweenChunks === "number"
          ? item.millisecondsBetweenChunks.toString()
          : "1000";
      this.bulkScheduleDialog.baseDelayHours = "0";
      this.bulkScheduleDialog.baseDelayMinutes = "15";
      this.bulkScheduleDialog.loading = false;
      this.bulkScheduleDialog.isBulkNowSending = false; // Ensure it's reset
      this.bulkScheduleDialog.show = true;
    },

    closeBulkScheduleDialog() {
      this.bulkScheduleDialog.show = false;
      this.bulkScheduleDialog.loading = false;
      this.bulkScheduleDialog.isBulkNowSending = false; // Reset this state too
      // Optional: Clean up _bulkSendStatus if they are only for dialog context
      // if (this.bulkScheduleDialog.item && this.bulkScheduleDialog.item.chunks) {
      //   this.bulkScheduleDialog.item.chunks.forEach(chunk => {
      //     this.$delete(chunk, '_bulkSendStatus');
      //     this.$delete(chunk, '_bulkSendMessage');
      //   });
      // }
    },

    validateBulkScheduleInputs() {
      this.$nextTick(() => {
        if (this.bulkScheduleDialog.type === "schedule") {
          let hours = parseInt(this.bulkScheduleDialog.baseDelayHours || 0);
          this.bulkScheduleDialog.baseDelayHours = (
            isNaN(hours) || hours < 0 ? 0 : hours
          ).toString();

          let minutes = parseInt(this.bulkScheduleDialog.baseDelayMinutes || 0);
          this.bulkScheduleDialog.baseDelayMinutes = (
            isNaN(minutes) || minutes < 0 ? 0 : minutes > 59 ? 59 : minutes
          ).toString();
        } else if (this.bulkScheduleDialog.type === "now") {
          let delayMs = parseInt(
            this.bulkScheduleDialog.millisecondsBetweenChunksForBulkNow || 0
          );
          this.bulkScheduleDialog.millisecondsBetweenChunksForBulkNow = (
            isNaN(delayMs) || delayMs < 0 ? 0 : delayMs
          ).toString();
        }
      });
    },

    async confirmBulkSchedule() {
      const { item, type } = this.bulkScheduleDialog;
      if (!item) {
        this.bulkScheduleDialog.loading = false;
        return;
      }
      this.bulkScheduleDialog.loading = true;
      this.validateBulkScheduleInputs();

      if (type === "now") {
        const delayMs = parseInt(
          this.bulkScheduleDialog.millisecondsBetweenChunksForBulkNow || "0"
        );
        if (!this.isBulkNowScheduleDelayValid) {
          buildSuccess(
            "Tiempo de espera (ms) debe ser >= 0.",
            this.$store.commit,
            "warning"
          );
          this.bulkScheduleDialog.loading = false;
          return;
        }

        this.bulkScheduleDialog.isBulkNowSending = true; // Switch to progress view

        // Ensure chunks have _bulkSendStatus initialized (double check, openBulkScheduleDialog should do it)
        if (item.chunks && item.chunks.length > 0) {
          item.chunks.forEach((chunk) => {
            if (chunk._bulkSendStatus === undefined)
              this.$set(chunk, "_bulkSendStatus", "pending");
            if (chunk._bulkSendMessage === undefined)
              this.$set(chunk, "_bulkSendMessage", "");
          });
        }

        this.startBulkNowSequentialSend(item, delayMs);

        buildSuccess(
          `Iniciando envío secuencial con ${delayMs}ms de espera. Se mostrará el progreso.`,
          this.$store.commit
        );
        // loading for the button itself can be tricky; the dialog content shows activity
        // this.bulkScheduleDialog.loading = false; // Or keep true if button becomes "Enviando..."
      } else if (type === "schedule") {
        const hoursNum = parseInt(this.bulkScheduleDialog.baseDelayHours || 0);
        const minutesNum = parseInt(
          this.bulkScheduleDialog.baseDelayMinutes || 0
        );
        if (!this.isBulkBaseScheduleDelayValid) {
          buildSuccess(
            "Retraso base debe ser > 0.",
            this.$store.commit,
            "warning"
          );
          this.bulkScheduleDialog.loading = false;
          return;
        }

        const baseDelayMilliseconds =
          hoursNum * 60 * 60 * 1000 + minutesNum * 60 * 1000;
        const now = new Date();
        let errorOccurred = false;
        if (!item.scheduledChunks) this.$set(item, "scheduledChunks", {});

        let actuallyScheduledCountForDelayCalculation = 0; // Counter for chunks that will be actively scheduled

        const promises = item.chunks.map((_chunk, i) => {
          const chunkIndex = i;
          const chunkPage = chunkIndex + 1;

          const statusPackage = this.getTandaProgrammedStatusPackage(
            item,
            chunkIndex
          );
          const isEffectivelySent =
            statusPackage.status === this.PROGRAMMED_CHUNK_STATUSES.SENT;
          const isEffectivelyProcessing =
            statusPackage.status === this.PROGRAMMED_CHUNK_STATUSES.PROCESSING;

          if (isEffectivelySent || isEffectivelyProcessing) {
            let skipStatus = isEffectivelySent
              ? "skipped_scheduling_already_sent"
              : "skipped_scheduling_processing";
            let skipMessage = isEffectivelySent ? "Ya enviado." : "En proceso.";

            // Update item.scheduledChunks to reflect this skip, preserving or setting a relevant time
            const existingScheduledInfo = item.scheduledChunks[chunkIndex];
            this.$set(item.scheduledChunks, chunkIndex, {
              ...(existingScheduledInfo || {}),
              status: skipStatus,
              message: skipMessage,
              // If it was already sent/processing, its original scheduledTime might be more relevant
              scheduledTime:
                existingScheduledInfo?.scheduledTime ||
                new Date().toISOString(),
            });
            return Promise.resolve({ status: skipStatus, chunkPage }); // Mark as skipped
          }

          // This chunk is eligible for scheduling
          actuallyScheduledCountForDelayCalculation++;
          const totalDelayForThisChunk =
            actuallyScheduledCountForDelayCalculation * baseDelayMilliseconds; // Use the counter for actual schedulable order
          const scheduledTime = new Date(
            now.getTime() + totalDelayForThisChunk
          );
          const scheduleAPIOptions = {
            isProgrammed: true,
            currentTime: now.toISOString(),
            delayMilliseconds: totalDelayForThisChunk,
            sendAt: scheduledTime.toISOString(),
          };

          this.$set(item.scheduledChunks, chunkIndex, {
            scheduledTime: scheduledTime.toISOString(),
            status: "scheduled_pending_api",
            baseDelayHoursApplied: hoursNum,
            baseDelayMinutesApplied: minutesNum,
            cumulativeFactor: chunkPage,
          });

          return marketingCampaignsService
            .sendChunk(
              chunkPage,
              item.chunkSize,
              item.segment,
              item._id,
              scheduleAPIOptions
            )
            .then(() => {
              if (item.scheduledChunks[chunkIndex])
                this.$set(
                  item.scheduledChunks[chunkIndex],
                  "status",
                  "scheduled"
                );
              // successfulSchedules++; // This variable is no longer used directly here
            })
            .catch((err) => {
              console.error(
                `Error programando Tanda ${chunkPage} para ${item._id}:`,
                err
              );
              if (item.scheduledChunks[chunkIndex]) {
                this.$set(
                  item.scheduledChunks[chunkIndex],
                  "status",
                  "schedule_failed"
                );
                this.$set(
                  item.scheduledChunks[chunkIndex],
                  "error",
                  err.message || "Error desconocido"
                );
              }
              errorOccurred = true;
            });
        });

        Promise.all(promises)
          .then(async (results) => {
            const actualScheduledCount = results.filter(
              (r) => r && !r.status
            ).length; // successful API calls
            const skippedCount = results.filter(
              (r) => r && r.status === "skipped_scheduling_already_sent"
            ).length;
            // errorOccurred is already tracked for API call failures

            let messages = [];
            if (actualScheduledCount > 0) {
              messages.push(
                `${actualScheduledCount} de ${
                  item.chunks.length - skippedCount
                } tandas elegibles fueron programadas.`
              );
            }
            if (skippedCount > 0) {
              messages.push(
                `${skippedCount} tanda(s) ya habían sido enviadas y no se reprogramaron.`
              );
            }
            if (errorOccurred) {
              messages.push(
                "Algunas tandas no pudieron ser programadas debido a errores."
              );
            }
            if (messages.length === 0 && item.chunks.length > 0) {
              messages.push("No se programaron nuevas tandas.");
            } else if (item.chunks.length === 0) {
              messages.push("No hay tandas para programar.");
            }

            if (errorOccurred) {
              buildSuccess(messages.join(" "), this.$store.commit, "warning");
            } else if (actualScheduledCount > 0) {
              buildSuccess(messages.join(" "), this.$store.commit, "success");
            } else {
              buildSuccess(messages.join(" "), this.$store.commit, "info");
            }

            // await this.refreshCampaignItem(item); // Refresh item instead of full initialize
            this.closeBulkScheduleDialog();
          })
          .finally(() => {
            this.bulkScheduleDialog.loading = false;
          });
      } else {
        this.bulkScheduleDialog.loading = false; // Should not happen
      }
    },

    getBulkChunkScheduledTimeString(chunkIndex) {
      if (
        this.bulkScheduleDialog.type !== "schedule" ||
        !this.bulkScheduleDialog.show ||
        !this.isBulkBaseScheduleDelayValid
      )
        return "Calculando...";

      const baseHours = parseInt(this.bulkScheduleDialog.baseDelayHours || 0);
      const baseMinutes = parseInt(
        this.bulkScheduleDialog.baseDelayMinutes || 0
      );
      const baseDelayMilliseconds =
        baseHours * 60 * 60 * 1000 + baseMinutes * 60 * 1000;

      if (baseDelayMilliseconds <= 0) return "Retraso base no válido";

      const item = this.bulkScheduleDialog.item;
      if (!item || !item.chunks || chunkIndex >= item.chunks.length)
        return "Error de datos";

      let schedulableChunkOrder = 0; // Order of this chunk among those actually being scheduled

      for (let i = 0; i <= chunkIndex; i++) {
        const statusPackage = this.getTandaProgrammedStatusPackage(item, i);
        const isEffectivelySent =
          statusPackage.status === this.PROGRAMMED_CHUNK_STATUSES.SENT;
        const isEffectivelyProcessing =
          statusPackage.status === this.PROGRAMMED_CHUNK_STATUSES.PROCESSING;

        const isChunkSkippable = isEffectivelySent || isEffectivelyProcessing;

        if (!isChunkSkippable) {
          schedulableChunkOrder++;
        }

        // If this is the target chunk (chunkIndex) and it's being skipped
        if (i === chunkIndex && isChunkSkippable) {
          if (isEffectivelySent) return "Ya Enviado";
          if (isEffectivelyProcessing) return "En Proceso";
          return "Omitido (estado no programable)"; // Fallback, should be covered by above
        }
      }

      if (schedulableChunkOrder === 0) {
        return "No se programará (sin nueva fecha)";
      }

      const now = new Date();
      const cumulativeDelayMilliseconds =
        schedulableChunkOrder * baseDelayMilliseconds;
      const futureTime = new Date(now.getTime() + cumulativeDelayMilliseconds);
      return format(futureTime, "dd/MM/yyyy HH:mm:ss", { locale: es });
    },

    async stopAllPendingCampaignsGlobally() {
      if (
        await this.$confirm(
          "¿Detener TODAS las tandas programadas en TODAS las campañas?"
        )
      ) {
        this.stoppingAllGlobally = true;
        try {
          await marketingCampaignsService.stopAllScheduledChunksGlobally();
          buildSuccess(
            "Solicitud para detener todas las tandas globalmente enviada.",
            this.$store.commit
          );
          await this.initialize();
        } catch (error) {
          console.error("Error stopping all scheduled chunks globally:", error);
          buildSuccess(
            "Error al detener tandas globalmente.",
            this.$store.commit,
            "error"
          );
        } finally {
          this.stoppingAllGlobally = false;
        }
      }
    },

    async stopAllPendingCampaignsForItem(item) {
      if (
        await this.$confirm(
          `¿Detener todas las tandas programadas para la campaña '${item.name}'?`
        )
      ) {
        this.$set(item, "stoppingAllChunksLoading", true);
        try {
          await marketingCampaignsService.stopAllScheduledChunksForCampaign(
            item._id
          );
          buildSuccess(
            `Solicitud para detener tandas de '${item.name}' enviada.`,
            this.$store.commit
          );
          // Optimistic update or rely on refresh
          if (item.scheduledChunks) {
            Object.keys(item.scheduledChunks).forEach((idx) => {
              if (item.scheduledChunks[idx].status === "scheduled") {
                this.$set(
                  item.scheduledChunks[idx],
                  "status",
                  "stopped_by_user"
                );
              }
            });
          }
          await this.refreshCampaignItem(item); // Refresh this specific item
        } catch (error) {
          console.error(
            `Error stopping chunks for campaign ${item._id}:`,
            error
          );
          buildSuccess(
            `Error al detener tandas para '${item.name}'.`,
            this.$store.commit,
            "error"
          );
        } finally {
          this.$set(item, "stoppingAllChunksLoading", false);
        }
      }
    },

    async stopSpecificScheduledChunk(item, chunkIndex) {
      const chunkPage = chunkIndex + 1;
      if (
        await this.$confirm(
          `¿Detener Tanda ${chunkPage} programada para '${item.name}'?`
        )
      ) {
        const stoppingKey = `${item._id}_${chunkIndex}`;
        this.$set(this.stoppingChunkStates, stoppingKey, true);
        try {
          await marketingCampaignsService.stopScheduledChunk(
            item._id,
            chunkPage
          );
          buildSuccess(
            `Solicitud para detener Tanda ${chunkPage} de '${item.name}' enviada.`,
            this.$store.commit
          );
          if (item.scheduledChunks && item.scheduledChunks[chunkIndex]) {
            this.$set(
              item.scheduledChunks[chunkIndex],
              "status",
              "stopped_by_user"
            );
          }
          await this.refreshCampaignItem(item); // Refresh this specific item
        } catch (error) {
          console.error(
            `Error stopping chunk ${chunkPage} for ${item._id}:`,
            error
          );
          buildSuccess(
            `Error al detener Tanda ${chunkPage}.`,
            this.$store.commit,
            "error"
          );
        } finally {
          this.$set(this.stoppingChunkStates, stoppingKey, false);
        }
      }
    },

    isStoppingChunk(item, chunkIndex) {
      const stoppingKey = `${item._id}_${chunkIndex}`;
      return !!this.stoppingChunkStates[stoppingKey];
    },

    async stopManuallyChunk(item, chunkIndex) {
      const chunkPage = chunkIndex + 1;
      if (
        await this.$confirm(
          `¿Detener manualmente la Tanda ${chunkPage} de la campaña '${item.name}'?`
        )
      ) {
        const stoppingKey = `${item._id}_${chunkIndex}`;
        this.$set(this.stoppingChunkStates, stoppingKey, true);

        try {
          // Call the API to stop the chunk
          await marketingCampaignsService.stopManuallyChunk(
            item._id,
            chunkPage
          );

          // Update UI to reflect the change
          if (item.scheduledChunks && item.scheduledChunks[chunkIndex]) {
            this.$set(
              item.scheduledChunks[chunkIndex],
              "status",
              "manually_stopped"
            );
          }

          // Remove from chunksPagesSent if it was there
          const sentIndex =
            item.chunksPagesSent && item.chunksPagesSent.indexOf(chunkPage);
          if (sentIndex !== -1) {
            item.chunksPagesSent.splice(sentIndex, 1);
          }

          buildSuccess(
            `Tanda ${chunkPage} de '${item.name}' detenida manualmente.`,
            this.$store.commit
          );

          // Refresh the campaign to get latest status
          await this.refreshCampaignItem(item);
        } catch (error) {
          console.error(
            `Error deteniendo manualmente la tanda ${chunkPage} de ${item._id}:`,
            error
          );
          buildSuccess(
            `Error al detener manualmente la Tanda ${chunkPage}.`,
            this.$store.commit,
            "error"
          );
        } finally {
          this.$set(this.stoppingChunkStates, stoppingKey, false);
        }
      }
    },

    async startBulkNowSequentialSend(currentItemFromDialog, delayMs) {
      // Use this.bulkScheduleDialog.item to ensure reactivity with the dialog's displayed item
      const item = this.bulkScheduleDialog.item;

      if (!item || item._id !== currentItemFromDialog._id) {
        console.error(
          "Item mismatch or missing item in startBulkNowSequentialSend.",
          {
            dialogItem: item ? item._id : "null",
            passedItem: currentItemFromDialog
              ? currentItemFromDialog._id
              : "null",
          }
        );
        if (this.bulkScheduleDialog.item) {
          this.bulkScheduleDialog.item.chunks.forEach((chunk) => {
            this.$set(chunk, "_bulkSendStatus", "error");
            this.$set(
              chunk,
              "_bulkSendMessage",
              "Error interno de la UI (item mismatch)."
            );
          });
        }
        this.bulkScheduleDialog.loading = false; // Stop button loading
        return;
      }

      if (!item.chunksPagesSent) {
        this.$set(item, "chunksPagesSent", []);
      } else {
        item.chunksPagesSent = []; // Reset for this bulk operation
      }

      // Clear any existing timer for this specific campaign item if tied to general sequential sending
      // This bulk operation has its own timer logic for sequencing.
      const timerId = `bulk_${item._id}`;
      if (this.timers[timerId] && this.timers[timerId].timer) {
        clearTimeout(this.timers[timerId].timer);
      }
      this.timers[timerId] = { timer: null };

      let chunkIndex = 0;

      const sendNextChunk = async () => {
        if (chunkIndex < item.chunks.length) {
          const currentChunkObject = item.chunks[chunkIndex];

          // Check if chunk was already sent
          if (
            item.chunksPagesSent &&
            item.chunksPagesSent.includes(chunkIndex + 1)
          ) {
            this.$set(currentChunkObject, "_bulkSendStatus", "already_sent");
            this.$set(
              currentChunkObject,
              "_bulkSendMessage",
              "Esta tanda ya fue enviada."
            );

            chunkIndex++;
            if (chunkIndex < item.chunks.length) {
              this.timers[timerId].timer = setTimeout(sendNextChunk, delayMs);
            } else {
              // All chunks processed (some might have been skipped)
              if (this.timers[timerId]) {
                clearTimeout(this.timers[timerId].timer);
                this.timers[timerId].timer = null;
              }
              this.bulkScheduleDialog.loading = false;
              // Update completion messages
              const allEffectivelyProcessed = item.chunks.every(
                (c) =>
                  c._bulkSendStatus === "sent" ||
                  c._bulkSendStatus === "already_sent" ||
                  c._bulkSendStatus === "error" // Consider error as processed for completion
              );
              const anyError = item.chunks.some(
                (c) => c._bulkSendStatus === "error"
              );
              const anyActuallySent = item.chunks.some(
                (c) => c._bulkSendStatus === "sent"
              );
              const allSkipped = item.chunks.every(
                (c) => c._bulkSendStatus === "already_sent"
              );

              if (anyError) {
                buildSuccess(
                  `Envío secuencial de tandas para '${item.name}' completado con algunos errores.`,
                  this.$store.commit,
                  "warning"
                );
              } else if (allSkipped) {
                buildSuccess(
                  `Envío secuencial para '${item.name}': Todas las tandas ya habían sido enviadas.`,
                  this.$store.commit,
                  "info"
                );
              } else if (allEffectivelyProcessed && anyActuallySent) {
                buildSuccess(
                  `Envío secuencial de tandas para '${item.name}' completado exitosamente.`,
                  this.$store.commit
                );
              } else if (allEffectivelyProcessed) {
                // No errors, none actually sent (e.g. all skipped or empty)
                buildSuccess(
                  `Proceso de envío secuencial para '${item.name}' finalizado. No se enviaron nuevas tandas.`,
                  this.$store.commit,
                  "info"
                );
              }
            }
            return; // Return after handling skipped chunk
          }

          this.$set(currentChunkObject, "_bulkSendStatus", "sending");
          this.$set(currentChunkObject, "_bulkSendMessage", "");

          try {
            await this.sendChunkCampaign(
              item, // campaign item
              currentChunkObject, // chunk object (not just index or content)
              chunkIndex, // chunk index (0-based)
              { isProgrammed: false, isBulkNow: true } // options
            );
            this.$set(currentChunkObject, "_bulkSendStatus", "sent");
            // chunksPagesSent is updated within sendChunkCampaign if successful & not programmed
          } catch (error) {
            console.error(
              `Error enviando tanda ${chunkIndex + 1} en bulk 'now':`,
              error
            );
            this.$set(currentChunkObject, "_bulkSendStatus", "error");
            this.$set(
              currentChunkObject,
              "_bulkSendMessage",
              error.message || "Error desconocido al enviar."
            );
            // Continue with next chunk even if one fails, or decide to stop.
            // Current logic: continue.
          }

          chunkIndex++;
          if (chunkIndex < item.chunks.length) {
            this.timers[timerId].timer = setTimeout(sendNextChunk, delayMs);
          } else {
            // All chunks processed
            if (this.timers[timerId]) {
              clearTimeout(this.timers[timerId].timer);
              this.timers[timerId].timer = null;
            }
            this.bulkScheduleDialog.loading = false; // Indicate overall process for button is done
            // isBulkNowSending remains true to show the final progress list.
            // A "Close" button becomes active.
            const allEffectivelyProcessed = item.chunks.every(
              (c) =>
                c._bulkSendStatus === "sent" ||
                c._bulkSendStatus === "already_sent" ||
                c._bulkSendStatus === "error"
            );
            const anyError = item.chunks.some(
              (c) => c._bulkSendStatus === "error"
            );
            const anyActuallySent = item.chunks.some(
              (c) => c._bulkSendStatus === "sent"
            );
            const allSkipped = item.chunks.every(
              (c) => c._bulkSendStatus === "already_sent"
            );

            if (anyError) {
              buildSuccess(
                `Envío secuencial de tandas para '${item.name}' completado con algunos errores.`,
                this.$store.commit,
                "warning"
              );
            } else if (allSkipped) {
              buildSuccess(
                `Envío secuencial para '${item.name}': Todas las tandas ya habían sido enviadas.`,
                this.$store.commit,
                "info"
              );
            } else if (allEffectivelyProcessed && anyActuallySent) {
              buildSuccess(
                `Envío secuencial de tandas para '${item.name}' completado exitosamente.`,
                this.$store.commit
              );
            } else if (allEffectivelyProcessed) {
              buildSuccess(
                `Proceso de envío secuencial para '${item.name}' finalizado. No se enviaron nuevas tandas.`,
                this.$store.commit,
                "info"
              );
            }
          }
        }
      };
      sendNextChunk(); // Start the first one
    },

    handleCloseOrCancelBulkDialog() {
      if (
        this.bulkScheduleDialog.type === "now" &&
        this.bulkScheduleDialog.isBulkNowSending &&
        this.bulkScheduleDialog.loading
      ) {
        // Potentially implement stop bulk send: clear timers[ `bulk_${item._id}`].timer
        // For now, this button is disabled or shows "ENVIANDO..." when loading is true.
        // If user clicks when it says "ENVIANDO..." (meaning loading is true), we might want to stop.
        // However, the button is currently set to be disabled when loading=true for this case.
        // So, this branch might not be reachable if button is disabled.
        console.warn(
          "Stop bulk send requested while in progress - not fully implemented."
        );
        // To attempt stopping:
        const timerId = `bulk_${this.bulkScheduleDialog.item._id}`;
        if (this.timers[timerId] && this.timers[timerId].timer) {
          clearTimeout(this.timers[timerId].timer);
          this.timers[timerId].timer = null;
          this.bulkScheduleDialog.loading = false; // Stop loading indicator
          // Mark remaining chunks as cancelled or similar.
          // This requires iterating item.chunks and setting _bulkSendStatus
          if (
            this.bulkScheduleDialog.item &&
            this.bulkScheduleDialog.item.chunks
          ) {
            let foundSending = false;
            this.bulkScheduleDialog.item.chunks.forEach((c) => {
              if (c._bulkSendStatus === "sending") {
                this.$set(c, "_bulkSendStatus", "cancelled");
                this.$set(c, "_bulkSendMessage", "Detenido por el usuario.");
                foundSending = true;
              }
              if (foundSending && c._bulkSendStatus === "pending") {
                this.$set(c, "_bulkSendStatus", "cancelled");
                this.$set(c, "_bulkSendMessage", "Detenido por el usuario.");
              }
            });
          }
          buildSuccess(
            "Proceso de envío masivo detenido.",
            this.$store.commit,
            "info"
          );
        }
        // Even if stopped, we might want to keep the dialog open to show status, then close.
        // Or just close it:
        // this.closeBulkScheduleDialog();
        return; // Explicitly return after handling stop attempt
      }
      this.closeBulkScheduleDialog();
    },

    getConfirmBulkDisabledState() {
      if (
        this.bulkScheduleDialog.loading &&
        !(
          this.bulkScheduleDialog.type === "now" &&
          this.bulkScheduleDialog.isBulkNowSending
        )
      )
        return true;
      if (
        this.bulkScheduleDialog.type === "schedule" &&
        !this.isBulkBaseScheduleDelayValid
      )
        return true;
      if (
        this.bulkScheduleDialog.type === "now" &&
        !this.bulkScheduleDialog.isBulkNowSending &&
        !this.isBulkNowScheduleDelayValid
      )
        return true;
      return false;
    },
  },
};
</script>

<style lang="scss" scoped></style>
