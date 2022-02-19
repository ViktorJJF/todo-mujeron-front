import { isPast, format } from "date-fns";
import store from "@/store";
import router from "@/router";

export const addCustomScript = (src) => {
  let recaptchaScript = document.createElement("script");
  recaptchaScript.setAttribute("src", src);
  recaptchaScript.async = true;
  document.head.appendChild(recaptchaScript);
};

export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
// export let msToTime = (duration) => {
//   //   var milliseconds = parseInt((duration % 1000) / 100),
//   (seconds = Math.floor((duration / 1000) % 60)),
//     (minutes = Math.floor((duration / (1000 * 60)) % 60)),
//     (hours = Math.floor((duration / (1000 * 60 * 60)) % 24));

//   return (
//     (hours > 0 ? (hours != 1 ? hours + " horas " : hours + " hora ") : "") +
//     (minutes > 0 ? minutes + " minutos" : "") +
//     (seconds > 0 ? seconds + " segundos" : "")
//   );
//   // seconds +
//   // " segundos"
// };

// export const isLogged = () => {
//   return new Promise((resolve, reject) => {
//     axios
//       .post("/api/users/logged")
//       .then((res) => {
//         if (res.data.ok) {
//           resolve(res.data.payload);
//         } else {
//           resolve(false);
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         reject(err);
//       });
//   });
// };

// const localesDateFns = {
//     en: require('date-fns/locale/en'),
//     es: require('date-fns/locale/es')
// }

export const getFormat = (date, formatStr) => {
  // return format(date, formatStr, {
  //     locale: localesDateFns[window.__localeId__]
  // })
  return format(date, formatStr);
};

export const formatErrorMessages = (translationParent, msg) => {
  const errorArray = [];
  // Check for error msgs
  if (msg !== null) {
    const json = JSON.parse(JSON.stringify(msg));
    // If error message is an array, then we have mutiple errors
    if (Array.isArray(json)) {
      json.map((error) => {
        errorArray.push(`${error.msg}`);
      });
    } else {
      // Single error
      errorArray.push(`${msg}`);
    }
    return errorArray;
  }
  // all good, return null
  return null;
};

export const buildPayloadPagination = (
  pagination = { page: 1, itemsPerPage: 20 },
  search
) => {
  const { page, itemsPerPage } = pagination;
  let { sortDesc, sortBy } = pagination;

  // When sorting you always get both values
  if (sortBy && sortDesc)
    if (sortBy.length === 1 && sortDesc.length === 1) {
      // Gets order
      sortDesc = sortDesc[0] === true ? -1 : 1;
      // Gets column to sort on
      sortBy = sortBy ? sortBy[0] : "";
    }

  let query = {};

  // If search and fields are defined
  if (search) {
    query = {
      sort: sortBy,
      order: sortDesc,
      page,
      limit: itemsPerPage,
      filter: search.query,
      fields: search.fields,
    };
  } else if (sortBy && sortDesc) {
    // Pagination with no filters
    query = {
      sort: sortBy,
      order: sortDesc,
      page,
      limit: itemsPerPage,
    };
  } else {
    query = {
      page,
      limit: itemsPerPage,
    };
  }
  return query;
};

// Catches error connection or any other error (checks if error.response exists)
export const handleError = (error, commit, reject) => {
  let errMsg = "";
  // Resets errors in store
  commit("loadingModule/showLoading", false, { root: true });
  commit("errorModule/error", null, { root: true });
  console.log("sucedio un error....");
  console.log("el error: ", error);
  // Checks if unauthorized
  if (!error.response) {
    commit("errorModule/error", "La solicitud tardó mucho tiempo...", {
      root: true,
    });
    return reject(error);
  }
  if (error.response.status === 401) {
    router.push({ name: "Profile" });
    commit(
      "errorModule/error",
      "Pide permisos : " + error.response.data.errors.msg.data,
      { root: true }
    );
  } else {
    console.log("se produjo else");
    // Any other error
    errMsg = error.response
      ? error.response.data.errors.msg
      : "SERVER_TIMEOUT_CONNECTION_ERROR";
    setTimeout(() => {
      return errMsg
        ? commit("errorModule/error", errMsg, { root: true })
        : commit("errorModule/showError", false, { root: true });
    }, 0);
  }
  reject(error);
};

