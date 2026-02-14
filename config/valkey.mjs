import logger from "../utils/logger.mjs";

import Valkey from "iovalkey";

const { VALKEY_HOST, VALKEY_PORT } = process.env;

export const valkeyClient = new Valkey(VALKEY_PORT, VALKEY_HOST);

valkeyClient.on("error", (err) => {
  logger.error(err);
});
