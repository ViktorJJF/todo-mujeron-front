<template>
  <v-container fluid class="massive-messages">
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="rounded-lg">
          <v-card-title class="headline primary white--text py-4 rounded-t-lg">
            <v-icon left color="white">mdi-message-text-multiple</v-icon>
            Mensajes Masivos
            <v-spacer></v-spacer>
            <v-btn
              color="white"
              class="primary--text"
              :loading="loading"
              :disabled="loading || (!conversations.length && !selectAllChats)"
              @click="sendMessages"
              elevation="1"
            >
              <v-icon left>mdi-send</v-icon>
              Enviar Mensajes
            </v-btn>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedPlatforms"
                    :items="platforms"
                    label="Seleccionar Plataformas"
                    multiple
                    chips
                    outlined
                    dense
                    hide-details="auto"
                    class="mb-4"
                    :rules="[
                      (v) =>
                        v.length > 0 || 'Selecciona al menos una plataforma',
                    ]"
                  >
                    <template v-slot:selection="{ item, index }">
                      <v-chip
                        v-if="index < 2"
                        small
                        :color="getPlatformColor(item.value)"
                        text-color="white"
                      >
                        <v-icon left small>{{
                          getPlatformIcon(item.value)
                        }}</v-icon>
                        {{ item.text }}
                      </v-chip>
                      <span v-if="index === 2" class="grey--text text-caption">
                        (+{{ selectedPlatforms.length - 2 }} más)
                      </span>
                    </template>
                  </v-select>
                </v-col>

                <v-col cols="12" md="6">
                  <v-autocomplete
                    v-model="selectedTemplate"
                    :items="imaginaTemplates"
                    label="Seleccionar Plantilla"
                    item-text="name"
                    item-value="_id"
                    outlined
                    dense
                    clearable
                    hide-details="auto"
                    class="mb-4"
                    @change="onTemplateSelect"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon color="primary">mdi-file-document-outline</v-icon>
                    </template>
                  </v-autocomplete>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="message"
                    label="Mensaje"
                    :rules="[(v) => !!v || 'El mensaje es requerido']"
                    :counter="messageCharLimit"
                    rows="4"
                    outlined
                    hide-details="auto"
                    class="mb-2"
                  ></v-textarea>
                  <div
                    v-if="selectedPlatforms.length > 0"
                    class="text-caption text-right mb-4"
                  >
                    <span
                      :class="{
                        'error--text': message.length > messageCharLimit,
                      }"
                    >
                      {{ message.length }} / {{ messageCharLimit }} caracteres
                      <v-icon
                        v-if="message.length > messageCharLimit"
                        x-small
                        color="error"
                        >mdi-alert-circle</v-icon
                      >
                    </span>
                  </div>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="url"
                    label="URL (opcional)"
                    outlined
                    dense
                    hide-details="auto"
                    class="mb-2"
                    clearable
                    :prefix="url ? '' : 'https://'"
                    @input="detectUrlType"
                  >
                    <template v-slot:prepend-inner>
                      <v-icon color="primary">mdi-link</v-icon>
                    </template>
                  </v-text-field>

                  <!-- Platform File Limits Info -->
                  <v-alert
                    v-if="selectedPlatforms.length > 0"
                    dense
                    text
                    color="info"
                    class="mt-1 mb-2 file-limits-alert"
                  >
                    <div class="d-flex align-center">
                      <v-icon left color="info">mdi-information-outline</v-icon>
                      <span class="font-weight-medium"
                        >Límites de archivos:</span
                      >
                    </div>
                    <div class="mt-1">
                      <div
                        v-for="(info, index) in platformFileInfo"
                        :key="index"
                        class="ml-4 mt-1"
                      >
                        <v-chip
                          x-small
                          :color="getPlatformColor(info.platform)"
                          text-color="white"
                          class="mr-1"
                        >
                          <v-icon left x-small>{{
                            getPlatformIcon(info.platform)
                          }}</v-icon>
                          {{ getPlatformText(info.platform) }}
                        </v-chip>
                        <span class="text-caption">
                          {{ info.description }}
                        </span>
                      </div>
                    </div>
                  </v-alert>

                  <!-- URL Preview -->
                  <div v-if="url" class="url-preview mb-4">
                    <v-card outlined>
                      <v-card-text class="py-2">
                        <div v-if="urlType === 'image'" class="text-center">
                          <v-img
                            :src="url"
                            max-height="200"
                            contain
                            class="grey lighten-4"
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
                        </div>
                        <div
                          v-else-if="urlType === 'video'"
                          class="text-center"
                        >
                          <v-icon size="48" color="primary">mdi-video</v-icon>
                          <div class="caption grey--text mt-2">
                            Archivo de video
                          </div>
                        </div>
                        <div
                          v-else-if="urlType === 'audio'"
                          class="text-center"
                        >
                          <v-icon size="48" color="primary">mdi-music</v-icon>
                          <div class="caption grey--text mt-2">
                            Archivo de audio
                          </div>
                        </div>
                        <div v-else-if="urlType === 'file'" class="text-center">
                          <v-icon size="48" color="primary"
                            >mdi-file-document-outline</v-icon
                          >
                          <div class="caption grey--text mt-2">
                            {{ getFileNameFromUrl(url) }}
                          </div>
                        </div>
                      </v-card-text>
                    </v-card>
                  </div>
                </v-col>
              </v-row>
            </v-form>

            <v-alert v-if="error" type="error" dense class="mt-4">
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" dense class="mt-4">
              ¡Mensajes enviados exitosamente!
            </v-alert>

            <!-- Conversations Preview Table -->
            <v-card outlined class="mt-6">
              <v-card-title class="py-2">
                <v-icon left color="primary">mdi-account-multiple</v-icon>
                Vista Previa de Chats
                <v-spacer></v-spacer>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Buscar"
                  single-line
                  hide-details
                  dense
                  outlined
                  class="table-search"
                ></v-text-field>
                <v-chip color="primary" outlined>
                  {{ totalConversations }} chats
                </v-chip>
              </v-card-title>

              <v-data-table
                v-model="selectedChats"
                :headers="headers"
                :items="conversations"
                :options.sync="options"
                :server-items-length="totalConversations"
                :loading="loading_table"
                :search="search"
                show-select
                dense
                class="elevation-0"
                :footer-props="{
                  'items-per-page-options': [50, 100, 200],
                  'items-per-page-text': 'Registros por página:',
                }"
                :no-data-text="'No hay conversaciones disponibles'"
                :no-results-text="'No se encontraron resultados'"
                item-key="_id"
                @click:row="onRowClick"
              >
                <template #[`item.platform`]="{ item }">
                  <v-chip
                    :color="getPlatformColor(item.platform)"
                    small
                    label
                    text-color="white"
                    class="px-2"
                  >
                    <v-icon left x-small>{{
                      getPlatformIcon(item.platform)
                    }}</v-icon>
                    {{ item.platform }}
                  </v-chip>
                </template>

                <template #[`item.last_activity`]="{ item }">
                  <span class="text-caption">
                    {{ formatDate(item.last_activity) }}
                  </span>
                </template>

                <template #[`item.phone`]="{ item }">
                  <span class="text-caption">
                    {{ item.leadId?.contactId }}
                  </span>
                </template>

                <template #[`item.last_message`]="{ item }">
                  <span
                    class="text-truncate d-inline-block"
                    style="max-width: 300px"
                  >
                    {{ item.last_message }}
                  </span>
                </template>
              </v-data-table>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline primary white--text">
          Confirmar envío de mensajes
        </v-card-title>
        <v-card-text class="pt-4">
          <p><strong>Plataformas seleccionadas:</strong></p>
          <v-chip-group>
            <v-chip
              v-for="platform in selectedPlatforms"
              :key="platform"
              :color="getPlatformColor(platform)"
              small
              label
              text-color="white"
              class="mr-2"
            >
              <v-icon left x-small>{{ getPlatformIcon(platform) }}</v-icon>
              {{ getPlatformText(platform) }}
            </v-chip>
          </v-chip-group>

          <p class="mt-4">
            <strong>Destinatarios:</strong>
            {{ getRecipientsText }}
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey darken-1" text @click="confirmDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="confirmAndSend" :loading="loading">
            Confirmar y Enviar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import chatsApi from "@/services/api/chats";
