<template>
  <v-container class="privacy py-12">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="7">
        <router-link :to="{ name: 'LandingPage' }" class="text-decoration-none">
          <v-btn text color="primary" small class="mb-6 px-0">
            <v-icon left small>mdi-arrow-left</v-icon>
            Volver
          </v-btn>
        </router-link>

        <h1 class="text-h4 font-weight-bold mb-2">Política de Privacidad</h1>
        <p class="text--secondary mb-8">Última actualización: julio de 2026</p>

        <section class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">1. Quiénes somos</h2>
          <p>
            Todofull es una plataforma que permite a los negocios de ecommerce
            gestionar sus integraciones y analizar los datos de sus clientes.
            Esta política describe cómo tratamos la información que recopilamos.
          </p>
        </section>

        <section class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">2. Datos que recopilamos</h2>
          <p>
            Recopilamos los datos que nos proporcionas al crear una cuenta y al
            conectar tus integraciones, incluida la información de tu cuenta de
            WhatsApp Business (nombre del negocio, número de teléfono e
            identificadores de la cuenta) que autorizas a través de Meta, así
            como los mensajes y contactos necesarios para operar el servicio.
          </p>
        </section>

        <section class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">3. Cómo usamos tus datos</h2>
          <p>
            Usamos estos datos únicamente para prestar y mejorar el servicio:
            conectar tus canales de mensajería, gestionar conversaciones con tus
            clientes y generar reportes para tu negocio. No vendemos tu
            información a terceros.
          </p>
        </section>

        <section class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">
            4. Integración con WhatsApp y Meta
          </h2>
          <p>
            Los Servicios se integran con la API de WhatsApp Business (Cloud
            API) para el envío y la recepción de mensajes en el número de
            WhatsApp Business del cliente. Los datos de las conversaciones son
            procesados por Meta conforme a sus propias políticas de privacidad.
            El negocio puede desconectar su número de WhatsApp en cualquier
            momento desde el panel.
          </p>
        </section>

        <section class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">
            5. Almacenamiento y seguridad
          </h2>
          <p>
            Aplicamos medidas técnicas y organizativas razonables para proteger
            tu información y la conservamos solo durante el tiempo necesario para
            prestar el servicio o cumplir obligaciones legales.
          </p>
        </section>

        <section class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">6. Tus derechos</h2>
          <p>
            Puedes solicitar el acceso, la corrección o la eliminación de tus
            datos, así como revocar las integraciones conectadas en cualquier
            momento desde tu cuenta o escribiéndonos.
          </p>
        </section>

        <section class="mb-6">
          <h2 class="text-h6 font-weight-bold mb-2">7. Contacto</h2>
          <p>
            Si tienes preguntas sobre esta política, escríbenos a
            <a href="mailto:contacto@todofull.club">contacto@todofull.club</a>.
          </p>
        </section>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "PrivacyPolicy",
};
</script>
