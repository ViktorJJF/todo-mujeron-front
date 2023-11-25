<template>
  <div>
    <!-- Navbar -->
    <nav>
      <div class="nav-content">
        <div class="logonav">
          <h2>Todofull</h2>
          <img src="/img_landing/todofull.png" />
        </div>

        <ul>
          <li><a id="active" href="#">Home</a></li>
          <li><button @click="dialog = true">Contacto</button></li>
          <li><a href="/login">Iniciar sesión</a></li>
        </ul>
      </div>
    </nav>

    <!-- Banner -->
    <section class="banner-container">
      <div class="banner-contents">
        <div class="banner-left">
          <h1>Soluciones Inteligentes con Bots</h1>
          <p>
            Descubre cómo nuestros bots personalizados pueden transformar tu
            negocio, optimizando la atención al cliente, automatizando tareas y
            mejorando la eficiencia operativa. Experimenta una nueva era de
            interacción digital.
          </p>
          <a id="button" @click="dialog = true">Demo</a>
        </div>
        <div class="banner-right">
          <img
            src="/img_landing/message.svg"
            alt="Couple holding hands in snow"
          />
        </div>
      </div>
      <div class="ski-slide">
        <img src="img/ski.svg" alt="person skiing" />
      </div>
      <div class="svg-waves">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            class="shape-fill"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            class="shape-fill"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            class="shape-fill"
          ></path>
        </svg>
      </div>
    </section>

    <!-- Intro -->

    <section class="intro-container">
      <h2>Integración de Bots para Diversas Plataformas</h2>
      <div class="intro-content">
        <!-- Bot para Messenger -->
        <div class="intro-card">
          <h3>Bot para Messenger</h3>
          <div class="intro-img">
            <img src="/img_landing/img_insta.jpg" alt="Bot para Messenger" />
          </div>
          <p>
            Interactúa con los usuarios directamente en Messenger, mejorando la
            comunicación y el servicio al cliente.
          </p>
        </div>

        <!-- Bot para Instagram -->
        <div class="intro-card">
          <h3>Bot para Instagram</h3>
          <div class="intro-img">
            <img src="/img_landing/img_insta_2.jpg" alt="Bot para Instagram" />
          </div>
          <p>
            Automatiza respuestas y mejora la interacción con seguidores en
            Instagram, ideal para marketing y soporte.
          </p>
        </div>

        <!-- Bot Personalizado para Web -->
        <div class="intro-card">
          <h3>Bot Personalizado para Web</h3>
          <div class="intro-img">
            <img
              src="/img_landing/bot_web.png"
              alt="Bot Personalizado para Web"
            />
          </div>
          <p>
            Soluciones personalizadas de chatbot para tu sitio web, adaptadas a
            las necesidades específicas de tu negocio.
          </p>
        </div>
      </div>
    </section>

    <!-- About -->

    <section class="about-container">
      <div class="about-background"></div>
      <div class="about-content">
        <!-- Animated snowfall -->
        <div class="about-left">
          <img src="/img_landing/charts.svg" alt="snow covered town" />
        </div>
        <div class="about-right">
          <h2>Optimiza tu Captura de Leads</h2>
          <p>
            Descubre cómo transformar visitantes en oportunidades de negocio.
            Utiliza estrategias efectivas para capturar leads y gestiónalos
            eficientemente con nuestro CRM integrado. <br /><br />
            Aprende a maximizar el potencial de cada contacto. Con nuestras
            herramientas avanzadas, podrás analizar, segmentar y dar seguimiento
            a cada lead de manera efectiva. ¡Impulsa tu negocio con una gestión
            de clientes excepcional!
          </p>
        </div>
      </div>
    </section>

    <!-- Gallery -->

    <section class="gallery-container">
      <div class="gallery-content">
        <div class="container">
          <br />
          <br />
          <h2 class="text-center my-lg-5 mb-5">
            Avanzamos junto a grandes partners.
          </h2>
          <br />
          <v-row>
            <v-col :cols="3" v-for="(partner, index) in partners" :key="index">
              <img class="logo" :src="partner.url_img" :alt="partner.name" />
            </v-col>
          </v-row>
        </div>
      </div>
    </section>
    <section class="testimonial-section">
      <div class="testimonial-container">
        <h2>Lo Que Dicen Nuestros Clientes</h2>
        <div class="testimonial">
          <p class="testimonial-text">
            "La automatización a través de los bots de Todofull ha revolucionado
            nuestra gestión de clientes. La eficiencia en la captura de leads es
            impresionante. ¡Una herramienta indispensable para cualquier empresa
            moderna!"
          </p>
          <h3 class="testimonial-author">- Mara Crespo. Medular Chile</h3>
        </div>
        <div class="testimonial">
          <p class="testimonial-text">
            "Con los chatbots de Todofull, hemos optimizado nuestra interacción
            con clientes y multiplicado nuestras oportunidades de venta. La
            integración con nuestro CRM nos ha permitido un seguimiento efectivo
            y personalizado."
          </p>
          <h3 class="testimonial-author">- Isabel Enos. Bali Body Chile</h3>
        </div>
        <div class="testimonial">
          <p class="testimonial-text">
            "Todofull revolucionó nuestra manera de interactuar con clientes. La
            creación de chatbots para Facebook e Instagram ha incrementado
            nuestras capturas de leads de manera impresionante."
          </p>
          <h3 class="testimonial-author">- Carlo Castillo. Tiendas Mujeron</h3>
        </div>
      </div>
    </section>

    <!-- Footer -->

    <footer>
      <div class="logo">
        <h2>Todofull</h2>
      </div>
      <div class="footer-content">
        <a href="/">Facebook</a>
        <a href="/">Twitter</a>
        <a href="/">Instagram</a>
        <a href="/">LinkedIn</a>
      </div>
      <p>&copy; Todofull 2023</p>
    </footer>
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Contacto</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12">
                <v-text-field label="Empresa" required></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  label="Correo"
                  hint="business@company.cl"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field label="Asunto"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="
              dialog = false;
              $swal('Gracias! nos pondremos en contacto contigo');
            "
          >
            Enviar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showContactMessage: false,
      dialog: false,
      partners: [
        {
          name: "Open AI",
          link: "https://www.360dialog.com/es",
          url_img: "/img_landing/openai.png",
          custom_width: true,
        },
        {
          name: "Mailchimp",
          link: "https://www.360dialog.com/es",
          url_img: "/img_landing/mailchimp.jpg",
          custom_width: true,
        },
        {
          name: "Woocommerce",
          link: "https://www.360dialog.com/es",
          url_img: "/img_landing/woocommerce.png",
          custom_width: true,
        },
        {
          name: "Dialogflow",
          link: "https://www.360dialog.com/es",
          url_img: "/img_landing/dialogflow.png",
          custom_width: true,
        },
      ],
    };
  },
  mounted() {
    // Event Handlers
    // window.addEventListener("scroll", scroll);
    // // Functions
    // function scroll() {
    //   let y = window.scrollY;
    //   // About Section - Snowfall Animation
    //   const element = document.querySelector(".about-background");
    //   if (y > 1000) {
    //     element.style.bottom = "-10%";
    //     element.style.opacity = "0.3";
    //   }
    //   // Explore Section - Slide Animation
    //   console.log(y);
    //   const para = document.querySelector(".explore-bottom p");
    //   const img = document.querySelector(".explore-bottom img");
    //   if (y > 2250) {
    //     para.style.transform = "translateX(0%)";
    //     para.style.opacity = "1";
    //     img.style.transform = "translateX(0%)";
    //     img.style.opacity = "1";
    //   }
    // }
    // // Banner Section - Ski Slide Animation
    // let ski = document.querySelector(".ski-slide");
    // ski.style.right = "100%";
  },
};
</script>

