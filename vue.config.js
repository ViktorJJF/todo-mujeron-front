const path = require("path");

module.exports = {
  outputDir: path.resolve(__dirname, "../todo-mujeron/public"),
  devServer: {
    watchOptions: {
      poll: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        ws: true,
        changeOrigin: true,
        // target: 'https://mastermindgeeks.herokuapp.com'
      },
    },
  },
};
