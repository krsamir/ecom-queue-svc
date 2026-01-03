import {
  ENVIRONMENT,
  logger as logs,
  CONSTANTS,
  generateHash,
  getConcatedValueFromObject,
} from "@ecom/utils";
import knex from "../../knexClient.js";
import { inspect } from "util";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
let logger = logs(__filename);

class StocksDraftService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS_DRAFT}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS_DRAFT}`,
    )
      .update({ ...payload })
      .where({ ...where });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  delete({ shouldDelete = true, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS_DRAFT}`,
    )
      .update({ is_deleted: shouldDelete })
      .where({ ...where });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  get({ where = {}, returning = "*" }) {
    const isWhereAvailable = Object.entries(where)?.length > 0;

    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS_DRAFT}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  async getLatestStockByProductId({ id }) {
    try {
      logger.info(`StocksDraftService.getLatestStockByProductId called :`);

      return knex(`${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS_DRAFT}`)
        .where({ product_id: id })
        .orderBy("created_at", "desc")
        .limit(1)
        .select("*")
        .first();
    } catch (error) {
      logger.error(`
        StocksDraftService.getLatestStockByProductId: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  async addHashAndChangeStatus({ id = null, trx = null }) {
    try {
      logger.info(`StocksDraftService.addHashAndChangeStatus called :`);
      const stock = await this.getLatestStockByProductId({
        id,
      });
      if (stock?.id) {
        const oldHash = generateHash(
          getConcatedValueFromObject({
            payload: stock,
            keys: this.getHashKeyIds(),
          }),
        );

        await this.update({
          where: { id: stock.id },
          payload: { hash: oldHash },
        }).transacting(trx);
        return { old_stock_hash: oldHash, stock };
      }

      return { old_stock_hash: [], stock: null };
    } catch (error) {
      logger.error(`
          StocksDraftService.addHashAndChangeStatus: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  getHashKeyIds() {
    return [
      "id",
      "quantity_available",
      "reorder_level",
      "supplier_name",
      "source",
      "entity_id",
      "product_id",
    ];
  }
}

export default new StocksDraftService();
