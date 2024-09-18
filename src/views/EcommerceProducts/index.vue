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
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="ecommerces"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
          :options.sync="pagination"
          :server-items-length="totalItems"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold">Selecciona un dominio</span>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-combobox
                    v-model="selectedWoocommerce"
                    :items="$store.state.woocommercesModule.woocommerces"
                    hide-selected
                    item-value="_id"
                    placeholder="Selecciona el dominio"
                    outlined
                    dense
                    class="mt-2"
                    clearable
                    @change="initialize()"
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
                      <span>{{ item.domain }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                      <span>{{ item.domain }}</span>
                    </template>
                  </v-combobox>
                </v-col>
              </v-row>
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
                    placeholder="Escribe el nombre de producto"
                    single-line
                    outlined
                  ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-btn
                    color="success"
                    class="mb-1"
                    small
                    @click="
                      filterWithoutRef = !filterWithoutRef;
                      filterWithoutRefMethods();
                    "
                    >{{
                      filterWithoutRef
                        ? "Ver todos los productos"
                        : "Filtrar productos sin referencia"
                    }}</v-btn
                  >
                  <v-btn
                    color="info"
                    style="display: block"
                    small
                    @click="
                      filterWithoutImage = !filterWithoutImage;
                      filterWithoutImageMethods();
                    "
                    >{{
                      filterWithoutImage
                        ? "Ver todos los productos"
                        : "Filtrar productos sin imagen"
                    }}</v-btn
                  >
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12">
                  <span>
                    <strong>Mostrando:</strong>
                    {{
                      $store.state.itemsPerPage > ecommerces.length
                        ? ecommerces.length
                        : $store.state.itemsPerPage
                    }}
                    de {{ $store.state.ecommercesModule.total }} registros
                  </span>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="12">
                  <strong>Acciones:</strong>
                  <v-btn
                    v-show="selectedProductIds.length === 0"
                    class="mb-1 ml-1"
                    small
                    color="primary"
                    @click="syncAll"
                    >Sincronizar todo</v-btn
                  >
                  <v-btn
                    v-show="selectedProductIds.length > 0"
                    class="mb-1 ml-1"
                    small
                    color="secondary"
                    @click="syncSelected"
                    >Sincronizar Seleccionados</v-btn
                  >
                  <v-progress-linear
                    v-if="syncStarted"
                    v-model="countProductSyncPercentage"
                    color="blue-grey"
                    height="25"
                  >
                    <strong>
                      {{ countProductSync }} de {{ totalItems }} ({{
                        Math.ceil(countProductSyncPercentage) || 0
                      }}%)</strong
                    >
                  </v-progress-linear>
                  <v-progress-linear
                    v-if="syncStartedSelected"
                    v-model="countProductSyncPercentageSelected"
                    color="blue-grey"
                    height="25"
                  >
                    <strong>
                      {{ countProductSyncSelected }} de
                      {{ selectedProductsSize }} ({{
                        Math.ceil(countProductSyncPercentageSelected) || 0
                      }}%)</strong
                    >
                  </v-progress-linear>
                </v-col>
                <v-col cols="12" sm="12">
                  <div class="text-center pt-2">
                    <v-pagination
                      @input="initialize(page)"
                      v-model="page"
                      :length="pageCount"
                      :total-visible="$store.state.maxPaginationButtons"
                    ></v-pagination>
                  </div>
                </v-col>
              </v-row>
            </v-container>
          </template>
          <template v-slot:[`item.action`]="{ item }">
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
              $t(entity + ".NO_DATA")
            }}</v-alert>
          </template>
          <template v-slot:[`item.description`]="{ item }"
            ><span class="format-breaklines">
              {{ item.description }}
            </span></template
          >
          <template
            v-if="
              $store.state.woocommercesModule.woocommerces &&
              $store.state.woocommercesModule.woocommerces.length
            "
            v-slot:[`item.woocommerceId`]="{ item }"
          >
            <span v-if="item.woocommerceId"
              >{{ item.woocommerceId.domain }}
            </span></template
          >
          <template v-slot:[`item.date_modified`]="{ item }">{{
            item.date_modified | formatDate
          }}</template>
          <template v-slot:[`item.action`]="{ item }">
            <a :href="item.permalink" target="_blank"
              ><v-btn class="mt-3" color="primary" small>Visitar</v-btn>
            </a>
            <v-btn
              style="display: block"
              small
              class="mt-1"
              color="info"
              dark
              @click.stop="
                dialogTemplate = true;
                templateCountry = item.country;
                productId = item._id;
              "
            >
              Comment to MSN
            </v-btn>
            <v-btn
              style="display: block"
              class="mt-1"
              color="accent"
              dark
              @click.stop="
                dialogImage = true;
                currentProduct = item;
              "
              small
            >
              Multimedia
            </v-btn>
            <a :href="`/ecommerce/productos/${item._id}`" target="_blank">
              <v-btn style="display: block" class="mt-1" color="primary" small>
                Editar
              </v-btn>
            </a>
            <v-btn
              style="display: block"
              class="mt-1"
              color="yellow darken-3"
              dark
              @click.stop="
                dialogFullCopy = true;
                currentProduct = item;
              "
              small
            >
              Full Copy
            </v-btn>
            <v-btn
              style="display: block"
              class="mt-1"
              color="green darken-3"
              dark
              @click.stop="
                dialogCopyProperties = true;
                currentProduct = item;
              "
              small
            >
              Copiar Propiedades
            </v-btn>
            <v-btn
              style="display: block"
              class="mt-1"
              color="accent"
              dark
              @click.stop="updateMarketingAds(item)"
              :loading="loadingUpdateMarketingAds.includes(item._id)"
              small
            >
              Modificar Recursos de Marketing
            </v-btn>
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
          <template v-slot:[`item.ref`]="{ item }">
            <v-text-field
              :hint="item.ref"
              v-model="item.ref"
              append-outer-icon="mdi mdi-checkbox-marked-circle"
              placeholder="Referencia"
              @click:append-outer="updateRef(item._id, item)"
              @keyup.enter="updateRef(item._id, item)"
            ></v-text-field>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <v-chip v-if="item.status" color="success">Activo</v-chip>
            <v-chip v-else color="error">Inactivo</v-chip>
          </template>
          <template v-slot:[`item.checkbox`]="{ item }">
            <input
              v-model="selectedProductIds"
              type="checkbox"
              :value="item._id"
            />
          </template>
          <template v-slot:item.discount="{ item }">
            <div>
              <v-btn
                small
                color="secondary"
                icon
                @click="openDiscountDialog(item)"
              >
                <v-icon>mdi-sale</v-icon>
              </v-btn>
              <span class="format-breaklines" v-if="!!item.sale_price">
                {{ (item.regular_price - item.sale_price) | money }}
              </span>
            </div>
          </template>
        </v-data-table>
        <v-col cols="12" sm="12">
          <span>
            <strong>Mostrando:</strong>
            {{
              $store.state.itemsPerPage > ecommerces.length
                ? ecommerces.length
                : $store.state.itemsPerPage
            }}
            de {{ $store.state.ecommercesModule.total }} registros
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

    <v-dialog v-model="dialogTemplate" max-width="890">
      <v-card class="pa-5">
        <CommentToMSNUpdate
          :key="keyNumber"
          @click="keyNumber += 1"
          v-if="templateCountry && productId && dialogTemplate"
          :isTemplate="true"
          :country="templateCountry"
          :productId="productId"
          @saved="dialogTemplate = false"
        ></CommentToMSNUpdate>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogImage" max-width="890">
      <v-card v-if="currentProduct" class="pa-5">
        <v-card-title>
          <span class="text-h5">Multimedia</span>
        </v-card-title>

        <div class="px-5">
          <v-row>
            <v-col
              v-for="(multimedia, index) of currentProduct.multimedia.filter(el=>!el.post)"
              :key="index"
              cols="4"
            >
              <div class="d-flex flex-column align-center">
                <template v-if="getTypeUrl(multimedia.url) === 'video'">
                  <video
                    :src="multimedia.url"
                    controls
                    style="width: 100%; height: 350px"
                  ></video>
                </template>
                <template v-if="getTypeUrl(multimedia.url) === 'image'">
                  <img
                    :src="multimedia.url"
                    class="mb-2"
                    style="width: 100%; height: 350px"
                  />
                </template>
                <template v-if="getTypeUrl(multimedia.url) === 'youtube'">
                  <iframe
                    width="100%"
                    height="350px"
                    :src="getFormattedYoutube(multimedia.url)"
                  >
                  </iframe>
                </template>
                <MultimediaCategorySelect
                  class="mb-2"
                  style="width: 100%"
                  v-model="multimedia.categoryId"
                />
                <v-textarea
                  style="width: 100%"
                  dense
                  hide-details
                  v-model="multimedia.url"
                  placeholder="Escribe la url de la imagen"
                  single-line
                  outlined
                  clearable
                />
                <div class="d-flex justify-space-between align-center w-100">
                  <v-btn icon small @click="handleRemoveMultimedia(index)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                  <v-btn icon small @click="handleFeaturedImage(index)">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        :fill="
                          currentProduct.featured_images
                            ? currentProduct.featured_images
                                .map((el) => el.index)
                                .includes(index)
                              ? 'rgba(252, 196, 11)'
                              : 'rgba(0,0,0)'
                            : 'rgba(0,0,0)'
                        "
                        d="M12.076,2.549L9.122,8.442,2.5,9.5l5.32,5.174L5.858,21.5,12,17.874l6.142,3.626-1.962-6.826L21.5,9.5l-6.622-1.058Z"
                      />
                    </svg>
                  </v-btn>
                </div>
              </div>
            </v-col>
          </v-row>

          <div class="mt-3 ml-4 mb-3">
            <v-btn color="primary" @click="handleAddMultimedia">
              <v-icon>mdi-plus</v-icon>
              Añadir
            </v-btn>
          </div>
          <v-row class="mt-3">
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-header>
                  Consultar publicaciones en redes sociales
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-row>
                    <v-col
                      v-for="(multimedia,
                      index) of currentProduct.multimedia.filter(el=>el.post)"
                      :key="index"
                      cols="4"
                      class="position-relative"
                    >
                      <div
                        class="d-flex flex-column align-center"
                        style="position: relative;"
                      >
                        <!-- Checkbox in the top-right corner -->
                        <v-checkbox
                          v-model="multimedia.hasToUploadToMetaCatalogs"
                          class="top-right-checkbox"
                          hide-details
                          color="primary"
                        />

                        <template v-if="getTypeUrl(multimedia.url) === 'video'">
                          <video
                            :src="multimedia.url"
                            controls
                            style="width: 100%; height: 350px"
                          ></video>
                        </template>

                        <template v-if="getTypeUrl(multimedia.url) === 'image'">
                          <img
                            :src="multimedia.url"
                            class="mb-2"
                            style="width: 100%; height: 350px"
                          />
                        </template>

                        <template
                          v-if="getTypeUrl(multimedia.url) === 'youtube'"
                        >
                          <iframe
                            width="100%"
                            height="350px"
                            :src="getFormattedYoutube(multimedia.url)"
                          ></iframe>
                        </template>

                        <MultimediaCategorySelect
                          class="mb-2"
                          style="width: 100%;"
                          v-model="multimedia.categoryId"
                        />

                        <v-textarea
                          style="width: 100%;"
                          dense
                          hide-details
                          v-model="multimedia.url"
                          placeholder="Escribe la url de la imagen"
                          single-line
                          outlined
                          clearable
                        />

                        <div
                          class="d-flex justify-space-between align-center w-100"
                        >
                          <v-btn
                            icon
                            small
                            @click="handleRemoveMultimedia(index)"
                          >
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="12">
        <!-- Button to check all checkboxes -->
        <v-checkbox
          v-model="checkAll"
          label="Seleccionar todas las imágenes"
          @change="toggleCheckAllSocialMediaMultimedia"
        />
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-row>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="loadingButton"
            dark
            color="green darken-1"
            @click="
              dialogImage = false;
              saveCustomImage(currentProduct._id, currentProduct);
            "
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogFullCopy" width="1200">
      <v-card>
        <v-toolbar color="tertiary" dark>
          <v-toolbar-title v-if="currentProduct"
            >Tablas con IA para: {{ currentProduct.name }}</v-toolbar-title
          >
        </v-toolbar>
        <v-container
          ><v-btn
            dark
            color="green darken-1"
            @click="generateMarketingTableAI(currentProduct)"
            class="mb-3"
          >
            {{
              currentProduct && currentProduct.marketingTexts
                ? "Regenerar textos con IA"
                : "Generar"
            }}
          </v-btn>
          <v-container v-if="generatingTables"
            ><h3>Generando tablas...</h3></v-container
          >
          <v-container fluid v-else>
            <div v-if="currentProduct && currentProduct.marketingTexts">
              <div>
                <v-row
                  class="mb-3"
                  v-for="(table, tableIndex) in currentProduct.marketingTexts"
                  :key="tableIndex"
                >
                  <template>
                    <table>
                      <thead>
                        <tr v-if="table.title.toLowerCase().includes('tf-')">
                          <td>Nombre del grupo de recursos</td>
                          <td>{{ table.title }}</td>
                        </tr>
                        <tr v-else>
                          <td>{{ table.title }}</td>
                          <td v-if="table.maxCharacters">
                            Contador de caracteres permitidos ({{
                              table.maxCharacters
                            }})
                          </td>
                          <td v-else>Cantidad de caracteres</td>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(value, rowIndex) in table.values"
                          :key="rowIndex"
                          :style="{
                            backgroundColor:
                              !table.maxCharacters ||
                              value.length <= table.maxCharacters
                                ? 'inherit'
                                : '#ffcccc',
                          }"
                        >
                          <td>
                            <v-text-field
                              v-model="table.values[rowIndex]"
                              @click:append="
                                copyToClipboard(table.values[rowIndex])
                              "
                              append-icon="mdi-content-copy"
                              outlined
                              dense
                              hide-details
                            ></v-text-field>
                          </td>
                          <td>{{ table.values[rowIndex].length }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </template>
                </v-row>
              </div>
            </div>
          </v-container>
        </v-container>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="green darken-1"
            @click="
              saveMarketingTexts(currentProduct);
              dialogFullCopy = false;
            "
            >Guardar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogCopyProperties" width="1200">
      <v-card>
        <v-card-title>
          <v-icon color="primary" class="mr-1">mdi-update</v-icon>
          <span class="headline">Copiar propiedades a otro producto</span>
        </v-card-title>
        <v-divider></v-divider>
        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-container class="pa-5">
            <v-row dense>
              <v-col cols="12" sm="6" md="6">
                <p class="body-1 font-weight-bold mb-0">Nombre</p>
                <p>{{ currentProduct.name }}</p>
              </v-col>
              <v-col cols="12" sm="6" md="6">
                <p class="body-1 font-weight-bold mb-0">Referencia</p>
                <p>{{ currentProduct.ref }}</p>
              </v-col>
              <v-col cols="12">
                <span class="body-1 font-weight-bold">Compañia Destino</span>
                <VSelectWithValidation
                  v-model="companySelected"
                  :items="companies"
                  rules="required"
                  item-text="alias"
                  item-value="_id"
                  placeholder="Seleccionar Compañia"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <span class="font-weight-bold">Filtrar por productos</span>
                <v-autocomplete
                  item-text="name"
                  item-value="_id"
                  :search-input.sync="searchProduct"
                  :items="products"
                  dense
                  clearable
                  label="Busca el producto destino"
                  no-data-text="No se encontraron productos"
                  no-filter
                  solo
                  outlined
                  hide-details
                  @change="onSelectedProducts"
                >
                  <template v-slot:selection="{ item }">
                    <strong>{{ item.name }}</strong>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-container>
          <v-card-actions rd-actions>
            <div class="flex-grow-1"></div>
            <v-btn outlined color="error" text @click="close">Cancelar</v-btn>
            <v-btn
              :loading="loadingButton"
              color="success"
              @click="passes(copyPropertiesToAnotherEcommerce)"
              >Guardar</v-btn
            >
          </v-card-actions>
        </ValidationObserver>
      </v-card>
    </v-dialog>
    <v-dialog v-model="discountDialog" width="500">
      <v-card v-if="currentItem">
        <v-card-title class="text-h5 grey lighten-2"> Descuento </v-card-title>

        <v-card-text>
          <v-row class="pt-5">
            <v-col cols="4">
              <div class="pa-3 mb-2 rounded-lg elevation-1">
                <div>Precio Regular</div>
                <div>{{ currentItem.regular_price }}</div>
              </div>
              <div class="pa-3 mb-2 rounded-lg elevation-1">
                <div>Precio de venta</div>
                <v-text-field
                  v-model="currentItemSalePrice"
                  type="number"
                  single-line
                  dense
                  outlined
                  hide-details
                  min="0"
                  @change="reCalculateDiscountRate"
                />
              </div>
              <div class="pa-3 rounded-lg elevation-1">
                <div>Descuento %</div>
                <v-text-field
                  v-model="currentItemDiscountRate"
                  type="number"
                  single-line
                  dense
                  outlined
                  hide-details
                  min="0"
                  @change="reCalculateSalePrice"
                />
              </div>
            </v-col>
            <v-col cols="8">
              <div class="d-flex justify-space-around mb-5" style="gap: 10px">
                <div>
                  Fecha de inicio
                  <v-text-field
                    v-model="discountStartDate"
                    single-line
                    dense
                    outlined
                    hide-details
                  />
                </div>
                <div>
                  Fecha de fin
                  <v-text-field
                    v-model="discountEndDate"
                    single-line
                    dense
                    outlined
                    hide-details
                  />
                </div>
              </div>
              <div class="d-flex justify-center">
                <v-date-picker v-model="discountDates" range />
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" text @click="clerDiscount"> Borrar </v-btn>
          <v-btn text @click="discountDialog = false"> Cancelar </v-btn>
          <v-btn color="secondary" text @click="handleSaveDiscount">
            Aceptar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
const ENTITY = "ecommerces";
const CLASS_ITEMS = () =>
  import(`@/classes/${ENTITY.charAt(0).toUpperCase() + ENTITY.slice(1)}`);

import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";
import MultimediaCategorySelect from "@/components/MultimediaCategorySelect.vue";
import CommentToMSNUpdate from "@/views/CommentToMSNUpdate";
import { es } from "date-fns/locale";
import dialogflow from "@/services/api/dialogflow";
import ecommercesApi from "@/services/api/ecommerces";
import {
  timeout,
  getFileTypeFromUrl,
  getFormattedYoutubeUrl,
} from "@/utils/utils";
import auth from "@/services/api/auth";
import Vue from "vue";
import { getDatePartOnly } from "@/utils/dates-handle";
import openaiService from "@/services/api/openai";
import marketingTablePromptTemplate from "@/promptTemplates/marketingTables";
import { buildSuccess, handleError } from "@/utils/utils.js";
import VSelectWithValidation from "@/components/inputs/VSelectWithValidation.vue";
import ecommercesAdsApi from '@/services/api/ecommercesAds';

export default {
  components: {
    MaterialCard,
    CommentToMSNUpdate,
    MultimediaCategorySelect,
    VSelectWithValidation,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
    money: function (value) {
      return Intl.NumberFormat().format(value);
    },
  },
  data: () => ({
    checkAll:false,
    generatingTables: false,
    selectedWoocommerce: null,
    selectedProductIds: [],
    dialogFullCopy: false,
    dialogCopyProperties: false,
    dialogImage: false,
    currentProduct: null,
    keyNumber: 0,
    productId: null,
    templateCountry: null,
    dialogTemplate: false,
    page: 1,
    pagination: {},
    fieldsToSearch: [
      "name",
      "permalink",
      "ref",
      "stock_status",
      "status",
      "sku",
      "url",
    ],
    pageCount: 0,
    loadingButton: false,
    loadingUpdateMarketingAds: [],
    search: "",
    searchProduct: "",
    products: [],
    headers: [
      {
        text: "",
        align: "left",
        sortable: false,
        value: "checkbox",
      },
      {
        text: "Última modificación",
        align: "left",
        sortable: false,
        value: "date_modified",
        width: "10",
      },
      {
        text: "Nombre",
        align: "left",
        sortable: false,
        value: "name",
      },
      {
        text: "Referencia",
        align: "left",
        sortable: false,
        value: "ref",
      },
      {
        text: "Descuento",
        align: "center",
        sortable: false,
        value: "discount",
      },
      {
        text: "Atributos",
        align: "left",
        sortable: false,
        value: "attributes",
      },
      {
        text: "Categorías",
        align: "left",
        sortable: false,
        value: "categories",
      },
      {
        text: "Dominio",
        align: "left",
        sortable: false,
        value: "woocommerceId",
      },
      { text: "Acciones", align: "left", value: "action", sortable: false },
    ],
    [ENTITY]: [],
    advisors: [],
    companies: [],
    companySelected: null,
    productDestinationToCopy: null,
    editedIndex: -1,
    editedItem: CLASS_ITEMS(),
    defaultItem: CLASS_ITEMS(),
    menu1: false,
    menu2: false,
    filterWithoutRef: false,
    filterWithoutImage: false,
    syncStarted: false,
    countProductSync: 0,
    syncStartedSelected: false,
    countProductSyncSelected: 0,
    selectedProductsSize: 1,
    updateCheckbox: 0,
    rolPermisos: {},
    discountDialog: false,
    discountDates: [],
    currentItem: null,
    currentItemSalePrice: 0,
    currentItemDiscountRate: 0,
  }),
  computed: {
    discountStartDate: {
      get: function () {
        return this.discountDates[0];
      },
      set: function (value) {
        this.discountDates.splice(0, 1, value);
      },
    },
    discountEndDate: {
      get: function () {
        return this.discountDates[1];
      },
      set: function (value) {
        this.discountDates.splice(1, 1, value);
      },
    },
    totalItems() {
      return this.$store.state["ecommercesModule"].total;
    },
    totalPages() {
      return this.$store.state["ecommercesModule"].totalPages;
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
    countProductSyncPercentage() {
      return (this.countProductSync / this.totalItems) * 100;
    },
    countProductSyncPercentageSelected() {
      return (this.countProductSyncSelected / this.selectedProductsSize) * 100;
    },
  },
  watch: {
    async searchProduct() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.getProducts(1);
      }, 600);
    },
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.page = 1;
        this.initialize(this.page);
      }, 600);
    },
    currentProduct() {
      // add field multimedia social media dynamically
      if (this.currentProduct) {
        const multimedia = JSON.parse(JSON.stringify(this.currentProduct.multimedia))
        Vue.set(
          this.currentProduct,
          "socialMediaMultimedia",multimedia.filter(el=>el.post)
        );
      }
    },
  },
  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    await this.$store.dispatch("companiesModule/list"), this.initialize();
    this.rolAuth();
  },
  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          menu: "Configuracion/Propiedades/Woocommerces",
          model: "Productos",
          company:
            this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        })
        .finally(() => this.$store.commit("loadingModule/showLoading", false));
    },
    getTypeUrl(url) {
      return getFileTypeFromUrl(url);
    },
    getFormattedYoutube(url) {
      return getFormattedYoutubeUrl(url);
    },
    getIcon(url) {
      const type = getFileTypeFromUrl(url);
      switch (type) {
        case "image":
          return "mdi-image";
        case "video":
          return "mdi-video";
        case "audio":
          return "mdi-audio";
        case "document":
          return "mdi-file-document";
        default:
          return "";
      }
    },
    handleFeaturedImage(index) {
      if (!this.currentProduct.featured_images) {
        Vue.set(this.currentProduct, "featured_images", []);
      }
      if (
        !this.currentProduct.featured_images
          .map((el) => el.index)
          .includes(index)
      ) {
        this.currentProduct.featured_images.push({ index });
      } else {
        this.currentProduct.featured_images.splice(
          this.currentProduct.featured_images.findIndex(
            (el) => el.index == index
          ),
          1 // remove 1 element at index
        );
      }
    },
    async getProducts(page = 1) {
      if (!this.searchProduct) return;
      //llamada asincrona de items
      let payload = {
        sort: "name",
        page,
        search: this.searchProduct,
        fieldsToSearch: ["name", "ref"],
        listType: "All",
      };
      if (this.editedIndex > -1) {
        payload.country = this.selectedFanpage.country;
      }
      if (this.editedIndex === -1 && this.selectedCountry) {
        payload.country = this.selectedCountry;
      }
      await Promise.all([
        this.$store.dispatch("ecommercesModule/list", {
          sort: "name",
          page,
          search: this.searchProduct,
          fieldsToSearch: ["name", "ref"],
          listType: "All",
          companies: [this.companySelected],
        }),
      ]);
      //asignar al data del componente

      // .filter((el) => el.status === "publish") // mostrar solo produtos con status publish
      this.rawProducts = this.products = this.$deepCopy(
        this.$store.state.ecommercesModule.ecommerces
      );
    },
    onSelectedProducts(e) {
      this.searchProduct = "";
      this.productDestinationToCopy = e;
    },
    filterWithoutRefMethods() {
      this.initialize();
    },
    async initialize(page = 1) {
      //llamada asincrona de items
      let payload = {
        page,
        search: this.search,
        fieldsToSearch: this.fieldsToSearch,
        sort: "updatedAt",
        order: -1,
        // listType: "All",
      };
      if (this.filterWithoutRef) {
        payload["products_without_ref"] = true;
      }
      if (this.filterWithoutImage) {
        payload["products_without_image"] = true;
      }
      if (this.selectedWoocommerce && this.selectedWoocommerce._id) {
        payload["woocommerceId"] = this.selectedWoocommerce._id;
      }
      payload.companies = [
        this.$store.getters["authModule/getCurrentCompany"].company._id,
      ];
      await Promise.all([
        this.$store.dispatch("woocommercesModule/list", {
          companies: [
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          ],
        }),
        this.$store.dispatch(ENTITY + "Module/list", payload),
      ]);
      //asignar al data del componente
      this[ENTITY] = this.$deepCopy(
        this.$store.state[ENTITY + "Module"][ENTITY]
      ).map((el) => {
        const firstVariation = el.variations[0];

        return {
          ...el,
          regular_price: el.regular_price ?? firstVariation?.regular_price,
          sale_price: el.sale_price ?? firstVariation?.sale_price,
          dateOnSaleFrom:
            el.dateOnSaleFrom ?? firstVariation?.date_on_sale_from,
          dateOnSaleTo: el.dateOnSaleTo ?? firstVariation?.date_on_sale_to,
          originalRef: el.ref,
        };
      });
      // load all companies
      this.companies = this.$deepCopy(
        this.$store.state.companiesModule.companies
      );
    },
    async deleteItem(item) {
      const index = this[ENTITY].indexOf(item);
      let itemId = this[ENTITY][index]._id;
      if (await this.$confirm("¿Realmente deseas eliminar este registro?")) {
        await this.$store.dispatch(this[ENTITY] + "Module/delete", itemId);
        this[ENTITY].splice(index, 1);
      }
    },
    async copyPropertiesToAnotherEcommerce() {
      if (
        await this.$confirm(
          "¿Realmente deseas copiar y sobreescribir las propiedades: 'ref', 'multimedia' y 'copys' al producto destino seleccionado?"
        )
      ) {
        // Call service to copy those properties to another product
        ecommercesApi
          .copyMultimediaRefCopysToAnotherProduct({
            sourceId: this.currentProduct._id,
            destinationId: this.productDestinationToCopy,
          })
          .then(() => {
            buildSuccess(`Propiedades copiadas con éxito`, this.$store.commit);
          })
          .catch((error) => {
            handleError(error, this.$store.commit);
          })
          .finally(() => {
            this.dialogCopyProperties = false;
          });
      }
    },
    close() {
      this.dialogCopyProperties = false;
      this.productDestinationToCopy = null;
    },
    handleAddMultimedia() {
      if (!this.currentProduct.multimedia) {
        Vue.set(this.currentProduct, "multimedia", []);
      }
      this.currentProduct.multimedia.push({
        url: "",
      });
    },
    handleRemoveMultimedia(index) {
      this.currentProduct.multimedia.splice(index, 1);
      // remove index from featured_images
      this.currentProduct.featured_images.splice(
        this.currentProduct.featured_images.findIndex(
          (el) => el.index == index
        ),
        1 // remove 1 element at index
      );
    },
    async saveCustomImage(id, item) {
      this.loadingButton = true;
      try {
        await this.$store.dispatch(ENTITY + "Module/update", {
          id,
          data: { customImage: item.customImage, multimedia: item.multimedia },
        });
      } finally {
        this.loadingButton = false;
      }
    },
    async updateRef(id, item) {
      //actualizando nombre corto en entidad dialogflow
      await dialogflow.updateEntityValue({
        country: item.country,
        value: item.originalRef,
        newValue: item.ref,
      });
      item.originalRef = item.ref.trim();
      await this.$store.dispatch(ENTITY + "Module/update", {
        id: id,
        data: { ref: item.ref, originalRef: item.originalRef },
      });
    },
    filterWithoutImageMethods() {
      // filtrando productos sin imagen
      this.initialize();
    },
    /**
     * @description Se sincronizan todos los productos desde Woocommerce
     */
    async syncAll() {
      try {
        await ecommercesApi.syncAll();
        this.syncStarted = true;
        // si todo fue bien, activar el endpoint empezara a retornar la cantidad de productos sincronizados
        await timeout(3000);
        while (this.syncStarted) {
          try {
            await timeout(4000);
            this.countProductSync = (
              await ecommercesApi.syncAll()
            ).data.payload.countProductSync;
            // si se llega al límite, eliminar de localStorage
            if (this.countProductSync >= this.totalItems) {
              this.syncStarted = false;
              break;
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async syncSelected() {
      console.log("sincronizando...");
      try {
        await ecommercesApi.syncSelected({
          productIds: this.selectedProductIds,
          isInit: true,
        });
        this.selectedProductsSize = this.selectedProductIds.length;
        this.syncStartedSelected = true;
        let isReady = false;
        while (!isReady) {
          try {
            await timeout(4000);
            this.countProductSyncSelected = (
              await ecommercesApi.syncSelected({
                productIds: this.selectedProductIds,
              })
            ).data.payload.countProductSyncSelected;
            // si se llega al límite, terminar
            if (
              this.countProductSyncSelected == this.selectedProductIds.length
            ) {
              isReady = true;
              setTimeout(() => {
                this.syncStartedSelected = false;
                this.countProductSyncSelected = 0;
              }, 15 * 1000);
              this.selectedProductIds = [];
            }
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    reCalculateDiscountRate() {
      const regularPrice = this.currentItem.regular_price;
      const salePrice = this.currentItemSalePrice;
      const rate = (regularPrice - salePrice) / regularPrice;
      this.currentItemDiscountRate = rate * 100;
    },
    reCalculateSalePrice() {
      const regularPrice = this.currentItem.regular_price;
      const discountRate = this.currentItemDiscountRate / 100;
      this.currentItemSalePrice =
        regularPrice - this.currentItem.regular_price * discountRate;
    },
    openDiscountDialog(item) {
      this.currentItem = item;
      this.discountDialog = true;
      this.currentItemSalePrice = item.sale_price ?? item.regular_price;
      this.discountStartDate = item.dateOnSaleFrom
        ? getDatePartOnly(item.dateOnSaleFrom)
        : "";
      this.discountEndDate = item.dateOnSaleTo
        ? getDatePartOnly(item.dateOnSaleTo)
        : "";
      this.reCalculateDiscountRate();
    },
    async handleSaveDiscount() {
      const [dateOnSaleFrom, dateOnSaleTo] = this.discountDates;
      const dateOnSaleFromLocal = dateOnSaleFrom
        ? new Date(`${dateOnSaleFrom}T00:00:00`)
        : undefined;
      const dateOnSaleToLocal = dateOnSaleTo
        ? new Date(`${dateOnSaleTo}T00:00:00`)
        : undefined;

      const changes = {
        sale_price: this.currentItemSalePrice,
        dateOnSaleFrom: dateOnSaleFrom ? dateOnSaleFromLocal : undefined,
        dateOnSaleTo: dateOnSaleTo ? dateOnSaleToLocal : undefined,
      };

      await ecommercesApi.updateProductV2(this.currentItem._id, changes);

      Object.assign(this.currentItem, changes);

      this.discountDialog = false;
    },
    clerDiscount() {
      this.discountDates = [];
      this.currentItemSalePrice = this.currentItem.regular_price;
      this.currentItemDiscountRate = 0;
    },
    async generateMarketingTableAI(product) {
      try {
        this.generatingTables = true;
        const { name, ref, description, shortDescription, categories } =
          product;
        const attributesContext = product.attributes
          .map((el) => `${el.name}: ${el.options.join(",")}`)
          .join("\n");
        const categoriesContext = categories.map((el) => el.name).join("\n");
        const template = marketingTablePromptTemplate;
        const inputVariables = {
          product_name: name,
          product_short_name: this.convertToSentence(ref),
          product_attributes: attributesContext,
          product_categories: categoriesContext,
          short_description: shortDescription,
          long_description: description,
        };
        const marketingTexts = (
          await openaiService.generateMarketingTexts(template, inputVariables)
        ).data.payload;
        this.$set(this.currentProduct, "marketingTexts", marketingTexts);
        // save marketingTexts into marketingTexts in product
        this.$store.dispatch(ENTITY + "Module/update", {
          id: product._id,
          data: {
            marketingTexts: this.currentProduct.marketingTexts,
          },
        });
      } catch (error) {
        console.log("Some error genrating: ", error);
      } finally {
        this.generatingTables = false;
      }
    },
    saveMarketingTexts(product) {
      this.$store.dispatch(ENTITY + "Module/update", {
        id: product._id,
        data: {
          marketingTexts: product.marketingTexts,
        },
      });
    },
    async updateMarketingAds(product) {
      const isLoading = this.loadingUpdateMarketingAds.includes(product._id);
      if (isLoading) return

      this.loadingUpdateMarketingAds.push(product._id);

      ecommercesAdsApi
        .updateResources(product._id,)
        .then(() => {
          this.loadingUpdateMarketingAds = this.loadingUpdateMarketingAds.filter((id) => id !== product._id);
          buildSuccess(`Recursos de marketing actualizados para: ${product.name}`, this.$store.commit);
        })
        .catch((error) => {
          handleError(error, this.$store.commit);
        });
    },
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text);
        buildSuccess(`Copiado al portapapeles`, this.$store.commit);
      } catch (err) {
        console.error("Failed to copy: ", err);
      }
    },
    convertToSentence(text) {
      // Split the text into words
      let words = text.toLowerCase().split(" ");

      // Capitalize the first letter of each word
      for (let i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
      }

      // Join the words back into a sentence
      return words.join(" ");
    },
    toggleCheckAllSocialMediaMultimedia(val) {
      this.currentProduct.multimedia.forEach((multimedia) => {
        multimedia.hasToUploadToMetaCatalogs = val;
      });
    }
  },
};
</script>

<style lang="scss" scoped>
table {
  border-collapse: collapse;
  font-family: Tahoma, Geneva, sans-serif;
  margin-bottom: 15px;
  width: 100%;
}
table td {
  padding: 10px;
}
table thead td {
  background-color: #54585d !important;
  color: #ffffff !important;
  font-weight: bold !important;
  font-size: 13px !important;
  border: 1px solid #54585d !important;
}
table tbody td {
  color: #636363 !important;
  border: 1px solid #dddfe1 !important;
}
table tbody tr {
  background-color: #f9fafb;
}
table tbody tr:nth-child(odd) {
  background-color: #ffffff;
}

.copyable-value {
  cursor: pointer;
  color: blue;
  text-decoration: underline;
}
.copyable-value:hover {
  color: darkblue;
}

.top-right-checkbox {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: white; /* Background for visibility */
  border-radius: 4px; /* Rounded corners */
  padding: 1px;
  border: 2px solid #1976d2; /* Blue border */
  z-index: 10; /* Ensure it's on top */
}
</style>
