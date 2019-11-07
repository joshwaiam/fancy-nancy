import pino = require("pino");

export default pino({
  level: process.env.LOG_LEVEL || "info",
  prettyPrint: { colorize: true }
});