export const buildSuccess = (msg, commit) => {
  commit("loadingModule/showLoading", false, { root: true });
  commit("successModule/success", null, {
    root: true,
  });
  setTimeout(() => {
    return msg
      ? commit("successModule/success", msg, { root: true })
      : commit("successModule/showSuccess", false, { root: true });
  }, 0);
  commit("errorModule/error", null, { root: true });
};

// Checks if tokenExpiration in localstorage date is past, if so then trigger an update
export const checkIfTokenNeedsRefresh = () => {
  // Checks if time set in localstorage is past to check for refresh token
  if (
    window.localStorage.getItem("token") !== null &&
    window.localStorage.getItem("tokenExpiration") !== null
  ) {
    if (
      isPast(
        new Date(
          JSON.parse(window.localStorage.getItem("tokenExpiration")) * 1000
        )
      )
    ) {
      store.dispatch("refreshToken");
    }
  }
};

export const buildQueryWithPagination = (query) => {
  let queryWithPagination = {};
  if (query && query.page) {
    let { page, search, fieldsToSearch } = query;
    queryWithPagination = buildPayloadPagination(
      {
        page,
        itemsPerPage: store.state.itemsPerPage,
      },
      search ? { query: search, fields: fieldsToSearch.join(",") } : {}
    );
    delete query["page"];
    delete query["fieldsToSearch"];
    delete query["search"];
  }
  return { ...queryWithPagination, ...query };
};

export const timeout = (millis) => {
  return new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
};

export const startsWith = (str, word) => {
  return str.lastIndexOf(word, 0) === 0;
};

export const getCountryCode = (country) => {
  let countries = {
    Peru: "51",
    Chile: "56",
    Colombia: "58",
  };
  return countries[country] || "";
};

export const getCountryByPhone = (phone) => {
  let formattedPhone = String(phone)
    .replace("+", "")
    .trim();
  let codes = {
    51: "Peru",
    56: "Chile",
    58: "Colombia",
  };
  let code = Object.keys(codes).find((code) => formattedPhone.startsWith(code));
  return code ? codes[code] : null;
};

export const formatPhone = (phone, country) => {
  //country Peru, Chile, Colombia, etc
  let cleanPhone = phone.replace(/[^0-9]/g, "");
  let countryCode = getCountryCode(country);
  if (startsWith(cleanPhone, countryCode)) return cleanPhone;
  return countryCode + cleanPhone;
};

export const sortAlphabetically = (a, b, attribute) => {
  var textA = a[attribute].toUpperCase();
  var textB = b[attribute].toUpperCase();
  return textA < textB ? -1 : textA > textB ? 1 : 0;
};

export const getProductRef = (productName) => {
  console.log("el match: ", productName.match(/-*([0-9]-*){1,}/g));
  let numberRefs = productName.match(/-*([0-9]-*){1,}/g) || [];
  if (numberRefs.length > 0) return numberRefs[0];
  else
    productName = productName
      .toLowerCase()
      .replace("jeans", "")
      .replace("jean", "")
      .replace("colombiano", "")
      .replace("colombianos", "")
      .replace("pushup", "")
      .replace("pushups", "")
      .replace("push up", "")
      .replace("levantacola", "")
      .replace("levanta cola", "")
      .replace("tyt", "")
      .replace("t&T", "")
      .replace("real", "")
      .replace("Asi sea", "")
      .replace("asi sea", "")
      .replace("asisea", "")
      .replace("forlux", "")
      .replace("Cheviotto", "")
      .replace("cheviotto", "")
      .replace("T&amp;T", "")
      .replace("t&amp;t", "")
      .replace("t&amp;t", "")
      .replace("body", "")
      .replace("reductor", "")
      .replace("colombiano", "")
      .replace("ideal", "")
      .replace("pantalón", "")
      .replace("pantalon", "")
      .replace("eco-cuero", "")
      .replace("colombiana", "")
      .trim()
      .toUpperCase();
  return productName;
};

export const scrollBottom = () => {
  setTimeout(() => {
    var objDiv = document.getElementById("content_section"); // es el id del contenedor del chat
    objDiv.scrollTop = objDiv.scrollHeight;
  }, 0);
};
