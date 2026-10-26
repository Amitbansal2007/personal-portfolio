const path = require("path");

module.exports = {
  server: {
    port: 5173,
  },
  plugins: [
    {
      name: "api-chat-dev-middleware",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.originalUrl || req.url;
          if (url && url.split("?")[0] === "/api/chat") {
            try {
              const handlerPath = path.resolve(__dirname, "api/chat.js");
              delete require.cache[require.resolve(handlerPath)];
              const handler = require(handlerPath);
              await handler(req, res);
            } catch (err) {
              console.error("Dev server /api/chat error:", err);
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  error: "Internal dev server error handling chat.",
                })
              );
            }
          } else {
            next();
          }
        });
      },
    },
  ],
};