<style lang="scss" scoped>
:root {
  --lightBlue: #2a81ef !important;
  --darkBlue: #2a81ef;
  --orange: #ff8a44;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Proza Libre", sans-serif;
}

/* Navbar CSS*/

nav {
  background-color: #2a81ef;
}

.nav-content {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  justify-content: space-between;
}

.logo {
  font-family: "Pushster";
  font-size: 1.5rem;
}

nav ul {
  background-color: #fff;
  list-style-type: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;
  justify-items: center;
  border-radius: 100px;
}

nav ul li {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100%;
}

nav ul li a {
  text-decoration: none;
  color: black;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

nav ul li:hover {
  background-color: #ff8a44;
  color: white;
}

nav ul li:hover a {
  color: white !important;
  transform: scale(1.05);
  transition: 0.2s ease;
}

nav ul li:first-child:hover {
  border-top-left-radius: 100px;
  border-bottom-left-radius: 100px;
}

nav ul li:last-child:hover {
  border-top-right-radius: 100px;
  border-bottom-right-radius: 100px;
}

#active {
  color: #2a81ef;
  font-weight: 900;
}

.logo {
  width: 100px;
  transition: 0.25s;

  &:hover {
    transform: scale(1.1);
  }

  @media (max-width: 480px) {
    width: 70%;
  }
}
/* Navbar Responsive */

