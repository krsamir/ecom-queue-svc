import { RedisService } from "@ecom/services";
import {
  CONSTANTS,
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
  ProductService,
  CostsService,
  StockService,
  MediaService,
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
        // setting status and hash keys into draft tables
        const { old_product_hash, product } =
          await ProductDraftService.addHashAndChangeStatus({
            id: data?.id,
            trx,
          });
        const { old_costs_hash, costs } =
          await CostsDraftService.addHashAndChangeStatus({
            id: product?.id,
            trx,
          });
        const { old_stock_hash, stock } =
          await StocksDraftService.addHashAndChangeStatus({
            id: product?.id,
            trx,
          });
        const { old_media_hash, media } =
          await MediaDraftService.addHashAndChangeStatus({
            id: data?.id,
            trx,
          });

        const draftProductHash = generateHash(
          JSON.stringify({
            product: old_product_hash,
            costs: old_costs_hash,
            stock: old_stock_hash,
            medias: old_media_hash,
          }),
        );
        await ProductDraftService.update({
          payload: { master_hash: draftProductHash },
          where: { uuid: data?.id },
        }).transacting(trx);

        // pushing data into original tables

        const { product_hash } = await ProductService.upsert({
          payload: product,
          trx,
        });
        // destroy all previous cost records and merge only highest version costs
        await CostsService.destroy({ where: { product_id: product?.id } });
        const cost_hash = (
          await Promise.all(
            costs.map((t) =>
              CostsService.addLatestVersionCosts({ payload: t, trx }),
            ),
          )
        ).flat();

        await StockService.destroy({ where: { product_id: product?.id } });

        const { stock_hash } = await StockService.addLatestVersionStock({
          payload: stock,
          trx,
        });

        const { media_hash } = await MediaService.upsert({
          medias: media,
          trx,
        });

        const newProductHash = generateHash(
          JSON.stringify({
            product: product_hash,
            costs: cost_hash,
            stock: stock_hash,
            medias: media_hash,
          }),
        );
        await ProductService.update({
          payload: { master_hash: newProductHash },
          where: { uuid: data?.id },
        }).transacting(trx);

        await trx.commit();

        const [draft, published] = await Promise.all([
          ProductDraftService.get({
            where: { uuid: data?.id },
            returning: ["master_hash"],
          }).first(),
          ProductService.get({
            where: { uuid: data?.id },
            returning: ["master_hash"],
          }).first(),
        ]);

        console.log("🚀 ~ hashes:", {
          new: newProductHash,
          old: draftProductHash,
          synced: draft?.hash === published?.hash,
          productId: data?.id,
        });

        if (draft?.hash !== published?.hash) {
          throw Error(
            `Products are not in sync. Products cannot be published. [HASHES]: old:[${draftProductHash}] :: new:[${newProductHash}]`,
          );
        }

        await ProductService.update({
          payload: { is_synced: draft?.hash === published?.hash },
          where: { uuid: data?.id },
        });

        await ProductDraftService.update({
          payload: { status: CONSTANTS.PRODUCT_WORKFLOW.COMPLETED },
          where: { uuid: data?.id },
        });

        job.log(
          JSON.stringify({
            old: draftProductHash,
            new: newProductHash,
            synced: draft?.hash === published?.hash,
            productId: data?.id,
          }),
        );
        return {
          old: draftProductHash,
          new: newProductHash,
          synced: draft?.hash === published?.hash,
          productId: data?.id,
        };
      } catch (error) {
        trx.rollback();
        await ProductDraftService.update({
          payload: { status: CONSTANTS.PRODUCT_WORKFLOW.FAILED },
          where: { uuid: data?.id },
        });
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
