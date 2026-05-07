import pino from "pino";
export const logger = pino({
  level: "info",
  base: {
    env: process.env.NODE_ENV,
  },
});
