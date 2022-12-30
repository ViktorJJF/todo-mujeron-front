function localStorageGet(key) {
  try {
    console.log(
      "🚀 Aqui *** -> localStorage.getItem(key)",
      localStorage.getItem(key)
    );
    return localStorage.getItem(key);
  } catch (error) {
    console.log("🚀 Aqui *** -> false", false);
    return false; // means is in iframe
  }
}

export { localStorageGet };
