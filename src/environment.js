export default window.location.hostname.includes("localhost")
  ? "development"
  : "production";
