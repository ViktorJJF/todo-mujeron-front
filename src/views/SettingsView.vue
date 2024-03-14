<template>
  <v-container>
    <v-row justify="center">
      <material-card
        width="1500px"
        icon="mdi-cellphone-dock"
        color="primary"
        title="Páginas conectadas"
      >
        <h1>Páginas conectadas</h1>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">#</th>
                <th class="text-left">Plataforma</th>
                <th class="text-left">ID</th>
                <th class="text-left">Nombre</th>
                <th class="text-left">Categoría</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(page, pageIndex) in metaPages" :key="pageIndex">
                <td>{{ pageIndex + 1 }}</td>
                <td>
                  <img
                    src="https://i.pinimg.com/originals/ce/d6/6e/ced66ecfc53814d71f8774789b55cc76.png"
                    alt=""
                    width="30px"
                  />
                </td>
                <td>{{ page.id }}</td>
                <td>{{ page.name }}</td>
                <td>{{ page.category }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </material-card>
    </v-row>
  </v-container>
</template>

<script>
import graphApiService from "@/services/api/graphApi";

export default {
  data() {
    return {
      metaPages: [],
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    initialize() {
      // fetch all meta connected pages
      const TOKEN = localStorage.getItem("facebookAccessToken");
      graphApiService.getBusinessPages(TOKEN).then((response) => {
        this.metaPages = response.data.payload;
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
