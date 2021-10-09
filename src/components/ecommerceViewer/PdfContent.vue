<template>
  <section class="pdf-content">
    <template v-for="product of products">
      <section class="page" :key="product.id">
        <div class="text-left">
          Rerefencia: {{product.ref}} - Tallas disponibles: {{getTallas(product)}}
        </div>
        <img
          class="product-image"
          :src="`/api/wp-image?url=${product.customImage}`"
          alt="Product Image"
        />
        <div class="text-right">
          Actualizado al {{getDate()}} - Pais: {{country}}
        </div>
      </section>

      <div class="html2pdf__page-break" :key="product.id"/>
    </template>


  </section>
</template>


<script>

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export default {
  props: {
    products: {
      type: Array,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  methods: {
    getTallas(product) {
      const tallaAttr = product.attributes.find(attr => attr.name.trim().toLowerCase() === 'talla')
      const tallasAvailable = tallaAttr && tallaAttr.options.length
      if(tallasAvailable) {
        return tallaAttr.options.join(', ')
      }
    },
    getDate() {
      const now = new Date();

      let day = now.getDay();
      let month = now.getMonth();
      let year = now.getFullYear();

      return `${day} de ${MONTHS[month].toLowerCase()} del ${year}`
    }
  }
}
</script>

<style scoped>
  .pdf-content {
    width: 100%;
    background: #fff;
  }

  .page {
    position: relative;
    width: 100%;
    height: 1100px;
    display: flex;
    justify-content: center;
    padding: 20px;
  }

  .product-image {
    max-width: 100%;
    max-height: 100%;
    height: auto;
  }

  .text-left {
    position: absolute;
    left: 80px;
    bottom: 10px;
    transform: rotate(-90deg);
    transform-origin: left;
  }

  .text-right {
    position: absolute;
    left: calc(100% - 83px);
    bottom: 10px;
    white-space: nowrap;
    transform: rotate(-90deg);
    transform-origin: left;
  }
</style>