@media screen and (max-width: 680px) {
  .nav-content {
    flex-direction: column;
    align-items: center;
  }

  nav ul {
    width: 100%;
  }

  nav a {
    padding: 0.5rem 0;
  }

  nav ul {
    grid-template-columns: 25% 25% 25% 25%;
  }
}

/* Banner CSS*/

.banner-container {
  position: relative;
  background-color: #2a81ef;
  height: 800px;
  margin-bottom: 4rem;
}

.banner-contents {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 5rem 1rem;
  height: 100%;
}

.banner-contents h1 {
  font-weight: 800;
  font-size: 2.7rem;
  margin-bottom: 2rem;
}

.banner-contents p {
  color: white;
  font-size: 1.2rem;
  line-height: 1.7rem;
}

#button {
  display: block;
  background-color: #ff8a44;
  color: black;
  text-decoration: none;
  padding: 0.5em;
  width: 150px;
  text-align: center;
  margin-top: 2rem;
  border-radius: 30px;
  font-weight: 800;
  font-size: 1.1em;
}

#button:hover {
  background: #2a81ef;
  color: white;
  border: 1px solid white;
  transform: scale(1.05);
  transition: 0.2s ease-in;
}

.banner-right img {
  width: 100%;
  height: auto;
}

/*************** SVG Background Start ********************/

.svg-waves {
  background: rgb(221, 221, 221);
  position: absolute;
  left: 0;
  width: 100%;
  overflow: hidden;
  line-height: 0;
}

.svg-waves svg {
  position: relative;
  display: block;
  width: calc(100% + 1.3px);
  height: 66px;
}

.svg-waves .shape-fill {
  fill: #2a81ef;
}

/*************** SVG Background End ********************/

.ski-slide {
  position: absolute;
  width: 150px;
  height: auto;
  z-index: 100;
  bottom: -5%;
  right: -100%;
  transition: 7s ease-in;
  overflow: hidden;
}

.ski-slide img {
  width: 100%;
  height: auto;
}

/* Banner Responsive */

@media screen and (max-width: 680px) {
  .banner-contents {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .banner-left {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .banner-contents img {
    width: 200px;
    margin: 1rem;
  }
}

/* Stats CSS*/

.stats-container {
  background: rgb(221, 221, 221);
  height: 110px;
}

.stats-contents {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 80%;
  padding: 1rem;
  color: black;
}

.stat-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.stat-item img {
  height: 40px;
  margin-bottom: 0.5rem;
}

.stat-item h2 {
  font-family: "Nunito Sans";
  font-size: 1rem;
}

/* Stats Responsive */

@media screen and (max-width: 680px) {
  .stats-contents {
    padding: 0.2rem;
  }
  .stat-item h2 {
    font-size: 0.7rem;
  }
  .stat-item {
    justify-content: flex-end;
  }
}

/* Intro CSS*/

.intro-container {
  text-align: center;
  margin: 2rem 1rem;
}

.intro-container h2 {
  font-size: 2.5rem;
}

.intro-content {
  max-width: 1200px;
  margin: 2rem auto;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
}

.intro-card {
  position: relative;
  background: #2a81ef;
  border-radius: 5px;
  padding: 2rem 1rem;
}

.intro-card h3 {
  font-size: 1.5em;
}

.intro-img {
  height: 600px;
  width: 100%;
  margin: 1rem auto;
}

.intro-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border: 1px solid white;
  border-radius: 10px;
}

.intro-card p {
  color: white;
}

.intro-card:hover {
  transform: scale(1.05);
  background: #2a81ef;
  color: black;
  transition: 0.3s ease;
}

.intro-card:hover img {
  transform: scale(0.9);
  box-shadow: 10px 10px 20px black;
  border: 1px solid black;
  transition: 0.3s ease;
}

.intro-card:hover h3 {
  color: #ff8a44;
  transition: 0.3s ease;
}

.intro-card::before,
.intro-card::after {
  content: "";
  position: absolute;
  top: 0.5em;
  bottom: 0.5em;
  left: 0.5em;
  right: 0.5em;
  z-index: -1;
}

.intro-card::before {
  transform: scale(0, 1);
  border-top: 1px solid white;
  border-bottom: 1px solid white;
}

.intro-card:hover::before {
  transform: scale(1.02, 1);
  transition: transform ease-out 0.25s;
}

.intro-card::after {
  transform: scale(1, 0);
  border-left: 1px solid white;
  border-right: 1px solid white;
}

.intro-card:hover::after {
  transform: scale(1, 1.02);
  transition: transform ease-out 0.25s;
}

/* Intro Responsive */

@media screen and (max-width: 680px) {
  .intro-content {
    grid-template-columns: 1fr;
  }

  .intro-container h2 {
    font-size: 1.5rem;
  }
}

/* About CSS*/

.about-container {
  position: relative;
  height: 500px;
  margin-top: 8rem;
  background: #2a81ef;
  transform: skewY(-7deg);
  overflow: hidden;
}

.about-background {
  position: absolute;
  background-position: center;
  background-size: 400px;
  height: 120%;
  width: 100%;
  z-index: -10;
  bottom: 100%;
  opacity: 0;
  transition: 8s ease-out;
}

.about-content {
  max-width: 1200px;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  margin: 0 auto;
  padding: 2rem 1rem;
  color: white;
  text-align: right;
  transform: skewY(7deg);
}

.about-content h2 {
  color: #ff8a44;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.about-left {
  display: flex;
  justify-content: center;
  align-items: center;
}

.about-left img {
  width: 90%;
}

.about-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

/* About Responsive */

@media screen and (max-width: 680px) {
  .about-content {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 20px;
  }

  .about-left img {
    width: 70%;
  }

  .about-right {
    justify-content: center;
    align-items: center;
    text-align: center;
  }
}

/* Gallery CSS */

.gallery-container {
  margin: 5rem 0;
}

.gallery-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.gallery-item {
  position: relative;
  margin: 0 0.5rem;
  border: 13px solid white;
}

#gallery-item1 {
  height: 300px;
}

