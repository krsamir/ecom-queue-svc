import { RedisService } from "@ecom/services";
import { EVENT_NAME, logger as logs } from "@ecom/utils";
import { Worker } from "bullmq";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
let logger = logs(__filename);

const connection = RedisService.getRedisInstance();

const worker = new Worker(
  "product",
  async (job) => {
    if (job.name === EVENT_NAME.ADD_PRODUCT_FOR_PUBLISH) {
      try {
        console.log(job.data);
        console.log("name", job.name);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }
  },
  { connection },
);

worker.on("completed", (job) => {
  logger.info(`${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  logger.error(`${job.id} has failed with ${err.message}`);
});
