import { RedisService } from "@ecom/services";
import {
  //   CONSTANTS,
  EVENT_NAME,
  //   generateHash,
  //   getConcatedValueFromObject,
  //   logger as logs,
  QUEUE_HANDLERS,
} from "@ecom/utils";
import { Queue } from "bullmq";

// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// let logger = logs(__filename);

const connection = RedisService.getRedisInstance();

const queue = new Queue(QUEUE_HANDLERS.PUBLISH_PRODUCTS, { connection });

(async () => {
  await queue.add(EVENT_NAME.ADD_PRODUCT_FOR_PUBLISH, {
    id: "e17f6db3-b6b4-455b-8076-d8f225f10949",
  });
  process.exit(0);
})();
