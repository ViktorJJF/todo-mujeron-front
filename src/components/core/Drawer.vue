<template v-if="getData">
  <v-navigation-drawer color="#040505" dark v-model="drawer" app width="300">
    <v-list>
      <v-list-item>
        <v-img
          aspect-ratio="1.7"
          contain
          src="/images/logo/todofull.jpg"
        ></v-img>
      </v-list-item>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">{{ user }}</v-list-item-title>
          <v-list-item-subtitle>{{ email }}</v-list-item-subtitle>
        </v-list-item-content>

        <!-- <v-list-item-action>
          <v-icon>mdi-menu-down</v-icon>
        </v-list-item-action>-->
      </v-list-item>
      <div class="text-center">
        <v-btn color="secondary" small :to="{ name: 'Profile' }"
          >Editar perfil</v-btn
        >
      </div>
    </v-list>

    <v-divider class="mx-3 mb-3"></v-divider>
    <v-list nav flat>
      <v-list-group
        :value="false"
        color="white"
        v-if="
          checkAuth('Configuracion/TodoFull') ||
          checkAuth('Configuracion/Propiedades')
        "
      >
        <template v-slot:activator>
          <v-list-item-icon>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Configuración</v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-group
          color="white"
          :value="false"
          no-action
          sub-group
          v-if="checkAuth('Configuracion/TodoFull')"
          class="sub-group-indent"
        >
          <template v-slot:activator>
            <v-list-item-content class="sub-group-activator">
              <v-list-item-title>TODO-FULL</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Companies' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Companies')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-office-building</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Compañias </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Usuarios' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Usuarios')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-account-multiple</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Usuarios </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'EquipoDeVentas' }"
            v-if="checkAuth('Configuracion/TodoFull', 'EquipodeVentas')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-account-group</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Equipo de ventas </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Agentes' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Agentes')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Agentes </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Locaciones' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Locaciones')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Locaciones </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'TodofullLabels' }"
            v-if="checkAuth('Configuracion/TodoFull', 'TodofullLabels')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-label</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Etiquetas Todofull</v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Groups' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Groups')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-group</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Grupos </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-group
          color="white"
          :value="false"
          no-action
          sub-group
          v-if="
            checkAuth('Configuracion/Propiedades') ||
            checkAuth('Configuracion/Propiedades/Mailchimp') ||
            checkAuth('Configuracion/Propiedades/Woocommerces') ||
            checkAuth('Configuracion/Propiedades/Genial')
          "
          class="sub-group-indent"
        >
          <template v-slot:activator>
            <v-list-item-content class="sub-group-activator">
              <v-list-item-title>Propiedades</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            v-for="propiedad in propiedades"
            :key="propiedad.id"
            active-class="primary custom2"
            :to="{ name: propiedad.to }"
            v-show="
              propiedad.to === 'MarketplaceFuentes' ||
              checkAuth('Configuracion/Propiedades', propiedad.to)
            "
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">{{ propiedad.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>
                {{ propiedad.text }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
          <v-list-group
            color="white"
            :value="false"
            no-action
            sub-group
            @click="
              checkAuth('Configuracion/Propiedades/Mailchimp', 'Credenciales')
                ? $router.push({ name: 'Mailchimp' })
                : ''
            "
            v-if="checkAuth('Configuracion/Propiedades/Mailchimp')"
            class="nested-sub-group"
          >
            <template v-slot:activator>
              <v-list-item-content class="nested-sub-group-activator">
                <v-list-item-title>Mailchimp</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              active-class="primary custom2"
              :to="{ name: 'MailchimpContacts' }"
              v-if="
                checkAuth('Configuracion/Propiedades/Mailchimp', 'Contactos')
              "
              class="nested-sub-item"
            >
              <v-list-item-icon class="nested-sub-item-icon">
                <v-icon size="18">mdi-account-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-content> Contactos </v-list-item-content>
            </v-list-item>
            <v-list-item
              active-class="primary custom2"
              :to="{ name: 'MailchimpTags' }"
              v-if="
                checkAuth('Configuracion/Propiedades/Mailchimp', 'Etiquetas')
              "
              class="nested-sub-item"
            >
              <v-list-item-icon class="nested-sub-item-icon">
                <v-icon size="18">mdi-tag-multiple</v-icon>
              </v-list-item-icon>
              <v-list-item-content> Etiquetas </v-list-item-content>
            </v-list-item>
          </v-list-group>

          <v-list-group
            color="white"
            :value="false"
            no-action
            sub-group
            v-if="checkAuth('Configuracion/Propiedades/Genial')"
            class="nested-sub-group"
          >
            <template v-slot:activator>
              <v-list-item-content class="nested-sub-group-activator">
                <v-list-item-title>Genial</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              active-class="primary custom2"
              :to="{ name: 'Vendors' }"
              v-if="checkAuth('Configuracion/Propiedades/Genial', 'Vendedores')"
              class="nested-sub-item"
            >
              <v-list-item-icon class="nested-sub-item-icon">
                <v-icon size="18">mdi-account-tie</v-icon>
              </v-list-item-icon>
              <v-list-item-content> Vendedores </v-list-item-content>
            </v-list-item>
          </v-list-group>
        </v-list-group>
      </v-list-group>
      <v-list-group
        :value="false"
        prepend-icon="mdi-account"
        color="white"
        v-if="checkAuth('GoogleContact/Contactos')"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Google Contact</v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item
          v-for="googleContact in googleContacts"
          :key="googleContact.id"
          active-class="primary custom2"
          :to="{ name: googleContact.to }"
          v-show="checkAuth('GoogleContact/Contactos', 'Contactos')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>{{ googleContact.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ googleContact.text }}
          </v-list-item-content>
        </v-list-item>
      </v-list-group>
      <v-list-group
        :value="false"
        prepend-icon="mdi-message-processing"
        color="white"
        v-if="
          checkAuth('ChatBot/Bots') ||
          checkAuth('ChatBot/Leads') ||
          checkAuth('ChatBot/MSN-Facebook')
        "
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Chatbot</v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'Bots' }"
          v-if="checkAuth('ChatBot/Bots', 'Bots')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-robot</v-icon>
          </v-list-item-icon>

          <v-list-item-content> Bots </v-list-item-content>
        </v-list-item>
        <v-list-group
          color="white"
          :value="false"
          no-action
          sub-group
          active-class="primary custom2"
          v-if="checkAuth('ChatBot/Bots', 'Bots')"
          class="sub-group-indent"
        >
          <template v-slot:activator>
            <v-list-item-content class="sub-group-activator">
              <v-list-item-title>Telegram</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'TelegramGroups' }"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-telegram</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Grupos </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'TelegramRoutines' }"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-script</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Rutinas </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'TelegramRoutineExecutions' }"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-history</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Ejecuciones </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-list-group
          color="white"
          :value="false"
          no-action
          sub-group
          :active-class="$route.name == 'Leads' ? 'primary custom2' : ''"
          @click="
            checkAuth('ChatBot/Leads', 'Leads')
              ? $router.push({ name: 'Leads' })
              : ''
          "
          v-if="checkAuth('ChatBot/Leads')"
          class="sub-group-indent"
        >
          <template v-slot:activator>
            <v-list-item-content class="sub-group-activator">
              <v-list-item-title>Leads</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsNuevos' }"
            v-if="checkAuth('ChatBot/Leads', 'Sin-Asignar')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-account-question</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Sin asignar </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsCompraRealizada' }"
            v-if="checkAuth('ChatBot/Leads', 'Compra-Realizada')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-cart-check</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Compra Realizada </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsCompraFallida' }"
            v-if="checkAuth('ChatBot/Leads', 'Compra-Fallida')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-cart-remove</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Compra Fallida </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsReconectar' }"
            v-if="checkAuth('ChatBot/Leads', 'Re-conectar')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-connection</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Re-conectar </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsInformados' }"
            v-if="checkAuth('ChatBot/Leads', 'Informados')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-information</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Informados </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsTodos' }"
            v-if="checkAuth('ChatBot/Leads', 'Lista-Completa')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-format-list-bulleted</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Lista Completa </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsWhatsapp' }"
            v-if="checkAuth('ChatBot/Leads', 'Lista-Completa')"
            class="sub-item-indent"
          >
            <v-list-item-icon class="sub-item-icon">
              <v-icon size="20">mdi-whatsapp</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Leads WhatsApp</v-list-item-content>
          </v-list-item>
        </v-list-group>
      </v-list-group>
      <v-list-group
        :value="false"
        prepend-icon="mdi-facebook"
        color="white"
        v-if="checkAuth('Facebook/Facebook')"
      >
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>Facebook</v-list-item-title>
          </v-list-item-content>
        </template>
        <!-- <v-list-group
          color="white"
          :value="false"
          no-action
          sub-group
          active-class="primary custom2"
          @click="$router.push({ name: 'CommentToMSN' })"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Comentarios</v-list-item-title>
            </v-list-item-content>
          </template>
        </v-list-group> -->
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'CommentToMSN' }"
          v-if="checkAuth('Facebook/Facebook', 'Comentarios')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-comment</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Comentarios </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'CommentsWithoutResponses' }"
          v-if="checkAuth('Facebook/Facebook', 'Comentarios-SinResponder')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-comment-remove</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Comentarios sin responder</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'LlmTracker' }"
          v-if="checkAuth('Facebook/Facebook', 'Comentarios-SinResponder')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-chart-timeline-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Seguimiento GPT</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'AdsMessenger' }"
          v-if="checkAuth('Facebook/Facebook', 'Ads-Messenger')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-facebook-messenger</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Ads Messenger</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'FacebookLabels' }"
          v-if="checkAuth('Facebook/Facebook', 'Etiquetas')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-label</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Etiquetas </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'FacebookAudiences' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Audiencias </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'TemplateMessages' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-message-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Mensajes de Plantilla </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'ImaginaTemplateMessages' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-message-image-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            Mensajes de Plantilla Imagina
          </v-list-item-content>
        </v-list-item>
      </v-list-group>

      <v-list-group
        :value="false"
        prepend-icon="mdi-web"
        color="white"
        v-if="checkAuth('MultiPaginas/Paginas')"
      >
        <template v-slot:activator>
          <v-list-item-title>Multi Páginas</v-list-item-title>
        </template>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'Catalogs' }"
          v-if="checkAuth('MultiPaginas/Paginas', 'Paginas')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-icon>

          <v-list-item-content> Página </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'Ordenes' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-cart</v-icon>
          </v-list-item-icon>

          <v-list-item-content> Ordenes </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'TelegramRoutines' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-image</v-icon>
          </v-list-item-icon>

          <v-list-item-content> Historias Estáticas </v-list-item-content>
        </v-list-item>
      </v-list-group>

      <v-list-group :value="false" prepend-icon="mdi-store" color="white">
        <template v-slot:activator>
          <v-list-item-title>Marketplace</v-list-item-title>
        </template>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceOrdenes' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-cart</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Ordenes</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceProductos' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-package-variant</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Productos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceProductosVariaciones' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-view-module</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Variaciones</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceBulkUpdate' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-table-edit</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Modificar Lote</v-list-item-content>
        </v-list-item>
      </v-list-group>

      <v-list-group
        color="white"
        no-action
        @click="
          checkAuth('Configuracion/Propiedades/Woocommerces', 'Woocommerces')
            ? $router.push({ name: 'Woocommerce' })
            : ''
        "
        v-if="checkAuth('Configuracion/Propiedades/Woocommerces')"
      >
        <template v-slot:activator>
          <v-list-item-icon>
            <v-icon>mdi-storefront</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Woocommerce</v-list-item-title>
          </v-list-item-content>
        </template>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'EcommerceProducts' }"
          v-if="
            checkAuth('Configuracion/Propiedades/Woocommerces', 'Productos')
          "
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-package-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Productos </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'EcommerceOrders' }"
          v-if="checkAuth('Configuracion/Propiedades/Woocommerces', 'Ordenes')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-cart</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Órdenes </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'EcommerceProductsVariations' }"
          v-if="checkAuth('Configuracion/Propiedades/Woocommerces', 'Ordenes')"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-view-module</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Variaciones </v-list-item-content>
        </v-list-item>
      </v-list-group>
      <v-list-group :value="false" prepend-icon="mdi-bullhorn" color="white">
        <template v-slot:activator>
          <v-list-item-title>Marketing</v-list-item-title>
        </template>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MassiveMessages' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-message-bulleted</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Mensajes masivos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MassiveMessagesLogs' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-history</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Historial Mensajes masivos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketingSegments' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-account-group-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Segmentos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketingCampaigns' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-flag-variant</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Campañas</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'TemplateMessagesLogs' }"
          class="main-menu-item"
        >
          <v-list-item-icon class="main-menu-icon">
            <v-icon>mdi-history</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Historial Plantillas</v-list-item-content>
        </v-list-item>
      </v-list-group>
      <v-list-item active-class="primary custom2" :to="{ name: 'Metrics' }">
        <v-list-item-icon>
          <v-icon>mdi-chart-bar</v-icon>
        </v-list-item-icon>
        <v-list-item-content> Métricas </v-list-item-content>
      </v-list-item>
      <v-list-item active-class="primary custom2" :to="{ name: 'SessionsMetrics' }">
        <v-list-item-icon>
          <v-icon>mdi-chart-line</v-icon>
        </v-list-item-icon>
        <v-list-item-content> Metricas sesiones </v-list-item-content>
      </v-list-item>
      <v-list-item active-class="primary custom2" :to="{ name: 'ChatRoom' }">
        <v-list-item-icon>
          <v-icon>mdi-chat</v-icon>
        </v-list-item-icon>
        <v-list-item-content> Chat en vivo </v-list-item-content>
      </v-list-item>

      <v-divider class="mx-3 mb-3"></v-divider>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import auth from "@/services/api/auth";

