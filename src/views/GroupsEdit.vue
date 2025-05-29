<template>
  <v-container v-if="isMounted">
    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        :title="group.nombre + ':    ' + currentMenu"
        text="Tabla resumen de permisos"
      >
        <template>
          <v-select
            :items="menuOptions"
            v-model="currentMenu"
            label="Seleccionar Menú"
            outlined
            dense
            @change="changeMenu"
          ></v-select>
        </template>
        <br />
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Name</th>
                <th class="text-left">Permisos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(model, index) in modelos[currentMenu]" :key="index">
                <td>{{ index }}</td>

                <td>
                  <v-autocomplete
                    chips
                    clearable
                    deletable-chips
                    multiple
                    small-chips
                    :items="permisos"
                    v-model="modelos[currentMenu][index]"
                  >
                  </v-autocomplete>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>

        <ValidationObserver ref="obs" v-slot="{ passes }">
          <v-btn
            class="justify-center"
            :loading="loadingButton"
            color="success"
            @click="passes(save)"
            >Guardar</v-btn
          >
        </ValidationObserver>
      </material-card>
    </v-row>

    <v-row justify="center">
      <material-card
        width="90%"
        icon="mdi-cellphone-dock"
        color="primary"
        :title="group.nombre"
        text="Tabla resumen de permisos"
      >
        <v-data-table
          no-results-text="No se encontraron resultados"
          :search="search"
          hide-default-footer
          :headers="headers"
          :items="users"
          sort-by="calories"
          @page-count="pageCount = $event"
          :page.sync="page"
          :items-per-page="$store.state.itemsPerPage"
        >
          <template v-slot:top>
            <v-container>
              <span class="font-weight-bold"
                >Agregar por email: {{ search }}</span
              >
              <v-row>
                <v-col cols="12" sm="4">
                  <v-text-field
                    dense
                    hide-details
                    v-model="addUserEmail"
                    placeholder="Escribe el email"
                    single-line
                    outlined
                  ></v-text-field>
                  <!-- <VTextFieldWithValidation
                      rules="required"
                      v-model="editedItem.nombre"
                      label="Ingresa el nombre"
                    /> -->
                </v-col>
                <v-col cols="12" sm="4">
                  <v-btn color="primary" dark class="mb-2" @click="editUser()"
                    >Agregar usuario
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </template>

          <template v-slot:[`item.action`]="{ item }">
            <v-btn
              :loading="loadingButton2"
              small
              color="error"
              @click="editUser(item)"
              >Eliminar</v-btn
            >
          </template>
        </v-data-table>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import { format } from "date-fns";
import MaterialCard from "@/components/material/Card";
import Groups from "@/classes/Groups";

