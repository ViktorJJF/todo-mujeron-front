<template>
  <v-container> </v-container>
</template>

<script>
import MaterialCard from "@/components/material/Card";
import axios from "axios";
export default {
  components: {
    MaterialCard,
  },
  async mounted() {
    if (this.selectedTelefono.credenciales.access_token == "") {
      this.$store.commit(
        "setSelectedTelefono",
        await this.$store.dispatch(
          "telefonosModule/listOne",
          this.$route.params.id
        )
      );
    }
  },
  data() {
    return {
      knowledge: 97,
      dialog: false,
      contacts: [],
      totalItems: 0,
      totalPeople: 0,
      contactsReady: false,
    };
  },
  computed: {
    selectedTelefono() {
      return this.$store.state.selectedTelefono;
    },
  },
  methods: {
    contactsPreview() {
      if (this.contacts.length === 0) {
        this.contactsReady = false;
        axios
          .post("/api/google-people/contacts-preview", {
            ...this.selectedTelefono.credenciales,
          })
          .then((res) => {
            this.contacts = res.data.payload.connections;
            this.totalItems = res.data.payload.totalItems;
            this.totalPeople = res.data.payload.totalPeople;
            this.contactsReady = true;
          })
          .catch((err) => {
            console.error(err);
          });
      }
    },
    contactsExport() {
      console.log("exportando...");
    },
  },
};
</script>

<style lang="scss" scoped></style>
