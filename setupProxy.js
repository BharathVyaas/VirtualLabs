const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://49.207.10.13:3009/",
      changeOrigin: true,
    })
  );
};