// import auth from "@/services/api/auth";
export default {
  components: {
    MaterialCard,
  },
  filters: {
    formatDate: function (value) {
      return format(new Date(value), "dd/MM/yyyy");
    },
  },
  data: () => ({
    isMounted: false,
    page: 1,
    pageCount: 0,
    loadingButton: false,
    loadingButton2: false,
    search: "",
    addUser: "",
    currentMenu: "Configuracion/TodoFull",
    dialog: false,
    headers: [
      {
        text: "Nombre",
        align: "left",
        value: "first_name",
      },
      {
        text: "Apellido",
        align: "left",
        value: "last_name",
      },
      {
        text: "Email",
        align: "left",
        value: "email",
      },
      { text: "Acciones", value: "action", sortable: false },
    ],
    groups: [],
    permisos: ["Read", "Write", "Edit", "Delete"],
    rolPermisos: {},
    editedIndex: -1,
    editedItem: Groups(),
    defaultItem: Groups(),
    editedPermisos: {},

    addUserEmail: "",
    index: -1,
    group: {},
    users: [],
    modelos: {
      "Configuracion/TodoFull": {
        Companies: [],
        Agentes: [],
        EquipodeVentas: [],
        Usuarios: [],
        Locaciones: [],
        TodofullLabels: [],
        Groups: [],
      },
      "Configuracion/Propiedades": {
        Telefonos: [],
        LabelsAndAgents: [],
        Facebook: [],
        Dialogflow: [],
        Whatsapp: [],
        Drive: [],
      },
      "Configuracion/Propiedades/Mailchimp": {
        Credenciales: [],
        Contactos: [],
        Etiquetas: [],
      },
      "Configuracion/Propiedades/Woocommerces": {
        Productos: [],
        Categorias: [],
        Etiquetas: [],
        Contactos: [],
        Ordenes: [],
        Atributos: [],
        Woocommerces: [],
      },
      "Configuracion/Propiedades/Genial": {
        Productos: [],
        Categorias: [],
        Marcas: [],
        Vendedores: [],
      },
      "GoogleContact/Contactos": {
        Contactos: [],
      },
      "ChatBot/Bots": {
        Bots: [],
      },
      "ChatBot/Leads": {
        Leads: [],
        "Sin-Asignar": [],
        "Compra-Realizada": [],
        "Compra-Fallida": [],
        "Re-conectar": [],
        Informados: [],
        "Lista-Completa": [],
      },
      "ChatBot/MSN-Facebook": {
        "Etiqutas-FB-Messenger": [],
        "Etiquetas-FB-Ads": [],
        "Publicaciones-Comentarios-Defecto": [],
        "Publicaciones-Comentarios-Programado": [],
      },
      "Facebook/Facebook": {
        Comentarios: [],
        "Comentarios-SinResponder": [],
        "Ads-Messenger": [],
        Etiquetas: [],
      },
      "MultiPaginas/Paginas": {
        Paginas: [],
      },
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo grupo" : "Editar grupo";
    },
    menuOptions() {
      // Generate menu options from the modelos keys
      return Object.keys(this.modelos).map((key) => ({
        text: key.replace(/\//g, " > "), // Replace slashes with arrows for better readability
        value: key,
      }));
    },
  },

  watch: {
    dialog(val) {
      this.editedPermisos = Object.assign({}, this.editedItem.permisos);
      val || this.close();
    },
  },

  async mounted() {
    this.$store.commit("loadingModule/showLoading");
    await this.initialize();
  },

  methods: {
    async initialize() {
      await this.$store
        .dispatch("groupsModule/listOne", this.$route.params.id)
        .then((res) => {
          this.group = res;
        });

      this.users = await this.$store.dispatch("usersModule/list", {
        roles: this.group._id,
      });

      this.editedItem = Object.assign({}, this.group);

      this.modelos = [{}, this.modelos, this.group.permisos].reduce(this.merge);

      this.isMounted = true;

      this.$store.commit("loadingModule/showLoading", false);
    },

    merge(a, b) {
      return Object.entries(b).reduce((o, [k, v]) => {
        o[k] =
          v && typeof v === "object"
            ? this.merge((o[k] = o[k] || (Array.isArray(v) ? [] : {})), v)
            : v;
        return o;
      }, a);
    },

    changeMenu(menu) {
      this.currentMenu = menu;
      this.editedModelos = this.modelos[menu];
    },

    async editUser(item = false) {
      if (item) {
        const index = this.users.indexOf(item);
        await this.$store.dispatch("groupsModule/editGroupUsers", {
          id: this.group._id,
          data: { email: item.email, action: "Delete" },
        });
        this.users.splice(index, 1);
      } else {
        let newItem = await this.$store.dispatch(
          "groupsModule/editGroupUsers",
          {
            id: this.group._id,
            data: { email: this.addUserEmail, action: "Add" },
          }
        );
        this.users.push(newItem);
        this.addUserEmail = "";
      }
    },

    async save() {
      this.loadingButton = true;

      let itemId = this.$route.params.id;
      this.editedItem.permisos = this.modelos;
      try {
        await this.$store.dispatch("groupsModule/update", {
          id: itemId,
          data: this.editedItem,
        });
      } finally {
        this.loadingButton = false;
      }
    },
  },
};
</script>

<style>
.vcs {
  width: 50%;
}

.vcs__select-menu__not-main {
  height: 100%;
}
.vcs__select-menu {
  z-index: 1;
}
</style>
