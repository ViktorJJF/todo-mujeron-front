<template>
  <div class="dt-content-wrapper">
    <!-- Site Content -->
    <div class="dt-content">
      <!-- Grid -->
      <div class="row">
        <!-- Grid Item -->
        <div class="col-xl-12">
          <!-- Module -->
          <div class="dt-module dt-module--chat">
            <!-- Module Sidebar -->
            <div class="dt-module__sidebar" style="width: 900px">
              <!-- Sidebar Header -->

              <!-- /sidebar header -->

              <!-- Sidebar Menu -->
              <div class="dt-module__sidebar-content">
                <!-- Card Header -->
                <input
                  class="form-control form-control-lg"
                  id="address-1"
                  name="address-1"
                  placeholder="Buscar"
                  type="search"
                  v-model="search"
                />
                <!-- /card header -->

                <!-- Tab Content-->
                <div class="tab-content">
                  <!-- Tab panel -->
                  <div id="tab-pane1" class="">
                    <!-- Contact Container -->
                    <div class="dt-contacts__container ps-custom-scrollbar">
                      <div class="dt-contacts__container-inner">
                        <!-- Contacts -->
                        <div class="dt-contacts contacts-list">
                          <!-- Contact Heading -->
                          <!-- <h5 class="dt-contact__heading">Yesterday</h5> -->
                          <!-- /contact heading -->

                          <!-- Contact -->
                          <InfiniteScroll
                            ><div
                              class="dt-contact tf-wrapper"
                              v-for="chat in chats"
                              :key="chat._id"
                              @click="selectChat(chat)"
                            >
                              <!-- Avatar -->
                              <img
                                class="dt-avatar"
                                src="https://www.kindpng.com/picc/m/78-786207_user-avatar-png-user-avatar-icon-png-transparent.png"
                                alt="Steve Smith"
                              />
                              <!-- /avatar -->

                              <!-- Contact Info -->
                              <div class="dt-contact__info">
                                <h4
                                  class="dt-contact__title"
                                  style="font-size: 17px"
                                >
                                  {{
                                    chat.cleanLeadId
                                      ? chat.cleanLeadId.details[0].nombre
                                      : "Cliente"
                                  }}
                                </h4>
                                <p
                                  class="dt-contact__desc"
                                  style="font-size: 14px"
                                >
                                  {{
                                    chat.last_message &&
                                    chat.last_message.length > 0
                                      ? chat.last_message[0].text
                                      : ""
                                  }}
                                </p>
                                <small>{{
                                  (chat.last_message &&
                                  chat.last_message.length > 0
                                    ? chat.last_message[0].createdAt
                                    : new Date()) | formatDate
                                }}</small>
                              </div>
                              <!-- /contact info -->
                            </div></InfiniteScroll
                          >

                          <!-- /contact -->

                          <!-- /contact -->
                        </div>
                        <!-- contacts -->
                      </div>
                    </div>
                    <!-- /contact container -->
                  </div>
                  <!-- /tab panel -->

                  <!-- Tab panel -->
                  <div id="tab-pane2" class="tab-pane">
                    <!-- Contact Container -->
                    <div class="dt-contacts__container ps-custom-scrollbar">
                      <div class="dt-contacts__container-inner">
                        <!-- Contacts -->
                        <div class="dt-contacts contacts-list">
                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <img
                              class="dt-avatar"
                              src="assets/images/user-avatar/kemroon-white.jpg"
                              alt="Kemroon White"
                            />
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Kemroon White</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->

                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <span class="dt-avatar bg-orange text-white"
                              >RJ</span
                            >
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Reece Jacklin</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->

                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <img
                              class="dt-avatar"
                              src="assets/images/user-avatar/jimmy-jo.jpg"
                              alt="Jimmy Jo"
                            />
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Jimmy Jo</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->

                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <span class="dt-avatar bg-dark-blue text-white"
                              >JB</span
                            >
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Jeo Brown</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->

                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <img
                              class="dt-avatar"
                              src="assets/images/user-avatar/steve-smith.jpg"
                              alt="Steve Smith"
                            />
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Domnic Joe</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->

                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <span class="dt-avatar bg-dark-blue text-white"
                              >RB</span
                            >
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Ron Brown</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->

                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <img
                              class="dt-avatar"
                              src="assets/images/user-avatar/stella-johnson.jpg"
                              alt="Stella Johnson"
                            />
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Stella Johnson</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->

                          <!-- Contact -->
                          <div
                            class="dt-contact"
                            data-location="chat-start.html"
                          >
                            <!-- Avatar -->
                            <span class="dt-avatar bg-orange text-white"
                              >TG</span
                            >
                            <!-- /avatar -->

                            <!-- Contact Info -->
                            <div class="dt-contact__info">
                              <h4 class="dt-contact__title">Tyler Guerrero</h4>
                              <p class="dt-contact__desc">
                                tried the suggest...
                              </p>
                            </div>
                            <!-- /contact info -->
                          </div>
                          <!-- /contact -->
                        </div>
                        <!-- contacts -->
                      </div>
                    </div>
                    <!-- /contact container -->
                  </div>
                  <!-- /tab panel -->
                </div>
                <!-- /tab content-->
              </div>
              <!-- /sidebar Menu -->
            </div>
            <!-- /module sidebar -->

            <!-- Module Container -->
            <div
              class="dt-module__container"
              style="height: 100%; max-height: 800px"
              v-if="selectedChat"
            >
              <!-- Module Header -->
              <div class="dt-module__header">
                <!-- User Detail  -->
                <div class="dt-avatar-wrapper">
                  <div class="dt-avatar-status mr-2">
                    <img
                      class="dt-avatar size-45"
                      src="https://www.kindpng.com/picc/m/78-786207_user-avatar-png-user-avatar-icon-png-transparent.png"
                      alt="Domnic Brown"
                    />
                    <div class="dot-shape bg-success dot-shape-lg"></div>
                  </div>
                  <span class="dt-avatar-info">
                    <a href="javascript:void(0)" class="dt-avatar-name">{{
                      selectedChat.cleanLeadId
                        ? selectedChat.cleanLeadId.details[0].nombre
                        : "Cliente"
                    }}</a>
                    <span class="d-inline-block">{{
                      selectedChat.cleanLeadId
                        ? selectedChat.cleanLeadId.telefono
                        : "Sin teléfono"
                    }}</span>
                  </span>
                </div>
                <!-- User Detail  -->

                <!-- Dropdown -->
                <div class="dropdown ml-auto">
                  <v-btn
                    x-large
                    color="success"
                    @click="endConversation"
                    v-show="isAgentConnected || selectedChat.userId"
                    >Finalizar conversación</v-btn
                  >
                </div>
                <!-- /dropdown -->
              </div>
              <!-- /module header -->

              <!-- Module Content -->
              <div
                class="dt-module__content ps-custom-scrollbar"
                id="content_section"
              >
                <!-- Module Content Inner -->
                <div class="dt-module__content-inner">
                  <!-- Chat Conversation -->
                  <div class="dt-chat__conversation">
                    <!-- Chat Item -->
                    <div
                      :class="{
                        'dt-chat__item': true,
                        reply: message.from !== 'Cliente',
                      }"
                      v-for="message in $store.state.chatsModule.messages"
                      :key="message._id"
                    >
                      <!-- Avatar -->
                      <img
                        class="dt-avatar size-60"
                        :src="
                          message.from === 'Cliente'
                            ? 'https://www.kindpng.com/picc/m/78-786207_user-avatar-png-user-avatar-icon-png-transparent.png'
                            : message.from === 'Agente'
                            ? 'https://cdn-icons-png.flaticon.com/512/4017/4017991.png'
                            : '/assets/images/chatbot.png'
                        "
                        alt="Domnic Brown"
                      />
                      <!-- /avatar -->

                      <!-- Messages -->
                      <div class="dt-chat__message-wrapper">
                        <!-- Message -->
                        <div class="dt-chat__message" v-if="message.isActive">
                          {{ message.text }}
                          <v-btn
                            v-if="message.payload && message.payload.image_url"
                            color="secondary"
                            @click.stop="
                              dialog = true;
                              selectedMessage = message;
                              isErrorStory = false;
                            "
                            dark
                            small
                          >
                            Ver historia
                          </v-btn>
                        </div>
                        <div v-else class="dt-chat__message">
                          Mensaje eliminado por el usuario
                        </div>
                        <!-- /message -->
                      </div>
                      <!-- /messages -->
                    </div>
                    <!-- /chat item -->
                  </div>
                  <!-- /chat conversation -->
                </div>
                <!-- /module content inner -->
              </div>
              <!-- /module content -->

              <!-- Comment Box -->
              <div class="add-comment-box">
                <!-- Action Tools -->
                <!-- /action tools -->

                <!-- Media -->
                <div
                  class="media"
                  v-if="isAgentConnected || selectedChat.userId"
                >
                  <!-- Avatar -->
                  <img
                    class="dt-avatar"
                    src="https://cdn-icons-png.flaticon.com/512/4017/4017991.png"
                    alt="Reece Jacklin"
                  />
                  <!-- /avatar -->

                  <!-- Media Body -->
                  <div class="media-body">
                    <!-- Text Area -->
                    <textarea
                      @keyup.enter="sendTextMessage(text)"
                      class="form-control border-0 shadow-none bg-focus"
                      rows="1"
                      placeholder="Mensaje"
                      v-model="text"
                    ></textarea>
                  </div>
                  <!-- /media body -->
                </div>
                <div class="media" v-else>
                  <v-btn
                    v-if="!isAgentConnected || !selectedChat.userId"
                    block
                    x-large
                    color="primary"
                    @click.once="connectAgent(selectedChat)"
                    >Conversar</v-btn
                  >
                </div>
                <!-- /media -->
              </div>
              <!-- /comment box -->
            </div>
            <div v-else class="dt-module__container">
              <!-- Module Content -->
              <div class="dt-module__content">
                <!-- Module Content Inner -->
                <div
                  class="
                    dt-module__content-inner
                    h-100
                    d-flex
                    flex-column
                    justify-content-center
                    align-items-center
                  "
                >
                  <div class="icon icon-message icon-fw icon-7x mb-2"></div>
                  <h1 class="display-1">Selecciona un usuario para empezar</h1>

                  <button
                    class="btn btn-primary d-md-none"
                    data-toggle="msidebar-content"
                  >
                    Select contact to start Chat
                  </button>
                </div>
                <!-- /module content inner -->
              </div>
              <!-- /module content -->
            </div>
            <!-- /module container -->

            <!-- Module Drawer -->
            <div class="dt-module__drawer dt-drawer position-left">
              <!-- Module Drawer Inner -->
              <div class="dt-module__drawer-inner">
                <div class="dt-module__drawer-header">
                  <a
                    href="javascript:void(0)"
                    class="d-inline-block"
                    data-dismiss="mdrawer"
                  >
                    <i class="icon icon-arrow-long-left icon-2x mr-3"></i>
                    <span class="align-middle">Back</span>
                  </a>
                </div>

                <!-- Actionable Drawer -->
                <div class="dt-actionable-drawer">
                  <!-- Menu Bar -->
                  <div class="dt-action-bar">
                    <!-- Action Menu -->
                    <ul class="dt-action-nav">
                      <!-- Menu Item -->
                      <li class="dt-action-nav__item">
                        <a
                          href="javascript:void(0)"
                          class="dt-action-nav__link"
                          data-switch="mdrawer"
                          data-target="#drawer-notifications"
                        >
                          <i class="icon icon-notification2 icon-fw"></i>
                        </a>
                      </li>
                      <!-- /menu item -->

                      <!-- Menu Item -->
                      <li class="dt-action-nav__item">
                        <a
                          href="javascript:void(0)"
                          class="dt-action-nav__link"
                          data-switch="mdrawer"
                          data-target="#drawer-search-bar"
                        >
                          <i class="icon icon-search icon-fw"></i>
                        </a>
                      </li>
                      <!-- /menu item -->

                      <!-- Menu Item -->
                      <li class="dt-action-nav__item dropdown">
                        <!-- Dropdown Button -->
                        <a
                          href="#"
                          class="dropdown-toggle no-arrow dt-action-nav__link"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i class="icon icon-circle-add-o"></i>
                        </a>
                        <!-- /dropdown button -->

                        <!-- Dropdown Menu -->
                        <div class="dropdown-menu">
                          <a class="dropdown-item" href="javascript:void(0)"
                            >Add New Project</a
                          >
                          <a class="dropdown-item" href="javascript:void(0)"
                            >Add New Task</a
                          >
                          <a class="dropdown-item" href="javascript:void(0)"
                            >Add New Team Member</a
                          >
                        </div>
                        <!-- /dropdown menu -->
                      </li>
                      <!-- /menu item -->
                    </ul>
                    <!-- /action menu -->
                  </div>
                  <!-- /menu bar -->

                  <!-- Drawer Content Area -->
                  <div class="dt-action-content-wrapper ps-custom-scrollbar">
                    <div class="dt-action-content">
                      <!-- Search -->
                      <div class="dt-notification fade" id="drawer-search-bar">
                        <!-- Search Box -->
                        <form class="search-box right-side-icon mw-100 mb-8">
                          <input
                            class="form-control form-control-lg"
                            id="address-1"
                            name="address-1"
                            placeholder="Search in app..."
                            type="search"
                          />
                          <button type="submit" class="search-icon">
                            <i class="icon icon-search icon-lg"></i>
                          </button>
                        </form>
                        <!-- /search box -->

                        <h4>Recently Viewed</h4>

                        <!-- Search Result-->
                        <div class="search-result">
                          <a
                            href="javascript:void(0)"
                            class="dt-avatar-wrapper"
                          >
                            <!-- Avatar -->
                            <span
                              class="
                                dt-avatar
                                bg-primary
                                text-white
                                font-italic
                              "
                              >PHP</span
                            >
                            <!-- /avatar -->

                            <!-- Avatar Info -->
                            <span class="dt-avatar-info">
                              <span class="dt-avatar-name">Chat Bull</span>
                              <span class="f-12">Example Web</span>
                            </span>
                            <!-- /avatar info -->
                          </a>
                        </div>
                        <!-- /search result-->

                        <!-- Search Result-->
                        <div class="search-result">
                          <a
                            href="javascript:void(0)"
                            class="dt-avatar-wrapper"
                          >
                            <!-- Avatar -->
                            <span
                              class="
                                dt-avatar
                                bg-primary
                                text-white
                                font-italic
                              "
                              >Ant</span
                            >
                            <!-- /avatar -->

                            <!-- Avatar Info -->
                            <span class="dt-avatar-info">
                              <span class="dt-avatar-name">Flexile</span>
                              <span class="f-12">Example Web</span>
                            </span>
                            <!-- /avatar info -->
                          </a>
                        </div>
                        <!-- /search result-->

                        <!-- Search Result-->
                        <div class="search-result">
                          <a
                            href="javascript:void(0)"
                            class="dt-avatar-wrapper"
                          >
                            <!-- Avatar -->
                            <span
                              class="
                                dt-avatar
                                bg-primary
                                text-white
                                font-italic
                              "
                              >React</span
                            >
                            <!-- /avatar -->

                            <!-- Avatar Info -->
                            <span class="dt-avatar-info">
                              <span class="dt-avatar-name">Admin Template</span>
                              <span class="f-12">Example Web</span>
                            </span>
                            <!-- /avatar info -->
                          </a>
                        </div>
                        <!-- /search result-->
                      </div>
                      <!-- /search -->

                      <!-- Notification -->
                      <div
                        class="dt-notification fade"
                        id="drawer-notifications"
                      >
                        <div class="d-flex align-items-center mb-6">
                          <h5 class="mb-0">Notifications (7)</h5>

                          <div class="ml-auto action-area">
                            <a href="javascript:void(0)">Mark All Read</a>

                            <!-- Dropdown -->
                            <span class="dropdown ml-2 d-inline-block">
                              <a
                                class="dropdown-toggle no-arrow"
                                href="#"
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <i
                                  class="
                                    icon icon-settings icon-lg
                                    text-light-gray
                                  "
                                ></i>
                              </a>

                              <span class="dropdown-menu dropdown-menu-right">
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0)"
                                >
                                  <i class="icon icon-editors icon-fw"></i>
                                  Edit
                                </a>
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0)"
                                >
                                  <i class="icon icon-contacts icon-fw"></i>
                                  Contact List</a
                                >
                                <a
                                  class="dropdown-item"
                                  href="javascript:void(0)"
                                >
                                  <i class="icon icon-heart icon-fw"></i>
                                  Favourite List
                                </a>
                              </span>
                            </span>
                            <!-- /dropdown -->
                          </div>
                        </div>

                        <!-- Media -->
                        <a href="javascript:void(0)" class="media">
                          <!-- Avatar -->
                          <img
                            class="dt-avatar mr-3"
                            src="assets/images/user-avatar/stella-johnson.jpg"
                            alt="User"
                          />
                          <!-- avatar -->

                          <!-- Media Body -->
                          <span class="media-body">
                            <span class="message">
                              <span class="user-name">Stella Johnson</span> and
                              <span class="user-name">Chris Harris</span>
                              have birthdays today. Help them celebrate!
                            </span>
                            <span class="meta-date">8 hours ago</span>
                          </span>
                          <!-- /media body -->
                        </a>
                        <!-- /media -->

                        <!-- Media -->
                        <a href="javascript:void(0)" class="media">
                          <!-- Avatar -->
                          <img
                            class="dt-avatar mr-3"
                            src="assets/images/user-avatar/jeson-born.jpg"
                            alt="User"
                          />
                          <!-- avatar -->

                          <!-- Media Body -->
                          <span class="media-body">
                            <span class="message">
                              <span class="user-name">Jonathan Madano</span>
                              commented on your post.
                            </span>
                            <span class="meta-date">9 hours ago</span>
                          </span>
                          <!-- /media body -->
                        </a>
                        <!-- /media -->

                        <!-- Media -->
                        <a href="javascript:void(0)" class="media">
                          <!-- Avatar -->
                          <img
                            class="dt-avatar mr-3"
                            src="assets/images/user-avatar/selena.jpg"
                            alt="User"
                          />
                          <!-- avatar -->

                          <!-- Media Body -->
                          <span class="media-body">
                            <span class="message">
                              <span class="user-name">Chelsea Brown</span> sent
                              a video recomendation.
                            </span>
                            <span class="meta-date">
                              <i
                                class="
                                  icon icon-play-circle
                                  text-primary
                                  icon-fw
                                  mr-1
                                "
                              ></i>
                              13 hours ago
                            </span>
                          </span>
                          <!-- /media body -->
                        </a>
                        <!-- /media -->

                        <!-- Media -->
                        <a href="javascript:void(0)" class="media">
                          <!-- Avatar -->
                          <img
                            class="dt-avatar mr-3"
                            src="assets/images/user-avatar/alex-dolgove.jpg"
                            alt="User"
                          />
                          <!-- avatar -->

                          <!-- Media Body -->
                          <span class="media-body">
                            <span class="message">
                              <span class="user-name">Alex Dolgove</span> and
                              <span class="user-name">Chris Harris</span>
                              like your post.
                            </span>
                            <span class="meta-date">
                              <i
                                class="
                                  icon icon-like
                                  text-light-blue
                                  icon-fw
                                  mr-1
                                "
                              ></i>
                              yesterday at 9:30
                            </span>
                          </span>
                          <!-- /media body -->
                        </a>
                        <!-- /media -->

                        <!-- Media -->
                        <a href="javascript:void(0)" class="media">
                          <!-- Avatar -->
                          <img
                            class="dt-avatar mr-3"
                            src="assets/images/user-avatar/amay.jpg"
                            alt="User"
                          />
                          <!-- avatar -->

                          <!-- Media Body -->
                          <span class="media-body">
                            <span class="message">
                              <span class="user-name">Amay Mathur</span> and
                              <span class="user-name">Domnic Harris</span>
                              comment your post.
                            </span>
                            <span class="meta-date">
                              <i class="icon icon-message icon-fw mr-1"></i>
                              yesterday at 9:30
                            </span>
                          </span>
                          <!-- /media body -->
                        </a>
                        <!-- /media -->

                        <!-- Media -->
                        <a href="javascript:void(0)" class="media">
                          <!-- Avatar -->
                          <img
                            class="dt-avatar mr-3"
                            src="assets/images/user-avatar/steve-smith.jpg"
                            alt="User"
                          />
                          <!-- avatar -->

                          <!-- Media Body -->
                          <span class="media-body">
                            <span class="message">
                              <span class="user-name">Steve Smith</span> and
                              <span class="user-name">Jimmy</span>
                              inviting on our page.
                            </span>
                            <span class="meta-date"> Monday at 18:30 </span>
                          </span>
                          <!-- /media body -->
                        </a>
                        <!-- /media -->

                        <!-- Media -->
                        <a href="javascript:void(0)" class="media">
                          <!-- Avatar -->
                          <img
                            class="dt-avatar mr-3"
                            src="assets/images/user-avatar/alex-dolgove.jpg"
                            alt="User"
                          />
                          <!-- avatar -->

                          <!-- Media Body -->
                          <span class="media-body">
                            <span class="message">
                              <span class="user-name">Alex Dolgove</span> and
                              <span class="user-name">Chris Harris</span>
                              like your post.
                            </span>
                            <span class="meta-date">
                              <i
                                class="
                                  icon icon-like
                                  text-light-blue
                                  icon-fw
                                  mr-1
                                "
                              ></i>
                              yesterday at 9:30
                            </span>
                          </span>
                          <!-- /media body -->
                        </a>
                        <!-- /media -->
                      </div>
                      <!-- /notification -->
                    </div>
                  </div>
                  <!-- /drawer content area -->
                </div>
                <!-- /actionable drawer -->
              </div>
              <!-- /module drawer inner -->
            </div>
            <!-- /module drawer -->
          </div>
          <!-- /module -->
        </div>
        <!-- /grid item -->
      </div>
      <!-- /grid -->
    </div>
    <v-dialog v-model="dialog" v-if="dialog" width="500">
      <v-card v-if="selectedMessage">
        <v-container class="mt-3">
          <v-img
            class="mt-3"
            v-show="
              selectedMessage.payload &&
              selectedMessage.payload.image_url &&
              !isErrorStory
            "
            aspect-ratio="0.7"
            contain
            :src="selectedMessage.payload.image_url"
            @error="errorStory"
            @load="loadStory"
          ></v-img>
          <div v-if="isErrorStory" class="dt-module__content">
            <!-- Module Content Inner -->
            <div
              class="
                dt-module__content-inner
                h-100
                d-flex
                flex-column
                justify-content-center
                align-items-center
              "
            >
              <div class="icon icon-message icon-fw icon-7x mb-2"></div>
              <h1 class="display-1">
                Esta historia de Instagram ya no está disponible
              </h1>
            </div>
            <!-- /module content inner -->
          </div>
        </v-container>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialog = false"> Listo </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { formatDistance } from "date-fns";
