<template>
  <div class="leads">
    <material-card
      width="100%"
      icon="mdi-cellphone-dock"
      color="primary"
      title="Leads"
      text="Tabla resumen de leads"
    >
      <v-data-table
        dense
        calculate-widths
        :loading="dataTableLoading"
        no-results-text="No se encontraron resultados"
        hide-default-footer
        :headers="headers"
        :items="leads"
        sort-by="calories"
        @page-count="pageCount = $event"
        :page.sync="page"
        :items-per-page="$store.state.itemsPerPage"
        :options.sync="pagination"
        :server-items-length="totalItems"
      >
        <template v-slot:[`header.checkbox`]>
          <v-checkbox v-model="globalSelector"
        /></template>
        <template v-slot:top>
          <v-container>
            <span class="font-weight-bold">Selecciona al agente</span>
            <v-row>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="telefonoId"
                  :items="telefonos"
                  :search-input.sync="search2"
                  hide-selected
                  item-value="_id"
                  placeholder="Selecciona el agente"
                  outlined
                  dense
                  class="mt-2"
                  clearable
                >
                  <template v-slot:no-data>
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>
                          No se encontraron resultados
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <template v-slot:selection="{ item }">
                    <span>{{ item.fullname }} ({{ item.cellphone }})</span>
                  </template>
                  <template v-slot:item="{ item }">
                    <span>{{ item.fullname }} ({{ item.cellphone }})</span>
                  </template>
                </v-combobox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-sheet max-width="700">
                  <CompaniesSelector
                    :multiple="true"
                    :initial-data="[getCurrentCompany()]"
                    @onSelectedCompanies="
                      selectedCompanies = $event;
                      initialize(
                        buildPayloadPagination(
                          {
                            page: 1,
                            itemsPerPage: $store.state.itemsPerPage,
                          },
                          buildSearch()
                        )
                      );
                    "
                  ></CompaniesSelector>
                </v-sheet>
              </v-col>
            </v-row>
            <span class="font-weight-bold"
              >Filtrar por nombre/apellido/teléfono: {{ search }}</span
            >
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  dense
                  hide-details
                  v-model="search"
                  append-icon="search"
                  placeholder="Escribe los nombres/apellidos/telefonos del lead"
                  single-line
                  outlined
                  clearable
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
                      >Agregar lead</v-btn
                    >

                    <v-btn
                      v-show="!isFilterEmptyActive"
                      color="secondary"
                      dark
                      class="mb-2 ml-2"
                      @click="
                        showLeadsWithoutLabels();
                        isFilterEmptyActive = true;
                      "
                      >Leads sin etiquetas</v-btn
                    >
                    <v-btn
                      v-show="isFilterEmptyActive"
                      color="primary"
                      dark
                      class="mb-2 ml-2"
                      @click="
                        showAllLeads();
                        isFilterEmptyActive = false;
                      "
                      >Mostrar anterior</v-btn
                    >
                    <v-btn
                      v-show="selectedLeads.length > 0"
                      color="success"
                      dark
                      class="mb-2 ml-2"
                      @click.stop="openMarketingCampaignsDialog"
                      >Enviar campaña</v-btn
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
                        <v-row>
                          <v-combobox
                            item-text="name"
                            :search-input.sync="searchLabel"
                            v-model="editedItem.todofullLabels"
                            item-value="_id"
                            :items="todofullLabels"
                            multiple
                            chips
                            no-data-text="No se encontraron etiquetas"
                            label="Busca las etiquetas"
                            @change="updateLabels(editedItem)"
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
                                v-bind="attrs"
                                :input-value="selected"
                                close
                                @click="select"
                                @click:close="removeLabels(editedItem, item)"
                                color="primary"
                              >
                                <strong>{{ item.name }}</strong>
                              </v-chip>
                            </template>
                          </v-combobox>
                        </v-row>
                        <v-row dense>
                          <v-col
                            v-for="detail in editedItem.details"
                            :key="detail._id"
                            cols="12"
                            sm="12"
                            md="12"
                          >
                            <div v-if="detail.labels">
                              <v-chip
                                dark
                                class="mb-1 mr-1"
                                color="pink"
                                v-for="label in detail.labels
                                  .filter((el) => el.labelId)
                                  .reduce((unique, o) => {
                                    if (
                                      !unique.some(
                                        (obj) =>
                                          obj.labelId.name === o.labelId.name
                                      )
                                    ) {
                                      unique.push(o);
                                    }
                                    return unique;
                                  }, [])"
                                :key="label._id"
                              >
                                {{ label.labelId.name }}
                              </v-chip>
                            </div>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Teléfono</p>
                            <VTextFieldWithValidation
                              rules="required"
                              v-model="editedItem.telefono"
                              label="Teléfono"
                            />
                          </v-col>
                        </v-row>
                        <v-row
                          v-for="(detail, detailIndex) in editedItem.details"
                          :key="detail._id"
                        >
                          <v-col
                            v-show="editedItem.details.length > 1"
                            cols="12"
                            sm="12"
                          >
                            <div class="striped-border">
                              <p class="body-1 font-weight-bold">
                                Origen N° {{ detailIndex + 1 }}
                              </p>
                            </div>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Fuente</p>
                            <v-select
                              v-model="detail.fuente"
                              :items="sourceSelectList"
                              hide-selected
                              item-value="_id"
                              item-text="name"
                              placeholder="Selecciona la fuente"
                              outlined
                              hide-details
                              dense
                              class="mt-2"
                              clearable
                            >
                            </v-select>
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">
                              ID de Contacto
                            </p>
                            <VTextFieldWithValidation
                              v-if="detail.fuente !== 'ODOO'"
                              rules=""
                              v-model="detail.contactId"
                              label="ID de Contacto"
                            />
                            <VTextFieldWithValidation
                              v-else
                              rules=""
                              v-model="editedItem.odoo_id"
                              label="ID de ODOO"
                              disabled
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <p class="body-1 font-weight-bold">Nombres</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.nombre"
                              label="Nombres"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Email</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.email"
                              label="Email"
                            />
                          </v-col>
                          <v-col cols="12" sm="6" md="6">
                            <p class="body-1 font-weight-bold">Ciudad</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.ciudad"
                              label="Ciudad"
                            />
                          </v-col>
                          <v-col cols="12" sm="12" md="12">
                            <p class="body-1 font-weight-bold">Asunto</p>
                            <VTextFieldWithValidation
                              rules=""
                              v-model="detail.msnActivaDefault"
                              label="Asunto"
                            />
                          </v-col>
                          <v-col
                            v-show="editedIndex > -1"
                            cols="12"
                            sm="12"
                            md="12"
                          >
                            <p class="body-1 font-weight-bold">Nota</p>
                            <v-textarea
                              label="Notas referentes a este lead..."
                              v-model="detail.nota"
                              outlined
                              hide-details="auto"
                            ></v-textarea>
                          </v-col>
                        </v-row>
                      </v-container>
                      <v-card-actions rd-actions>
                        <div class="flex-grow-1"></div>
                        <v-btn
                          :loading="loadingButton"
                          color="success"
                          @click="passes(save)"
                          >Guardar</v-btn
                        >
                        <v-btn outlined color="error" text @click="close"
                          >Cancelar</v-btn
                        >
                      </v-card-actions>
                    </ValidationObserver>
                  </v-card>
                </v-dialog>
              </v-col>
            </v-row>
            <v-col cols="12" sm="12">
              <span>
                <strong>Mostrando:</strong>
                {{
                  $store.state.itemsPerPage > leads.length
                    ? leads.length
                    : $store.state.itemsPerPage
                }}
                de {{ $store.state.cleanLeadsModule.total }} registros
              </span>
            </v-col>
            <div class="text-center pt-2">
              <v-pagination
                v-model="page"
                @input="initialize(buildPayloadPagination(page, buildSearch()))"
                :length="totalPages"
                total-visible="15"
              ></v-pagination>
            </div>
          </v-container>
          <v-btn
            v-show="!isSegmentPreviewMode"
            @click="todofullLabelsDialog = true"
            color="secondary"
            outlined
            >Filtrar por etiquetas</v-btn
          >
          <v-btn
            v-show="!isSegmentPreviewMode"
            @click="seeAllSegmentsDialog = true"
            color="accent"
            outlined
            >Ver segmentos</v-btn
          >
          <v-btn
            v-show="!isSegmentPreviewMode"
            color="primary"
            outlined
            @click="segmentDialog = true"
            >Nuevo segmento</v-btn
          >
          <div>
            <v-alert
              v-if="isSegmentPreviewMode || selectedSegment"
              border="left"
              close-text="Close Alert"
              color="deep-purple accent-4"
              dark
              dismissible
              outlined
            >
              <div v-if="selectedSegment">
                <b>Segmento: </b>{{ selectedSegment.name }}
              </div>
              {{ $store.state.cleanLeadsModule.total }} Contactos cumplen las
              condiciones
              <template v-slot:[`close`]>
                <v-btn
                  v-show="selectedSegment"
                  color="primary"
                  outlined
                  @click="setTodofullLabelsMassiveDialog = true"
                  >Etiquetas masivas</v-btn
                >
                <v-btn
                  v-show="!selectedSegment"
                  color="primary"
                  outlined
                  @click="
                    segmentDialog = true;
                    activatePreview = false;
                    isSegmentFinalStep = true;
                  "
                  >Guardar Segmento</v-btn
                >
                <v-btn
                  v-show="selectedSegment"
                  color="primary"
                  outlined
                  @click="$router.push({ name: 'MarketingCampaigns' })"
                  >Enviar Campaña</v-btn
                >
                <v-btn color="error" outlined @click="cancelSegmentPreview"
                  >Cancelar</v-btn
                ></template
              >
            </v-alert>
          </div>
        </template>
        <template v-slot:[`item.odoo_id`]="{ item }">
          <div v-if="item.odoo_id">
            <a
              target="_blank"
              :href="
                `https://mujeron.odoo.com/web#id=${item.odoo_id}&action=114&model=res.partner&view_type=form&cids=1&menu_id=89`
              "
              >{{ item.odoo_id }}</a
            >
          </div>
          <template v-if="item.odoo_metadata">
            <div v-if="item.odoo_metadata.team_id">
              Team ID: {{ item.odoo_metadata.team_id }}
            </div>
            <div v-if="item.odoo_metadata.rmf_score">
              RFM: {{ item.odoo_metadata.rmf_score }}
            </div>
            <div v-if="item.odoo_metadata.sale_order_count">
              Ventas: {{ item.odoo_metadata.sale_order_count }}
            </div>
            <div v-if="item.odoo_metadata.sale_order_count">
              Tickets: {{ item.odoo_metadata.helpdesk_ticket_count }}
            </div>
            <div v-if="item.odoo_metadata.sale_order_count">
              TPV: {{ item.odoo_metadata.pos_order_count }}
            </div>
          </template>
          <template v-else-if="item.odooInfo">
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
        <template v-slot:[`item.telefono`]="{ item }">
          <div
            style="cursor: pointer; color: blue; text-decoration: underline;"
            @click.stop="
              chatDialog = true;
              selectedCleanLead = item;
              getCleanLeadsChats(item._id);
            "
          >
            {{ item.telefono }}
          </div>
        </template>
        <template v-slot:[`item.telefonoId`]="{ item }">
          <v-chip
            small
            v-show="!item.telefonoId"
            class="ma-2"
            color="red"
            text-color="white"
          >
            Sin Asignar
          </v-chip>
          <span v-show="item.telefonoId"
            >{{
              item.telefonoId && item.telefonoId.agenteId
                ? item.telefonoId.agenteId.nombre
                : " "
            }}
            {{
              item.telefonoId && item.telefonoId.agenteId
                ? item.telefonoId.agenteId.apellido
                : " "
            }}
            ({{ item.telefonoId ? item.telefonoId.numero : " " }})</span
          >
        </template>
        <template v-slot:[`item.action`]="{ item }">
          <v-btn
            class="mr-3 mb-1"
            small
            color="secondary"
            @click="editItem(item)"
            v-if="rolPermisos['Edit']"
            >Editar</v-btn
          >
          <v-btn
            class="mb-1"
            small
            color="error"
            @click="deleteItem(item)"
            v-if="rolPermisos['Delete']"
            >Eliminar</v-btn
          >
        </template>
        <template v-slot:[`item.checkbox`]="{ item }">
          <input
            :value="item"
            v-model="selectedLeads"
            type="checkbox"
            name="scales"
          />
        </template>
        <template v-slot:[`item.fuente`]="{ item }">
          <v-simple-table dense class="pa-6">
            <template v-slot:default>
              <thead>
                <tr>
                  <th class="text-left">Tipo</th>
                  <th class="text-left">Fuente</th>
                  <th class="text-left">Nombre Facebook</th>
                  <th class="text-left">Nombre</th>
                  <th class="text-left">Correo</th>
                  <th
                    class="text-left"
                    v-show="
                      item.details.some(
                        (detail) => detail.status && detail.status.length > 0
                      )
                    "
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="detail in item.details" :key="detail._id">
                  <td>{{ detail.type }}</td>
                  <td>
                    {{
                      sourceSelectList.find((el) => el._id === detail.fuente)
                        ? sourceSelectList.find(
                            (el) => el._id === detail.fuente
                          ).name
                        : detail.fuente
                    }}
                  </td>
                  <td>{{ detail.appName }}</td>
                  <td>{{ detail.nombre }}</td>
                  <td>{{ detail.email }}</td>
                  <td
                    v-show="
                      item.details.some(
                        (detail) => detail.status && detail.status.length > 0
                      )
                    "
                  >
                    {{ detail.status }}
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </template>
        <template v-slot:no-data>
          <v-alert type="error" :value="true">Aún no cuentas con leads</v-alert>
        </template>
        <template v-slot:[`item.updatedAt`]="{ item }">{{
          item.updatedAt | formatDate
        }}</template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip v-if="item.status" color="success">Activo</v-chip>
          <v-chip v-else color="error">Inactivo</v-chip>
        </template>
        <template v-slot:[`item.estado`]="{ item }">
          <v-chip
            class="ma-2"
            :color="
              item.estado == 'SIN ASIGNAR'
                ? 'red'
                : item.estado == 'INFORMADO AL AGENTE'
                ? 'deep-purple accent-4'
                : item.estado == 'RE-CONECTAR'
                ? 'pink'
                : item.estado == 'COMPRA FALLIDA'
                ? 'error'
                : item.estado == 'COMPRA REALIZADA'
                ? 'success'
                : 'green'
            "
            text-color="white"
          >
            {{ item.estado }}
          </v-chip>
        </template>
      </v-data-table>
      <v-col cols="12" sm="12">
        <span>
          <strong>Mostrando:</strong>
          {{
            $store.state.itemsPerPage > leads.length
              ? leads.length
              : $store.state.itemsPerPage
          }}
          de {{ $store.state.cleanLeadsModule.total }} registros
        </span>
      </v-col>
      <div class="text-center pt-2">
        <v-pagination
          v-model="page"
          @input="initialize(buildPayloadPagination(page, buildSearch()))"
          :length="totalPages"
          total-visible="15"
        ></v-pagination>
      </div>
    </material-card>
    <v-dialog v-model="marketingCampaignsDialog" max-width="690">
      <v-card>
        <v-card-title class="text-h5"> Campañas activas </v-card-title>

        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Desde</th>
                <th class="text-left">Nombre</th>
                <th class="text-left">Plantilla asociada</th>
                <th class="text-left"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(marketingCampaign, idx) in marketingCampaigns"
                :key="idx"
              >
                <td>
                  {{
                    marketingCampaign.bot
                      ? marketingCampaign.bot.phone
                      : "Número no asociado"
                  }}
                </td>
                <td>{{ marketingCampaign.name }}</td>
                <td>{{ marketingCampaign.templateMessage }}</td>
                <td>
                  <v-btn
                    color="secondary"
                    @click="
                      sendTemplateMessage(
                        marketingCampaign.templateMessage,
                        marketingCampaign
                      )
                    "
                    >Enviar</v-btn
                  >
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="marketingCampaignsDialog = false"
          >
            Listo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="segmentDialog" max-width="700px">
      <MarketingSegmentsForm
        @onClose="segmentDialog = false"
        @onSave="onSaveSegment"
        :activatePreview="activatePreview"
        :isFinalStep="isSegmentFinalStep"
        @onPreview="onPreviewSegment"
      ></MarketingSegmentsForm>
    </v-dialog>
    <v-dialog v-model="todofullLabelsDialog" max-width="700px">
      <v-card>
        <v-card-title class="text-h5"> Etiquetas Todofull </v-card-title>
        <TodofullLabelsSelector
          class="ma-3"
          @onSelectTodofullLabels="onSelectTodofullLabels"
        ></TodofullLabelsSelector>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="todofullLabelsDialog = false"
          >
            Listo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="seeAllSegmentsDialog"
      v-if="seeAllSegmentsDialog"
      max-width="700px"
    >
      <v-card>
        <MarketingSegments
          @onSelectedSegment="onSelectedSegment"
          :isSelectorMode="true"
        ></MarketingSegments>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            text
            @click="seeAllSegmentsDialog = false"
          >
            Listo
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="setTodofullLabelsMassiveDialog"
      v-if="setTodofullLabelsMassiveDialog"
      max-width="700px"
    >
      <v-card>
        <v-container fluid>
          <v-card-title class="text-h5">
            Etiquetas masivas Todofull
          </v-card-title>
          <v-row>
            <v-col cols="12" sm="12">
              <TodofullLabelsSelector
                class="ma-3"
                @onSelectTodofullLabels="onSelectTodofullLabels"
              ></TodofullLabelsSelector>
            </v-col>
            <v-col cols="12" sm="6">
              <span
                >Las etiquetas
                <b>{{
                  selectedLabels.length > 0
                    ? selectedLabels.map((el) => el.name).join(", ")
                    : "No seleccionaste ninguna etiqueta"
                }}</b>
                serán asignadas a
                <b>{{ $store.state.cleanLeadsModule.total }} leads</b> del
                segmento <b>{{ selectedSegment.name }}</b></span
              >
            </v-col>
            <v-col cols="12" sm="6" md="6">
              <span class="font-weight-bold">Sobre Mailchimp</span>
              <v-checkbox
                v-model="hasToSendToMailchimp"
                label="Actualizar en mailchimp luego de etiquetado masivo"
              ></v-checkbox>
            </v-col>
          </v-row>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green darken-1"
              text
              @click="
                setTodofullLabelsMassive(
                  selectedSegment._id,
                  selectedLabels.map((el) => el._id),
                  hasToSendToMailchimp
                )
              "
            >
              Enviar
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
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
import axios from "axios";
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import MaterialCard from "@/components/material/Card";
import Leads from "@/classes/CleanLeads";
import auth from "@/services/api/auth";
import TodofullLabelsSelector from "@/components/TodofullLabelsSelector.vue";
import odooService from "@/services/api/odoo";
import graphApiService from "@/services/api/graphApi";
import cleanLeadsService from "@/services/api/cleanLeads";
import MarketingSegmentsForm from "@/components/MarketingSegmentsForm.vue";
import CompaniesSelector from "@/components/CompaniesSelector.vue";
import MarketingSegments from "@/views/MarketingSegments.vue";
import MarketingCampaignsService from "@/services/api/marketingCampaigns";
import chatService from "@/services/api/chats";
import environment from "@/environment";