import imaginaTemplateMessagesApi from "@/services/api/imaginaTemplateMessages";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default {
  name: "MassiveMessages",

  data: () => ({
    valid: false,
    loading: false,
    error: null,
    success: false,
    message: "",
    url: "",
    selectedPlatforms: [],
    platforms: [
      { text: "Facebook", value: "facebook" },
      { text: "Instagram", value: "instagram" },
      { text: "WhatsApp", value: "whatsapp" },
      { text: "WhatsApp Imagina", value: "whatsapp_automated" },
    ],
    conversations: [],
    headers: [
      { text: "Plataforma", value: "platform", width: "150px" },
      { text: "Contacto", value: "contact_name" },
      { text: "Teléfono", value: "phone" },
      { text: "Último Mensaje", value: "last_message" },
      { text: "Última Actividad", value: "last_activity", width: "150px" },
    ],
    loading_table: false,
    search: "",
    options: {
      page: 1,
      itemsPerPage: 50,
      sortBy: ["last_activity"],
      sortDesc: [true],
    },
    totalConversations: 0,
    selectedChats: [],
    selectAllChats: false,
    selectedTemplate: null,
    imaginaTemplates: [],
    confirmDialog: false,
    urlType: null,
    platformFileLimits: {
      facebook: {
        image: "Imágenes: JPG, PNG, GIF (hasta 25MB)",
        video: "Videos: MP4, MOV, AVI (hasta 25MB)",
        audio: "Audio: AAC, M4A, WAV, MP4 (hasta 25MB)",
        file: "Documentos: PDF y otros (hasta 25MB)",
      },
      instagram: {
        image: "Imágenes: JPG, PNG, GIF (hasta 8MB)",
        video: "Videos: MP4, OGG, AVI, MOV, WEBM (hasta 25MB)",
        audio: "Audio: AAC, M4A, WAV, MP4 (hasta 25MB)",
        file: "No soportado",
      },
      whatsapp: {
        image: "Imágenes: JPEG, PNG (hasta 5MB)",
        video: "Videos: MP4, 3GPP (hasta 16MB)",
        audio: "Audio: MP3, OGG, AAC (hasta 16MB)",
        file: "Documentos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (hasta 100MB)",
      },
      whatsapp_automated: {
        image: "Imágenes: JPEG, PNG (hasta 5MB)",
        video: "Videos: MP4, 3GPP (hasta 100MB  )",
        audio: "Audio: MP3, OGG, AAC (hasta 16MB)",
        file: "Documentos: PDF, DOC, DOCX, XLS, XLSX (hasta 100MB)",
      },
    },
  }),

  watch: {
    selectedPlatforms: {
      handler() {
        this.fetchConversations();
      },
      immediate: true,
    },
    options: {
      handler() {
        this.fetchConversations();
      },
      deep: true,
    },
    selectAllChats(val) {
      if (val) {
        this.selectedChats = [...this.conversations];
      } else {
        this.selectedChats = [];
      }
    },
  },

  async created() {
    await this.fetchImaginaTemplates();
  },

  computed: {
    getRecipientsText() {
      if (this.selectedChats.length === 0) {
        return `Se enviará a todos los chats disponibles (${this.totalConversations} chats)`;
      }
      return `Se enviará a ${this.selectedChats.length} chat${
        this.selectedChats.length !== 1 ? "s" : ""
      } seleccionado${this.selectedChats.length !== 1 ? "s" : ""}`;
    },

    messageCharLimit() {
      if (!this.selectedPlatforms.length) return 2000;

      // Get the minimum character limit from all selected platforms
      const limits = {
        facebook: 2000,
        instagram: 1000,
        whatsapp: 4096,
        whatsapp_automated: 4096,
      };

      return Math.min(
        ...this.selectedPlatforms.map((platform) => limits[platform])
      );
    },

    platformFileInfo() {
      if (!this.selectedPlatforms.length) return [];

      // Get file info for each selected platform
      const selectedPlatformsInfo = this.selectedPlatforms.map((platform) => {
        const limits = this.platformFileLimits[platform];
        let description = "";

        if (this.url && this.urlType) {
          // If URL is present, show specific info for the detected file type
          const fileTypeInfo = limits[this.urlType];

          // Check if this file type is supported on this platform
          if (fileTypeInfo.includes("No soportado")) {
            description = `⚠️ ${fileTypeInfo} - Este tipo de archivo no es compatible con esta plataforma`;
          } else {
            description = fileTypeInfo;
          }
        } else {
          // Otherwise show general info
          description = `${limits.image} • ${limits.video} • ${limits.audio} • ${limits.file}`;
        }

        return {
          platform,
          description,
        };
      });

      return selectedPlatformsInfo;
    },
  },

  methods: {
    getPlatformColor(platform) {
      const colors = {
        facebook: "blue darken-1",
        instagram: "purple darken-1",
        whatsapp: "green darken-1",
        whatsapp_automated: "teal darken-1",
      };
      return colors[platform] || "grey";
    },

    getPlatformIcon(platform) {
      const icons = {
        facebook: "mdi-facebook",
        instagram: "mdi-instagram",
        whatsapp: "mdi-whatsapp",
        whatsapp_automated: "mdi-robot-happy",
      };
      return icons[platform] || "mdi-chat";
    },

    formatDate(date) {
      return format(new Date(date), "d MMM yyyy HH:mm", {
        locale: es,
      });
    },

    async fetchImaginaTemplates() {
      try {
        const response = await imaginaTemplateMessagesApi.list();
        this.imaginaTemplates = response.data.payload || [];
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    },

    onTemplateSelect(templateId) {
      if (!templateId) {
        this.message = "";
        this.url = "";
        this.urlType = null;
        return;
      }

      const template = this.imaginaTemplates.find((t) => t._id === templateId);
      if (template) {
        this.message = template.message || "";
        this.url = template.mediaUrl || template.documentUrl || "";
        this.detectUrlType(this.url);
      }
    },

    async fetchConversations() {
      if (!this.selectedPlatforms.length) {
        this.conversations = [];
        return;
      }

      this.loading_table = true;
      try {
        console.log("El company id es", this.$store.getters["authModule/getCurrentCompany"].company._id)
        const query = {
          platforms: this.selectedPlatforms,
          timeframe: "24h",
          page: this.options.page,
          limit: this.options.itemsPerPage,
          sort: this.options.sortBy[0] || "last_activity",
          order: this.options.sortDesc[0] ? "-1" : "1",
          companyId: this.$store.getters["authModule/getCurrentCompany"].company._id
        };

        const response = await chatsApi.getRecentChats(query);
        this.conversations = (response.data.payload || []).map((chat) => ({
          ...chat,
          contact_name: Array.isArray(chat.contact_name)
            ? chat.contact_name.join(", ")
            : chat.leadId?.appName || "Sin nombre",
          last_message: chat.last_message?.text || "",
          platform: chat.platform || "",
        }));
        this.totalConversations = response.data.totalDocs || 0;
      } catch (err) {
        this.error = "Error al cargar las conversaciones";
        console.error(err);
      } finally {
        this.loading_table = false;
      }
    },

    getPlatformText(platform) {
      const texts = {
        facebook: "Facebook",
        instagram: "Instagram",
        whatsapp: "WhatsApp",
        whatsapp_automated: "WhatsApp Imagina",
      };
      return texts[platform] || platform;
    },

    onRowClick(item, row) {
      row.select(!row.isSelected);
    },

    async sendMessages() {
      if (!this.$refs.form.validate()) return;
      this.confirmDialog = true;
    },

    getFileNameFromUrl(url) {
      try {
        return url.split("/").pop() || "Documento";
      } catch (e) {
        return "Documento";
      }
    },

    detectUrlType(url) {
      if (!url) {
        this.urlType = null;
        return;
      }

      const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
      const videoExtensions = ["mp4", "webm", "ogg", "avi", "mov", "3gpp"];
      const audioExtensions = ["mp3", "wav", "ogg", "aac", "m4a"];
      const documentExtensions = [
        "pdf",
        "doc",
        "docx",
        "xls",
        "xlsx",
        "ppt",
        "pptx",
      ];

      try {
        const extension = url.split(".").pop().toLowerCase();

        if (imageExtensions.includes(extension)) {
          this.urlType = "image";
        } else if (videoExtensions.includes(extension)) {
          this.urlType = "video";
        } else if (audioExtensions.includes(extension)) {
          this.urlType = "audio";
        } else if (documentExtensions.includes(extension)) {
          this.urlType = "file";
        } else {
          this.urlType = "file";
        }
      } catch (e) {
        this.urlType = "file";
      }
    },

    async confirmAndSend() {
      this.loading = true;
      this.error = null;
      this.success = false;

      try {
        // Prepare message according to type
        let messagePayload = {
          text: this.message,
          type: "text",
          payload: {},
        };

        // If URL is present, update message type and payload
        if (this.url) {
          switch (this.urlType) {
            case "image":
              messagePayload = {
                text: this.message,
                type: "image",
                payload: {
                  url: this.url,
                },
              };
              break;
            case "video":
              messagePayload = {
                text: this.message,
                type: "video",
                payload: {
                  url: this.url,
                },
              };
              break;
            case "audio":
              messagePayload = {
                text: this.message,
                type: "audio",
                payload: {
                  url: this.url,
                },
              };
              break;
            case "file":
              messagePayload = {
                text: this.message,
                type: "file",
                payload: {
                  url: this.url,
                  filename: this.getFileNameFromUrl(this.url),
                },
              };
              break;
          }
        }

        const payload = {
          platforms: this.selectedPlatforms,
          message: messagePayload,
          timeframe: "24h",
          chatIds: this.selectedChats.length
            ? this.selectedChats.map((chat) => chat._id)
            : null,
          companyId:
            this.$store.getters["authModule/getCurrentCompany"].company._id,
          userId: JSON.parse(localStorage.getItem("user"))._id,
        };

        chatsApi.sendMassiveMessage(payload);
        this.success = true;
        this.confirmDialog = false;
        this.$swal("Los mensajes se están enviando...");
      } catch (err) {
        this.error =
          err.response?.data?.message || "Error al enviar los mensajes";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.massive-messages {
  .v-card {
    border-radius: 8px;
  }

  .table-search {
    max-width: 300px;
  }

  .v-data-table {
    border-radius: 0 0 8px 8px;
  }

  .v-text-field.v-text-field--enclosed .v-text-field__details,
  .v-textarea.v-text-field--enclosed .v-text-field__details {
    margin-bottom: 0;
  }

  .text-truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .url-preview {
    .v-card {
      border: 1px dashed rgba(0, 0, 0, 0.12);

      &:hover {
        border-color: var(--v-primary-base);
      }
    }
  }

  .file-limits-alert {
    font-size: 0.85rem;

    .v-chip--x-small {
      height: 18px;
      font-size: 0.65rem;
    }
  }
}
</style>