#gallery-item2 {
  height: 400px;
}

#gallery-item3 {
  height: 500px;
}

.gallery-item img {
  height: 100%;
  width: 250px;
  object-fit: cover;
}

/* First Gallery image */
#gallery-item1::before {
  content: "";
  position: absolute;
  background: #2a81ef;
  top: -10%;
  right: 85%;
  bottom: 60%;
  left: -10%;
  z-index: -10;
  box-shadow: -5px -5px 10px rgb(189, 189, 189);
  transition: 0.8s ease;
}

#gallery-item1::after {
  content: "";
  position: absolute;
  background: #ff8a44;
  top: 80%;
  right: 60%;
  bottom: -10%;
  left: -10%;
  z-index: -10;
  box-shadow: -5px 5px 10px rgb(189, 189, 189);
  transition: 0.8s ease;
}

#gallery-item1:hover::before {
  top: -10%;
  right: 50%;
  bottom: 40%;
  left: -10%;
}

#gallery-item1:hover::after {
  top: 70%;
  right: 20%;
  bottom: -10%;
  left: -10%;
}

/* Second Gallery image */
#gallery-item2::before {
  content: "";
  position: absolute;
  background: #ff8a44;
  top: -7%;
  right: 75%;
  bottom: 95%;
  left: -10%;
  z-index: -10;
  box-shadow: -5px -5px 10px rgb(189, 189, 189);
  transition: 0.8s ease;
}

#gallery-item2::after {
  content: "";
  position: absolute;
  background: #2a81ef;
  top: 0;
  right: 20%;
  bottom: -7%;
  left: 20%;
  z-index: -10;
  box-shadow: 5px 5px 10px rgb(189, 189, 189);
  transition: 0.8s ease;
}

#gallery-item2:hover::before {
  top: -7%;
  right: 35%;
  bottom: 90%;
  left: -10%;
}

#gallery-item2:hover::after {
  top: 0;
  right: 0;
  bottom: -7%;
  left: 0;
}

/* Third Gallery image */

#gallery-item3::before {
  content: "";
  position: absolute;
  background: #ff8a44;
  top: -6%;
  right: -10%;
  bottom: 45%;
  left: 80%;
  z-index: -10;
  box-shadow: 5px -5px 10px rgb(189, 189, 189);
  transition: 0.8s ease;
}

#gallery-item3::after {
  content: "";
  position: absolute;
  background: #2a81ef;
  top: 90%;
  right: -10%;
  bottom: -6%;
  left: 0%;
  z-index: -10;
  box-shadow: 10px 5px 10px rgb(189, 189, 189);
  transition: 0.8s ease;
}

#gallery-item3:hover::before {
  top: -6%;
  right: -10%;
  bottom: 35%;
  left: 0%;
  z-index: -10;
}