export default {
  data() {
    return {
      getData: false,
      rolPermisos: [],
      active2: false,
      propiedades: [
        {
          icon: "mdi-phone",
          text: "Google Contact",
          to: "Telefonos",
        },
        {
          icon: "mdi-tag-multiple",
          text: "Etiquetas y Agentes",
          to: "LabelsAndAgents",
        },
        {
          icon: "mdi-form-select",
          text: "Gravity Forms",
          to: "GravityForms",
        },
        // {
        //   icon: "mdi-check",
        //   text: "Woocommerce",
        //   to: "Woocommerce",
        // },
        {
          icon: "mdi-storefront",
          text: "Marketplace",
          to: "MarketplaceFuentes",
        },
        /*{
          icon: "mdi-check",
          text: "RetailRocket - Etiquetas",
          to: "RetailRocketTags",
        },*/
        // { icon: "mdi-format-list-bulleted", text: "Tipos", to: "type" },
        // { icon: "mdi-cellphone-dock", text: "Marcas", to: "brand" },
        // { icon: "mdi-format-color-fill", text: "Colores", to: "colors" },
      ],
      googleContacts: [
        {
          icon: "mdi-account",
          text: "Contactos",
          to: "Contactos",
        },
      ],
      etiquetas: [
        {
          icon: "mdi-label",
          text: "FB Messenger",
          to: "",
        },
        {
          icon: "mdi-facebook-ads",
          text: "FB Ads",
          to: "FB Ads",
        },
      ],
      expansionItems: [
        {
          title: "Configuración",
          active: false,
          icon: "mdi-settings",
          items: [
            {
              icon: "mdi-office-building",
              text: "Todo-Full",
              to: "EquipoDeVentas",
            },
            {
              icon: "mdi-map-marker",
              text: "Locaciones",
              to: "Locaciones",
            },
          ],
        },
      ],
    };
  },
  computed: {
    drawer: {
      get() {
        return this.$store.state.toolbar.drawerIcon;
      },
      set(newValue) {
        this.$store.state.toolbar.drawerIcon = newValue;
      },
    },
    user() {
      return this.$store.getters["authModule/getFullNameUser"];
    },
    email() {
      return this.$store.state.authModule.user
        ? this.$store.state.authModule.user.email
        : "example@gmail.com";
    },
  },

  async created() {
    await this.rolAuth();
    this.getData = true;
  },

  methods: {
    rolAuth() {
      auth
        .roleAuthorization({
          id: this.$store.state.authModule.user._id,
          company:
            this.$store.getters["authModule/getCurrentCompany"].company._id,
        })
        .then((res) => {
          this.rolPermisos = res.data;
        });
    },

    checkAuth(menu, model = false) {
      try {
        if (model) {
          if (this.rolPermisos[menu][model].indexOf("Read") > -1) {
            return true;
          }
        } else {
          for (const model in this.rolPermisos[menu]) {
            if (this.rolPermisos[menu][model].indexOf("Read") > -1) {
              return true;
            }
          }
        }
        return false;
      } catch (error) {
        return false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.custom2 {
  color: white;
}

// Main group styling
.v-list-group {
  &::before {
    background-color: transparent;
  }
}

// Sub-group indentation (level 1)
.sub-group-indent {
  .v-list-group__header {
    padding-left: 32px !important;
  }
}

.sub-group-activator {
  padding-left: 8px;

  .v-list-item__title {
    font-size: 14px;
    font-weight: 500;
    opacity: 0.9;
  }
}

// Sub-item indentation (level 2)
.sub-item-indent {
  padding-left: 56px !important;
  min-height: 40px !important;

  .v-list-item__content {
    font-size: 13px;
  }
}

.sub-item-icon {
  margin-right: 16px !important;
  min-width: 32px !important;

  .v-icon {
    opacity: 0.8;
  }
}

// Nested sub-group indentation (level 2)
.nested-sub-group {
  .v-list-group__header {
    padding-left: 56px !important;
  }
}

.nested-sub-group-activator {
  padding-left: 8px;

  .v-list-item__title {
    font-size: 13px;
    font-weight: 500;
    opacity: 0.85;
  }
}

// Nested sub-item indentation (level 3)
.nested-sub-item {
  padding-left: 80px !important;
  min-height: 36px !important;

  .v-list-item__content {
    font-size: 12px;
  }
}

.nested-sub-item-icon {
  margin-right: 12px !important;
  min-width: 28px !important;

  .v-icon {
    opacity: 0.7;
  }
}

// Hover effects
.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

// Active state improvements
.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.2) !important;
  border-left: 3px solid var(--v-theme-primary);

  .v-icon {
    color: var(--v-theme-primary) !important;
  }
}

// Divider styling
.v-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
  margin: 8px 16px !important;
}

// Profile section styling
.title {
  font-weight: 600 !important;
  font-size: 16px !important;
}

// Logo section
.v-img {
  border-radius: 8px;
  margin: 8px;
}

// Button styling
.v-btn {
  text-transform: none !important;
  font-weight: 500 !important;
}

.main-menu-item {
  padding-left: 32px !important;
  min-height: 40px !important;

  .v-list-item__content {
    font-size: 14px;
  }
}

.main-menu-icon {
  margin-right: 16px !important;
  min-width: 32px !important;

  .v-icon {
    opacity: 0.9;
  }
}
</style>
