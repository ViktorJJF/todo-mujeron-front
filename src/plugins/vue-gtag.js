import Vue from "vue";
import VueGtag from "vue-gtag";

const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

let options = {
  bootstrap: false
}

if(urlParams.has('gtagid')) {
  const id = urlParams.get('gtagid')
  Object.assign(options, {
    bootstrap: true,
    config: { id }
  })
}

Vue.use(VueGtag, options);