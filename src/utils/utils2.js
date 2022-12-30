function localStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return false; // means is in iframe
  }
}

export { localStorageGet };
