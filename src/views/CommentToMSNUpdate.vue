<template>
  <v-container>
    <v-card>
      <v-divider></v-divider>
      <ValidationObserver ref="obs" v-slot="{ passes }">
        <v-container class="pa-5" v-if="commentFacebook">
          <v-row dense>
            <v-col cols="12" sm="12" md="12" class="mb-2">
              <p class="body-1 font-weight-bold">
                URL de publicación
                <a :href="commentFacebook.postUrl" target="_blank">{{
                  commentFacebook.postUrl
                }}</a>
              </p>
              <!-- <VTextFieldWithValidation
                rules=""
                v-model="commentFacebook.fanpageId"
                label="Ingresa el fanpageId"
              /> -->
              <VTextFieldWithValidation
                rules="required"
                v-model="commentFacebook.postUrl"
                label="Ingresa la URL"
              />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" sm="12" md="12">
              <v-img :src="postPicture" aspect-ratio="4" contain></v-img>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" sm="12" md="12">
              <p class="body-1 font-weight-bold">
                Productos
              </p>
              <v-combobox
                v-model="chips"
                :items="items"
                chips
                clearable
                label="Your favorite hobbies"
                multiple
                prepend-icon="mdi-filter-variant"
                solo
              >
                <template v-slot:selection="{ attrs, item, select, selected }">
                  <v-chip
                    v-bind="attrs"
                    :input-value="selected"
                    close
                    @click="select"
                    @click:close="remove(item)"
                  >
                    <strong>{{ item }}</strong
                    >&nbsp;
                    <span>(interest)</span>
                  </v-chip>
                </template>
              </v-combobox>
            </v-col>
          </v-row>
          <v-row dense>
            <v-col cols="12" sm="12" md="12">
              <p class="body-1 font-weight-bold">
                Respuestas
              </p>
              <v-card color="basil">
                <v-tabs
                  v-model="tab"
                  background-color="transparent"
                  color="basil"
                  grow
                >
                  <v-tab v-for="item in items" :key="item">
                    {{ item }}
                  </v-tab>
                </v-tabs>

                <v-tabs-items v-model="tab">
                  <v-tab-item v-for="item in items" :key="item">
                    <div class="mt-3">
                      <v-textarea
                        v-show="tab == 0"
                        dense
                        outlined
                        hide-details="auto"
                        placeholder="Respuesta 1"
                        v-model="commentFacebook.responses[0]"
                        class="mb-2"
                      ></v-textarea>
                      <v-textarea
                        v-show="tab == 1"
                        dense
                        outlined
                        hide-details="auto"
                        placeholder="Respuesta 2"
                        v-model="commentFacebook.responses[1]"
                        class="mb-2"
                      ></v-textarea>
                      <v-textarea
                        v-show="tab == 2"
                        dense
                        outlined
                        hide-details="auto"
                        placeholder="Respuesta 3"
                        v-model="commentFacebook.responses[2]"
                        class="mb-2"
                      ></v-textarea>
                    </div>
                  </v-tab-item>
                </v-tabs-items>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
        <v-card-actions rd-actions>
          <div class="flex-grow-1"></div>
          <v-btn :loading="loadingButton" color="success" @click="passes(save)"
            >Guardar</v-btn
          >
        </v-card-actions>
      </ValidationObserver>
    </v-card>
    <v-btn color="primary" @click="$router.push({ name: 'CommentToMSN' })"
      >Volver Atrás</v-btn
    >
  </v-container>
</template>

<script>
import { format } from "date-fns";
import VTextFieldWithValidation from "@/components/inputs/VTextFieldWithValidation";
import axios from "axios";
// import MaterialCard from "@/components/material/Card";
import { es } from "date-fns/locale";
export default {
  components: {
    // MaterialCard,
    VTextFieldWithValidation,
  },
  filters: {
    formatDate: function(value) {
      return format(new Date(value), "d 'de' MMMM 'del' yyyy", {
        locale: es,
      });
    },
  },
  data: () => ({
    loadingButton: false,
    commentsFacebook: [],
    commentFacebook: null,
    chips: [
      "Programming",
      "Playing video games",
      "Watching movies",
      "Sleeping",
    ],
    items: ["Respuesta 1", "Respuesta 2", "Respuesta 3"],
    tab: null,
    postPicture: "",
  }),

  computed: {},

  async mounted() {
    await this.initialize();
    this.getPostImage();
  },

  methods: {
    async initialize() {
      await Promise.all([
        this.$store.dispatch("commentsFacebookModule/list", { limit: 9999 }),
      ]);
      this.commentsFacebook = this.$deepCopy(
        this.$store.state.commentsFacebookModule.commentsFacebook
      );
      this.commentFacebook = this.commentsFacebook.find(
        (commentFacebook) => commentFacebook._id === this.$route.params.id
      );
    },
    async getPostImage() {
      let postId = this.commentFacebook.postUrl.match(/\d+/g)[0];
      console.log("trayendo con post: ", postId);
      axios
        .get(
          "/api/graph-api/" +
            this.commentFacebook.fanpageId +
            "/" +
            this.commentFacebook.fanpageId +
            "_" +
            postId
        )
        .then((res) => {
          console.log(res.data);
          this.postPicture = res.data.payload.full_picture;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    async save() {
      this.loadingButton = true;
      try {
        await this.$store.dispatch("commentsFacebookModule/update", {
          id: this.commentFacebook._id,
          data: this.commentFacebook,
        });
      } finally {
        this.loadingButton = false;
      }
    },
    remove(item) {
      this.chips.splice(this.chips.indexOf(item), 1);
      this.chips = [...this.chips];
    },
  },
};
</script>

<style lang="scss" scoped></style>