import {
  getRandomInt,
  buildPayloadPagination,
  formatPhone,
  getCountryByPhone,
} from "@/utils/utils.js";
import { es } from "date-fns/locale";
export default {
  components: {
    MaterialCard,
    VTextFieldWithValidation,
    TodofullLabelsSelector,
    MarketingSegmentsForm,
    CompaniesSelector,
    MarketingSegments,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    hasToSendToMailchimp: false,
    setTodofullLabelsMassiveDialog: false,
    noChat: false,
    selectedChatId: null,
    selectedCleanLead: null,
    chatDialog: false,
    updateCheckbox: 0,
    marketingCampaigns: [],
    botIds: [],
    dateFrom: null,
    dateTo: null,
    selectedSegment: null,
    seeAllSegmentsDialog: false,
    todofullLabelsDialog: false,
    selectedCompanies: [],
    activatePreview: true,
    isSegmentFinalStep: false,
    segmentName: "",
    isSegmentPreviewMode: false,
    segmentDialog: false,
    templateMessages: [],
    marketingCampaignsDialog: false,
    globalSelector: false,
    selectedLabels: [],
    isFilterEmptyActive: false,
    dataTableLoading: true,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    search: "",
    dialog: false,
    itemsPerPage: 10,
    isDataReady: false,
    selectedOrder: 0,
    pagination: {},
    selectedLeads: [],
    headers: [
      {
        text: "checkbox",
        align: "center",
        sortable: false,
        value: "checkbox",
      },
      {
        text: "Última actualización",
        align: "left",
        sortable: false,
        value: "updatedAt",
      },
      {
        text: "Detalle del lead",
        align: "left",
        sortable: false,
        value: "fuente",
      },
      {
        text: "Teléfono",
        align: "left",
        sortable: false,
        value: "telefono",
      },
      {
        text: "Odoo",
        align: "left",
        sortable: false,
        value: "odoo_id",
        width: "100px",
      },
      {
        text: "Agente",
        align: "left",
        sortable: false,
        value: "telefonoId",
      },
      {
        text: "Estado",
        align: "left",
        sortable: false,
        value: "estado",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    leads: [],
    leadsReady: false,
    editedIndex: -1,
    editedItem: Leads(),
    defaultItem: Leads(),
    telefonos: [],
    search2: "",
    telefonoId: null,
    delayTimer: null,
    rolPermisos: {},
    fieldsToSearch: [
      "nombre",
      "apellido",
      "telefono",
      "displayName",
      "appName",
    ],
    todofullLabels: [],
    searchLabel: "",
    showLeadsWithoutLabel: false,
  }),

  computed: {
    getEnvironment() {
      return environment;
    },
    totalItems() {
      return this.$store.state.cleanLeadsModule.total;
    },
    totalPages() {
      return this.$store.state.cleanLeadsModule.totalPages;
    },
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo lead" : "Editar lead";
    },
    sourceSelectList() {
      return [
        ...this.$store.state.botsModule.bots.map((bot) => ({
          _id: bot._id,
          name: bot.name,
          company: bot.company,
        })),
        ...this.$store.state.woocommercesModule.woocommerces.map(
          (woocommerce) => ({
            _id: woocommerce._id,
            name: woocommerce.domain,
            company: woocommerce.company,
          })
        ),
        { name: "WHATSAPP" },
        { name: "ODOO" },
      ];
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.doSearch();
        this.updateCheckbox += 1;
      }, 400);
    },
    telefonoId() {
      this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
    },
  },

  mounted() {
    this.$store.commit("loadingModule/showLoading");
    this.selectedCompanies = [this.getCurrentCompany()];
    this.initialize(this.buildPayloadPagination(null, this.buildSearch()));
    console.log(this.sourceSelectList);
    this.rolAuth();
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "ChatBot/Leads",
          model: "Leads",
          company: this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },

    async initialize(paginationPayload) {
      this.$store.commit("loadingModule/showLoading", true);
      let body = {
        ...paginationPayload,
        sort: "updatedAt",
        order: "desc",
      };
      if (this.telefonoId) body["telefonoId"] = this.telefonoId._id;
      if (this.selectedLabels && this.selectedLabels.length > 0) {
        body["todofullLabels"] = this.selectedLabels.map((el) => el._id);
      }
      if (this.selectedCompanies.length > 0) {
          body["companies"] = this.selectedCompanies.map(c => c?._id);
      }
      if (this.showLeadsWithoutLabel) {
        body["showLeadsWithoutLabels"] = true;
      }
      if (this.dateFrom) {
        body["dateFrom"] = this.dateFrom;
      }
      if (this.dateTo) {
        body["dateTo"] = this.dateTo;
      }
      if (this.botIds.length > 0) {
        body["botIds"] = this.botIds;
      }
      if (this.selectedSegment) {
        body["segmentId"] = this.selectedSegment._id;
      }
      await Promise.all([
        this.selectedSegment
          ? this.$store.dispatch("cleanLeadsModule/listWithAdvanceFilter", body)
          : this.$store.dispatch("cleanLeadsModule/list", body),
        this.$store.dispatch("telefonosModule/list"),
        this.$store.dispatch("botsModule/list"),
        this.$store.dispatch("woocommercesModule/list"),
        this.$store.dispatch("todofullLabelsModule/list", {
          sort: "name",
          order: "asc",
          is_active: true,
        }),
      ]);
      this.$store.commit("loadingModule/showLoading", false);

      this.leads = this.$store.state.cleanLeadsModule.cleanLeads;
      this.todofullLabels = this.$store.state.todofullLabelsModule.todofullLabels;
      this.leadsReady = true;
      this.telefonos = this.$store.state.telefonosModule.telefonos.map(
        (telefono) => ({
          _id: telefono._id,
          agent: `${telefono.agenteId ? telefono.agenteId.nombre : ""} ${
            telefono.agenteId ? telefono.agenteId.apellido : ""
          } (${telefono.numero})`,
          fullname: `${telefono.agenteId ? telefono.agenteId.nombre : ""} ${
            telefono.agenteId ? telefono.agenteId.apellido : ""
          }`,
          cellphone: `${telefono.numero}`,
          active: telefono.active,
        })
      );
      this.dataTableLoading = false;
      // fetch odoo info for each lead
      this.leads.forEach((lead, index) => {
        if (lead.odoo_id) {
          odooService
            .getPartnerInfo(lead.odoo_id)
            .then((res) => {
              const result = res.data.payload.result;
              if (!result.results) {
                this.$set(this.leads, index, {
                  ...this.leads[index],
                  odooInfo: res.data.payload.result,
                });
              }
            })
            .catch((err) => {
              console.log(err);
            });
        }
      });
    },
    getCurrentCompany() {
      return this.$store.getters["authModule/getCurrentCompany"].company;
    },
    buildPayloadPagination(page, searchPayload) {
      return buildPayloadPagination(
        {
          page: page || 1,
          itemsPerPage: this.$store.state.itemsPerPage,
        },
        searchPayload
      );
    },
    editItem(item) {
      this.editedIndex = this.leads.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },
    async doSearch() {
      try {
        this.dataTableLoading = true;
        await this.initialize(
          buildPayloadPagination(
            {
              page: 1,
              itemsPerPage: this.$store.state.itemsPerPage,
            },
            this.buildSearch()
          )
        );
        this.dataTableLoading = false;
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.dataTableLoading = false;
      }
    },
    buildSearch() {
      return this.search
        ? { query: this.search, fields: this.fieldsToSearch.join(",") }
        : {};
    },

    async deleteItem(item) {
      const index = this.leads.indexOf(item);
      let itemId = this.leads[index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch("cleanLeadsModule/delete", itemId);
        this.leads.splice(index, 1);
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
        let itemId = this.leads[this.editedIndex]._id;
        try {
          await this.$store.dispatch("cleanLeadsModule/update", {
            id: itemId,
            data: { ...this.editedItem, sendToRetailRocket: true },
          });
          Object.assign(this.leads[this.editedIndex], this.editedItem);
          this.close();
        } finally {
          this.loadingButton = false;
        }
      } else {
        //create item
        try {
          //buscando telefono en contactos de Agentes
          let contactos = (
            await axios.get(
              "/api/contactos?filter=" +
                this.editedItem.telefono +
                "&fields=celular"
            )
          ).data.payload;
          if (contactos.length > 0) {
            //asignando agente random
            let randomContact =
              contactos[getRandomInt(0, contactos.length - 1)];
            this.editedItem.telefonoId = randomContact.telefonoId._id;
            this.editedItem.details[0].msnActivaDefault = this.editedItem
              .details[0].msnActivaDefault
              ? this.editedItem.details[0].msnActivaDefault
              : "SIN CONSULTA";
            // buscando detail con datos:
            let detail = this.editedItem.details.find(
              (el) => el.labels && el.labels.length > 0
            );
            console.log("🚀 Aqui *** -> detail", detail);
            //generando nota cuando se asignó un agente random
            console.log("🚀 Aqui *** -> randomContact", randomContact);
            this.editedItem.details[0].nota = `Hola ${
              randomContact.telefonoId.agenteId.nombre
            } tu cliente: ${
              detail ? detail.nombre : this.editedItem.details[0].nombre
            } con teléfono : ${this.editedItem.telefono} consulta: '${
              detail
                ? detail.msnActivaDefault
                : this.editedItem.details[0].msnActivaDefault
            }'. En cuanto la contactes me informas para borrarla de los pendientes`;
            if (detail) {
              detail.nota += `\n✅ *Etiquetas: ${detail.labels
                .filter((el) => el.labelId)
                .reduce((unique, o) => {
                  if (
                    !unique.some((obj) => obj.labelId.name === o.labelId.name)
                  ) {
                    unique.push(o);
                  }
                  return unique;
                }, [])
                .map((el) => el.labelId.name)
                .join(", ")}`;
            }

            this.editedItem.details[0].nota += `\n\nhttps://wa.me/${formatPhone(
              this.editedItem.telefono,
              getCountryByPhone(randomContact.telefonoId.numero)
            )}`;
            this.editedItem.estado = "RE-CONECTAR";
          } else {
            //Generando nota
            this.editedItem.estado = "SIN ASIGNAR";
          }
          this.editedItem.details[0].type = "CHATBOT"; //pagina por defecto
          const selectedSource = this.sourceSelectList.find(source => {
            return source._id ? source._id === this.editedItem.details[0].fuente : false;
          });
          if (selectedSource) {
            this.editedItem.details[0].company = selectedSource ? selectedSource.company : null;
          }
          this.editedItem.corporation = this.$store.getters["authModule/getCurrentCompany"].company.corporation;
          await this.$store.dispatch("cleanLeadsModule/create", {
            ...this.editedItem,
            is_manual: true,
          });
          //refrescar tabla
          this.initialize(
            this.buildPayloadPagination(null, this.buildSearch())
          );
          this.close();
        } finally {
          this.loadingButton = false;
        }
      }
    },
    async updateLabels(lead) {
      lead.todofullLabels = lead.todofullLabels.filter(
        (el) => typeof el === "object"
      );
    },
    async removeLabels(lead, label) {
      lead.todofullLabels.splice(
        lead.todofullLabels.findIndex((el) => el._id === label._id),
        1
      );
    },
    onSelectTodofullLabels(selectedLabels) {
      this.selectedLabels = selectedLabels;
      this.initialize(
        buildPayloadPagination(
          {
            page: 1,
            itemsPerPage: this.$store.state.itemsPerPage,
          },
          this.buildSearch()
        )
      );
    },
    showLeadsWithoutLabels() {
      this.showLeadsWithoutLabel = true;
      this.initialize(
        buildPayloadPagination(
          {
            page: 1,
            itemsPerPage: this.$store.state.itemsPerPage,
          },
          this.buildSearch()
        )
      );
    },
    showAllLeads() {
      this.showLeadsWithoutLabel = false;
      this.initialize(
        buildPayloadPagination(
          {
            page: 1,
            itemsPerPage: this.$store.state.itemsPerPage,
          },
          this.buildSearch()
        )
      );
    },
    async openMarketingCampaignsDialog() {
      this.marketingCampaignsDialog = true;
      // fetch marketing campaigns
      if (this.marketingCampaigns.length === 0) {
        this.marketingCampaigns = (
          await MarketingCampaignsService.list()
        ).data.payload;
      }
    },
    async sendTemplateMessage(template_name, marketingCampaign) {
      for (let i = 0; i < this.selectedLeads.length; i++) {
        try {
          await graphApiService.sendWhatsappMessageTemplates(
            this.selectedLeads[i].telefono,
            template_name,
            [],
            marketingCampaign.from,
            this.selectedLeads[i]._id,
            null,
            marketingCampaign._id
          );
        } catch (error) {
          console.log(error);
          this.$store.commit(
            "errorModule/error",
            `No se pudo enviar la campaña a ${this.selectedLeads[i].telefono}}`,
            { root: true }
          );
          this.$store.commit("errorModule/showError", true, { root: true });
        }
      }
      // send message
      this.marketingCampaignsDialog = false;
      this.$store.commit(
        "successModule/success",
        "Envío de campaña realizado",
        { root: true }
      );
      this.$store.commit("successModule/showSuccess", true, { root: true });
    },
    onSaveSegment() {
      this.segmentDialog = false;
      this.isSegmentPreviewMode = false;
      this.selectedLabels = [];
      this.isSegmentFinalStep = false;
      this.activatePreview = true;
      this.dateFrom = null;
      this.dateTo = null;
      this.botIds = [];
      this.showAllLeads();
    },
    onPreviewSegment({ todofullLabels, dateFrom, dateTo, botIds }) {
      this.isSegmentPreviewMode = true;
      this.segmentDialog = false;
      this.dateFrom = dateFrom;
      this.dateTo = dateTo;
      this.botIds = botIds;
      this.onSelectTodofullLabels(todofullLabels);
    },
    cancelSegmentPreview() {
      this.selectedSegment = null;
      this.isSegmentPreviewMode = false;
      this.selectedLabels = [];
      this.dateFrom = null;
      this.dateTo = null;
      this.botIds = [];
      this.showAllLeads();
    },
    onSelectedSegment(segment) {
      this.dateFrom = segment.dateFrom;
      this.dateTo = segment.dateTo;
      this.seeAllSegmentsDialog = false;
      this.selectedSegment = segment;
      this.onSelectTodofullLabels(segment.todofullLabels);
    },
    getPartnerInfo(item) {
      const odoo_id = item.odoo_id;
      console.log("🚀 Aqui *** -> odoo_id:", odoo_id);
      odooService
        .getPartnerInfo(odoo_id)
        .then((response) => {
          return response.data.payload.result;
        })
        .catch((error) => {
          console.log(error);
        });
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
    async setTodofullLabelsMassive(
      segmentId,
      todofullLabelIds,
      hasToSendToMailchimp
    ) {
      if (!todofullLabelIds || todofullLabelIds.length === 0) {
        this.$swal({
          title: "Error",
          text: "Debes seleccionar al menos una etiqueta",
          icon: "error",
        });
      } else {
        // ask for confirmation
        if (await this.$confirm("¿Confirmas esta acción?")) {
          this.$swal({
            title: "Procesando...",
            text: "El etiquetado masivo está en proceso",
            icon: "info",
            button: false,
          });
          this.setTodofullLabelsMassiveDialog = false;
          cleanLeadsService
            .setTodofullLabelsMassive(
              segmentId,
              todofullLabelIds,
              hasToSendToMailchimp
            )
            .then((res) => {
              console.log("Response: ", res.data);
            })
            .catch((err) => {
              console.log("Error: ", err);
            });
        }
      }
    },
  },
};
</script>

<style lang="scss">
.leads .text-left {
  font-size: 1em !important;
}
</style>
