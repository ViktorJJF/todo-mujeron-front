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
        prepend-icon="mdi-settings"
        color="white"
        v-if="
          checkAuth('Configuracion/TodoFull') ||
          checkAuth('Configuracion/Propiedades')
        "
      >
        <template v-slot:activator>
          <v-list-item-title>Configuración</v-list-item-title>
        </template>
        <v-list-group
          color="white"
          :value="false"
          no-action
          sub-group
          v-if="checkAuth('Configuracion/TodoFull')"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>TODO-FULL</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Companies' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Companies')"
          >
            <v-list-item-icon>
              <v-icon>mdi-office-building</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Compañias </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Usuarios' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Usuarios')"
          >
            <v-list-item-icon>
              <v-icon>mdi-account-multiple</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Usuarios </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'EquipoDeVentas' }"
            v-if="checkAuth('Configuracion/TodoFull', 'EquipodeVentas')"
          >
            <v-list-item-icon>
              <v-icon>mdi-account-group</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Equipo de ventas </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Agentes' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Agentes')"
          >
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Agentes </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Locaciones' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Locaciones')"
          >
            <v-list-item-icon>
              <v-icon>mdi-map-marker</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Locaciones </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'TodofullLabels' }"
            v-if="checkAuth('Configuracion/TodoFull', 'TodofullLabels')"
          >
            <v-list-item-icon>
              <v-icon>mdi-label</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Etiquetas Todofull</v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'Groups' }"
            v-if="checkAuth('Configuracion/TodoFull', 'Groups')"
          >
            <v-list-item-icon>
              <v-icon>mdi-group</v-icon>
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
        >
          <template v-slot:activator>
            <v-list-item-content>
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
          >
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
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Mailchimp</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              active-class="primary custom2"
              :to="{ name: 'MailchimpContacts' }"
              v-if="
                checkAuth('Configuracion/Propiedades/Mailchimp', 'Contactos')
              "
            >
              <v-list-item-content> Contactos </v-list-item-content>
            </v-list-item>
            <v-list-item
              active-class="primary custom2"
              :to="{ name: 'MailchimpTags' }"
              v-if="
                checkAuth('Configuracion/Propiedades/Mailchimp', 'Etiquetas')
              "
            >
              <v-list-item-content> Etiquetas </v-list-item-content>
            </v-list-item>
          </v-list-group>

          <v-list-group
            color="white"
            :value="false"
            no-action
            sub-group
            v-if="checkAuth('Configuracion/Propiedades/Genial')"
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>Genial</v-list-item-title>
              </v-list-item-content>
            </template>
            <v-list-item
              active-class="primary custom2"
              :to="{ name: 'Vendors' }"
              v-if="checkAuth('Configuracion/Propiedades/Genial', 'Vendedores')"
            >
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
        >
          <v-list-item-icon>
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
        >
          <v-list-item-icon>
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
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Telegram</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'TelegramGroups' }"
          >
            <v-list-item-icon>
              <v-icon>mdi-telegram</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Grupos </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'TelegramRoutines' }"
          >
            <v-list-item-icon>
              <v-icon>mdi-script</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Rutinas </v-list-item-content>
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
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>Leads</v-list-item-title>
            </v-list-item-content>
          </template>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsNuevos' }"
            v-if="checkAuth('ChatBot/Leads', 'Sin-Asignar')"
          >
            <v-list-item-icon>
              <v-icon>mdi-account-question</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Sin asignar </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsCompraRealizada' }"
            v-if="checkAuth('ChatBot/Leads', 'Compra-Realizada')"
          >
            <v-list-item-icon>
              <v-icon>mdi-cart-check</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Compra Realizada </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsCompraFallida' }"
            v-if="checkAuth('ChatBot/Leads', 'Compra-Fallida')"
          >
            <v-list-item-icon>
              <v-icon>mdi-cart-remove</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Compra Fallida </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsReconectar' }"
            v-if="checkAuth('ChatBot/Leads', 'Re-conectar')"
          >
            <v-list-item-icon>
              <v-icon>mdi-connection</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Re-conectar </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsInformados' }"
            v-if="checkAuth('ChatBot/Leads', 'Informados')"
          >
            <v-list-item-icon>
              <v-icon>mdi-information</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Informados </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsTodos' }"
            v-if="checkAuth('ChatBot/Leads', 'Lista-Completa')"
          >
            <v-list-item-icon>
              <v-icon>mdi-format-list-bulleted</v-icon>
            </v-list-item-icon>
            <v-list-item-content> Lista Completa </v-list-item-content>
          </v-list-item>
          <v-list-item
            active-class="primary custom2"
            :to="{ name: 'LeadsWhatsapp' }"
            v-if="checkAuth('ChatBot/Leads', 'Lista-Completa')"
          >
            <v-list-item-icon>
              <v-icon>mdi-whatsapp</v-icon>
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
        >
          <v-list-item-icon>
            <v-icon>mdi-comment</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Comentarios </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'CommentsWithoutResponses' }"
          v-if="checkAuth('Facebook/Facebook', 'Comentarios-SinResponder')"
        >
          <v-list-item-icon>
            <v-icon>mdi-comment-remove</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Comentarios sin responder</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'LlmTracker' }"
          v-if="checkAuth('Facebook/Facebook', 'Comentarios-SinResponder')"
        >
          <v-list-item-icon>
            <v-icon>mdi-chart-timeline-variant</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Seguimiento GPT</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'AdsMessenger' }"
          v-if="checkAuth('Facebook/Facebook', 'Ads-Messenger')"
        >
          <v-list-item-icon>
            <v-icon>mdi-facebook-messenger</v-icon>
          </v-list-item-icon>
          <v-list-item-content>Ads Messenger</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'FacebookLabels' }"
          v-if="checkAuth('Facebook/Facebook', 'Etiquetas')"
        >
          <v-list-item-icon>
            <v-icon>mdi-label</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Etiquetas </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'FacebookAudiences' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Audiencias </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'TemplateMessages' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-message-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content> Mensajes de Plantilla </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'ImaginaTemplateMessages' }"
        >
          <v-list-item-icon>
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
        >
          <v-list-item-icon>
            <v-icon>mdi-file-document</v-icon>
          </v-list-item-icon>

          <v-list-item-content> Página </v-list-item-content>
        </v-list-item>
        <v-list-item active-class="primary custom2" :to="{ name: 'Ordenes' }">
          <v-list-item-icon>
            <v-icon>mdi-cart</v-icon>
          </v-list-item-icon>

          <v-list-item-content> Ordenes </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'TelegramRoutines' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-image</v-icon>
          </v-list-item-icon>

          <v-list-item-content> Historias Estáticas </v-list-item-content>
        </v-list-item>
      </v-list-group>

      <v-list-group
        :value="false"
        prepend-icon="mdi-store"
        color="white"
      >
        <template v-slot:activator>
          <v-list-item-title>Marketplace</v-list-item-title>
        </template>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceOrdenes' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-cart</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Ordenes</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceProductos' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-package-variant</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Productos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceProductosVariaciones' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-view-module</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Variaciones</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketplaceBulkUpdate' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-table-edit</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Modificar Lote</v-list-item-content>
        </v-list-item>
      </v-list-group>

      <v-list-group
        prepend-icon="mdi-shopify"
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
        >
          <v-list-item-content> Productos </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'EcommerceOrders' }"
          v-if="checkAuth('Configuracion/Propiedades/Woocommerces', 'Ordenes')"
        >
          <v-list-item-content> Órdenes </v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'EcommerceProductsVariations' }"
          v-if="checkAuth('Configuracion/Propiedades/Woocommerces', 'Ordenes')"
        >
          <v-list-item-content> Variaciones </v-list-item-content>
        </v-list-item>
      </v-list-group>
      <v-list-group
        :value="false"
        prepend-icon="mdi-bullhorn"
        color="white"
      >
        <template v-slot:activator>
          <v-list-item-title>Marketing</v-list-item-title>
        </template>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MassiveMessages' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-message-bulleted</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Mensajes masivos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MassiveMessagesLogs' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-history</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Historial Mensajes masivos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketingSegments' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-account-group-outline</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Segmentos</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'MarketingCampaigns' }"
        >
          <v-list-item-icon>
            <v-icon>mdi-flag-variant</v-icon>
          </v-list-item-icon>

          <v-list-item-content>Campañas</v-list-item-content>
        </v-list-item>
        <v-list-item
          active-class="primary custom2"
          :to="{ name: 'TemplateMessagesLogs' }"
        >
          <v-list-item-icon>
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
      <v-list-item active-class="primary custom2" :to="{ name: 'ChatRoom' }">
        <v-list-item-icon>
          <v-icon>mdi-chat</v-icon>
        </v-list-item-icon>
        <v-list-item-content> Chat en vivo </v-list-item-content>
      </v-list-item>
      <v-list-item
        active-class="primary custom2"
        :to="{ name: 'SettingsView' }"
      >
        <v-list-item-icon>
          <v-icon>mdi-cog</v-icon>
        </v-list-item-icon>
        <v-list-item-content> Configuración </v-list-item-content>
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
          icon: "mdi-account",
          text: "Google Contact",
          to: "Telefonos",
        },
        {
          icon: "mdi-label",
          text: "Etiquetas y Agentes",
          to: "LabelsAndAgents",
        },
        {
          icon: "mdi-form",
          text: "Gravity Forms",
          to: "GravityForms",
        },
        // {
        //   icon: "mdi-check",
        //   text: "Woocommerce",
        //   to: "Woocommerce",
        // },
        {
          icon: "mdi-store",
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
          icon: "mdi-format-list-bulleted",
          items: [
            {
              icon: "mdi-format-list-bulleted",
              text: "Todo-Full",
              to: "EquipoDeVentas",
            },
            {
              icon: "mdi-format-list-bulleted",
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
</style>
