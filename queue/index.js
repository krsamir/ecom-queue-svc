import { RedisService } from "@ecom/services";
import {
  EVENT_NAME,
  generateHash,
  logger as logs,
  QUEUE_HANDLERS,
} from "@ecom/utils";
import { Worker } from "bullmq";
import knex, {
  ProductDraftService,
  CostsDraftService,
  StocksDraftService,
  MediaDraftService,
} from "@ecom/database";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
let logger = logs(__filename);

const connection = RedisService.getRedisInstance();

const worker = new Worker(
  QUEUE_HANDLERS.PUBLISH_PRODUCTS,
  async (job) => {
    const { name, data } = job;
    if (name === EVENT_NAME.ADD_PRODUCT_FOR_PUBLISH) {
      const trx = await knex.transaction();
      try {
        const { old_product_hash, product } =
          await ProductDraftService.addHashAndChangeStatus({
            id: data?.id,
            trx,
          });
        const { old_costs_hash } =
          await CostsDraftService.addHashAndChangeStatus({
            id: product?.id,
            trx,
          });
        const { old_stock_hash } =
          await StocksDraftService.addHashAndChangeStatus({
            id: product?.id,
            trx,
          });
        const { old_media_hash } =
          await MediaDraftService.addHashAndChangeStatus({
            id: data?.id,
            trx,
          });

        const draftProductHash = generateHash(
          JSON.stringify({
            old_product_hash,
            old_costs_hash,
            old_stock_hash,
            old_media_hash,
          }),
        );

        trx.commit();
        job.log(JSON.stringify({ old: draftProductHash }));
      } catch (error) {
        trx.rollback();
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
