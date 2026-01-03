import { logger as logs } from "@ecom/utils";
import Redis, { redisConfig } from "./redis-config.js";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
let logger = logs(__filename);

class RedisService {
  instance = null;

  constructor() {
    if (!this.instance) {
      this.instance = new Redis({
        ...redisConfig,
        maxRetriesPerRequest: null,
      });

      this.instance.on("connect", () => {
        console.log("Redis connected");
      });

      this.instance.on("ready", () => {
        console.log("Redis ready");
      });

      this.instance.on("error", (err) => {
        console.error("Redis connection error:", err);
      });

      this.instance.on("close", () => {
        console.warn("Redis connection closed");
      });

      this.instance.on("reconnecting", (delay) => {
        console.warn(`Redis reconnecting in ${delay}ms`);
      });

      this.instance.id = crypto.randomUUID()?.slice(0, 7);
    }
    logger.info(
      `🚀 ~ RedisService ~  this.redisInstance ~ instance id: ${this.instance?.id}`,
    );
  }

  getRedisInstance() {
    return this.instance;
  }
}

export default new RedisService();