import chatsService from "@/services/api/chats";
import messagesService from "@/services/api/messages";
import { scrollBottom } from "@/utils/utils";
import socket from "@/plugins/sockets";
import { es } from "date-fns/locale";
import InfiniteScroll from "@/components/InfiniteScroll.vue";

export default {
  components: {
    InfiniteScroll,
  },
  filters: {
    formatDate: function (value) {
      let date = new Date(value);
      return formatDistance(new Date(), date, { addSuffix: true, locale: es });
    },
  },
  data() {
    return {
      chats: [],
      messages: [],
      selectedChat: null,
      text: "",
      isAgentConnected: false,
      dialog: null,
      isErrorStory: false,
      selectedMessage: null,
      search: "",
      fieldsToSearch: ["foreign_telefono", "foreign_name"],
      page: 1,
      pageCount: 0,
    };
  },
  mounted() {
    this.initialize();
  },
  methods: {
    async initialize(page = 1) {
      // traer listado de chats
      await Promise.all([
        this.$store.dispatch("chatsModule/list", {
          page,
          search: this.search,
          fieldsToSearch: this.fieldsToSearch,
          sort: "updatedAt",
          order: "desc",
        }),
      ]);
      // this.$store.commit("chatsModule/setChats", this.chats);
      this.chats = this.$store.state.chatsModule.chats;
      console.log("🚀 Aqui *** -> this.chats", this.chats);
    },
    async selectChat(chat) {
      this.selectedChat = chat;
      this.$store.commit("chatsModule/setSelectedChat", chat);
      this.messages = (
        await messagesService.listByChat({
          chatId: chat._id,
          sort: "createdAt",
          order: "asc",
        })
      ).data.payload;
      this.$store.commit("chatsModule/setMessages", this.messages);
      scrollBottom();
    },
    sendTextMessage(text, from = "Agente") {
      console.log("ENVIANDO MENSAJE: ", text, from);
      let payload = {
        text,
        from,
        type: "text",
        chatId: this.selectedChat._id,
        isActive: true,
      };
      // guardando en bd
      messagesService.create(payload);
      this.messages.push(payload);
      this.text = "";
      console.log("🚀 Aqui *** -> this.selectedChat", this.selectedChat);
      socket.emit("AGENT_MESSAGE", {
        senderId: this.selectedChat.leadId.contactId,
        chatId: this.selectedChat._id,
        text: text,
        pageID: this.selectedChat.pageID,
      });
    },
    connectAgent() {
      const user = JSON.parse(localStorage.getItem("user"));
      let message =
        "🤝👩🏻‍💼 Ahora estás conversando con el agente " +
        user.first_name +
        " " +
        user.last_name;

      if (!this.isAgentConnected) {
        console.log("CONECTANDO AGENTE");
        this.sendTextMessage(message, "Chatbot");
        this.isAgentConnected = true;
        // se cambia estado de atendiendo agente en bd
        chatsService.update(this.selectedChat._id, { userId: user._id });
        scrollBottom();
        socket.emit("CONNECT_AGENT", {
          senderId: this.selectedChat.leadId.contactId,
          chatId: this.selectedChat._id,
          text: message,
          pageID: this.selectedChat.pageID,
        });
      }
    },
    endConversation() {
      const user = JSON.parse(localStorage.getItem("user"));
      let message = `El agente ${user.first_name} ${user.last_name} se ha desconectado`;
      this.sendTextMessage(message, "Chatbot");
      this.isAgentConnected = false;
      this.selectedChat.userId = null;
      chatsService.update(this.selectedChat._id, { userId: null });
      // socket.emit("DISCONNECT_AGENT", {
      //   senderId: this.selectedChat.leadId.contactId,
      //   chatId: this.selectedChat._id,
      //   text: message,
      //   pageID: this.selectedChat.pageID,
      // });
    },
    errorStory() {
      this.isErrorStory = true;
    },
    loadStory() {
      this.isErrorStory = false;
    },
  },
  computed: {},
  watch: {
    messages() {
      scrollBottom();
    },
    async search() {
      clearTimeout(this.delayTimer);
      this.delayTimer = setTimeout(() => {
        this.initialize(this.page);
      }, 600);
    },
  },
};
</script>

<style scoped src="@/assets/css/semidark-style-1.min.css">
.tf-wrapper {
  -webkit-column-width: 150px;
  column-width: 150px;
  height: 100%;
  width: 500px;
}
</style>