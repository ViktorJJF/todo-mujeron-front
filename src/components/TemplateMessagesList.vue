<template>
  <v-container>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Name</th>
            <th class="text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(templateMessage, idx) in templateMessages" :key="idx">
            <td>{{ templateMessage.name }}</td>
            <td>
              <v-chip
                small
                class="ma-2"
                :color="templateMessage.status === 'APPROVED' ? 'green' : 'red'"
                text-color="white"
              >
                {{ templateMessage.status }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script>
import graphApiService from "@/services/api/graphApi";

export default {
  data() {
    return {
      templateMessages: [],
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize() {
      const whats_app_business_account_id = "111896868194668";
      this.templateMessages = (
        await graphApiService.getWhatsappMessageTemplates(
          whats_app_business_account_id
        )
      ).data.payload;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>