#gallery-item3:hover::after {
  top: 70%;
  right: -10%;
  bottom: -6%;
  left: 0%;
  z-index: -10;
}

/* Gallery Responsive */

@media screen and (max-width: 900px) {
  .gallery-content {
    flex-direction: column;
    /* grid-gap: 100px; */
  }

  .gallery-item {
    margin-top: 5rem;
    width: 70%;
  }

  .gallery-item img {
    width: 100%;
  }

  #gallery-item1,
  #gallery-item2,
  #gallery-item3 {
    height: 300px;
  }
  /* Gallary item 1 */

  #gallery-item1::before {
    top: -25px;
    right: 85%;
    bottom: 60%;
    left: -25px;
  }

  #gallery-item1::after {
    top: 80%;
    right: 60%;
    bottom: -25px;
    left: -25px;
  }

  /* Gallary item 2 */

  #gallery-item2::before {
    top: -25px;
    right: 75%;
    bottom: 95%;
    left: -25px;
  }

  #gallery-item2::after {
    top: 0;
    right: 20%;
    bottom: -25px;
    left: 20%;
  }

  /* Gallary item 3 */

  #gallery-item3::before {
    top: -25px;
    right: -25px;
    bottom: 45%;
    left: 80%;
  }

  #gallery-item3::after {
    top: 90%;
    right: -25px;
    bottom: -25px;
    left: 0%;
  }
}

/* Explore CSS */

.explore-container {
  position: relative;
  height: 600px;
  padding: 4rem 0;
}

.explore-container::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: #2a81ef;
  transform: skewY(7deg);
  z-index: -10;
}

.explore-container::after {
  content: "";
  position: absolute;
  top: 50%;
  bottom: -20%;
  right: 0;
  left: 0;
  background: #2a81ef;
  z-index: -10;
}

.explore-content {
  max-width: 1200px;
  margin: 3rem auto;
  color: white;
  line-height: 1.5;
  text-align: center;
}

.explore-content h2 {
  color: #2a81ef;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.explore-bottom {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  height: 400px;
  text-align: left;
  margin: 0 1rem;
  padding-top: 2rem;
  overflow: hidden;
}

.explore-bottom p {
  height: 70%;
  background: #ff8a44;
  padding: 1rem;
  box-shadow: 0 0 20px #2a81ef;
  color: black;
  display: flex;
  align-items: center;
  font-size: 1em;
  transform: translateX(-100%);
  opacity: 0;
  transition: 2s ease-in;
}

.explore-bottom img {
  height: 70%;
  box-shadow: 10px -10px 1px black;
  margin-left: 1rem;
  object-fit: cover;
  transform: translateX(100%);
  opacity: 0;
  transition: 2s ease-in;
}

/* Explore Responsive */

@media screen and (max-width: 800px) {
  .explore-bottom {
    display: grid;
    grid-template-columns: 2fr 1fr;
    margin: 0 2rem;
    font-size: 0.6rem;
    height: 300px;
  }
  .explore-bottom img {
    width: 100%;
  }
}

/* Footer CSS*/

footer {
  background: #2a81ef;
  color: white;
  height: 250px;
  text-align: center;
  padding: 2rem 0;
}

.footer-content {
  max-width: 1200px;
  margin: 1rem auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-content a {
  margin: 1rem 2rem;
  text-decoration: none;
  color: white;
}

.footer-content a:hover {
  color: #ff8a44;
  transition: 0.3s ease;
  text-decoration: underline;
}

::selection {
  background: #ff8a44;
  color: #2a81ef;
}

/* Footer Responsive */

@media screen and (max-width: 680px) {
  .footer-content a {
    margin: 0.5rem;
  }

  footer {
    height: 200px;
  }
}

.testimonial-section {
  background-color: #f2f2f2;
  padding: 40px;
  text-align: center;
}

.testimonial-container h2 {
  color: #333;
  margin-bottom: 20px;
}

.testimonial {
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  margin: 10px auto;
  width: 80%;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);
}

.testimonial-text {
  color: #555;
  font-style: italic;
}

.testimonial-author {
  color: #333;
  font-size: 1.1em;
  margin-top: 15px;
}

.logonav {
  display: flex; /* This enables flexbox */
  align-items: center; /* This vertically centers the items in the container */
  justify-content: center; /* This horizontally centers the items in the container */
}

.logonav h2 {
  margin-right: 10px; /* Adds some space between the text and the image */
}

.logonav img {
  //   width: 100px; /* Adjust the width as needed */
  height: auto; /* This ensures the image maintains its aspect ratio */
  width: 50px;
}
</style>
