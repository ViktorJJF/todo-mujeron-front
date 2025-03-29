<template>
  <v-container>
    <div class="table">
      <div class="table-header">
        <div class="header__item">
          <a id="name" class="filter__link" href="#">Plantilla</a>
        </div>
        <div class="header__item">
          <a id="wins" class="filter__link filter__link--number" href="#"
            >Status</a
          >
        </div>
      </div>
      <div class="table-content">
        <div
          class="table-row"
          v-for="(templateMessage, idx) in templateMessages"
          :key="idx"
        >
          <div class="table-data">{{ templateMessage.name }}</div>
          <div class="table-data">
            <v-chip
              small
              class="ma-2"
              :color="templateMessage.status === 'APPROVED' ? 'green' : 'red'"
              text-color="white"
            >
              {{ templateMessage.status }}
            </v-chip>
          </div>
          <div v-show="showButtonSelect" class="table-data">
            <v-btn
              small
              color="secondary"
              @click="$emit('onSelectTemplateMessage', templateMessage)"
              >Seleccionar</v-btn
            >
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script>
import graphApiService from "@/services/api/graphApi";

export default {
  props: {
    showButtonSelect: {
      type: Boolean,
      default: false,
    },
  },
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
      // get bots
      const companyId =
        this.$store.getters["authModule/getCurrentCompany"].company._id;
      await Promise.all([
        this.$store.dispatch("botsModule/list", {
          companies: [companyId],
          platform: "whatsapp",
        }),
      ]);
      // get
      const botId = this.$store.state.botsModule.bots[0]._id;
      this.templateMessages = (
        await graphApiService.getWhatsappMessageTemplates(botId)
      ).data.payload;
    },
  },
};
</script>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700");

$base-spacing-unit: 24px;
$half-spacing-unit: $base-spacing-unit / 2;

$color-alpha: #1772ff;
$color-form-highlight: #eeeeee;

*,
*:before,
*:after {
  box-sizing: border-box;
}

body {
  padding: $base-spacing-unit;
  font-family: "Source Sans Pro", sans-serif;
  margin: 0;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
}

.container {
  max-width: 1000px;
  margin-right: auto;
  margin-left: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.table {
  width: 100%;
  border: 1px solid $color-form-highlight;
}

.table-header {
  display: flex;
  width: 100%;
  background: #000;
  padding: ($half-spacing-unit * 1.5) 0;
}

.table-row {
  display: flex;
  width: 100%;
  padding: ($half-spacing-unit * 1.5) 0;

  &:nth-of-type(odd) {
    background: $color-form-highlight;
  }
}

.table-data,
.header__item {
  flex: 1 1 20%;
  text-align: center;
}

.header__item {
  text-transform: uppercase;
}

.filter__link {
  color: white;
  text-decoration: none;
  position: relative;
  display: inline-block;
  padding-left: $base-spacing-unit;
  padding-right: $base-spacing-unit;

  &::after {
    content: "";
    position: absolute;
    right: -($half-spacing-unit * 1.5);
    color: white;
    font-size: $half-spacing-unit;
    top: 50%;
    transform: translateY(-50%);
  }

  &.desc::after {
    content: "(desc)";
  }

  &.asc::after {
    content: "(asc)";
  }
}
</style>
