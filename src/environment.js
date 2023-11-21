export default window.location.hostname.includes("localhost")
  ? "local"
  : window.location.hostname.includes("dev")
  ? "development"
  : "production";
