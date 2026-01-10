import {
  ENVIRONMENT,
  logger as logs,
  CONSTANTS,
  generateHash,
  getConcatedValueFromObject,
} from "@ecom/utils";
import knex from "../knexClient.js";
import { inspect } from "util";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
let logger = logs(__filename);

class StocksService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS}`,
    )
      .update({ is_deleted: shouldDelete })
      .where({ ...where });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  destroy({ where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS}`,
    )
      .delete()
      .where({ ...where });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  get({ where = {}, returning = "*" }) {
    const isWhereAvailable = Object.entries(where)?.length > 0;

    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.STOCKS}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  //  id: '3a0392c0-c6eb-438b-863f-b0b9cf09ae28',
  // quantity_available: 200,
  // reorder_level: 5,
  // supplier_name: 'Amazon',
  // source: 'Online',
  // hash: 'bb5fb69b01ef2c8083128b37d643fd83d55bb4e4f37e779fbad6f7f5832854fc',
  // entity_id: '774c9990-bd67-4a7d-b753-d334bb8155b3',
  // product_id: 1,
  // created_by: 'd69d2bce-ad9a-4685-b391-ea6dcbf133b0',
  // created_at: 2026-01-03T18:51:49.781Z,
  // updated_at: 2026-01-10T14:35:02.322Z

  async addLatestVersionStock({ payload, trx }) {
    const hash = generateHash(
      getConcatedValueFromObject({ payload, keys: this.getHashKeyIds() }),
    );
    try {
      logger.info(`StocksService.addLatestVersionStock called :`);
      await this.create({
        payload: {
          id: payload.id,
          quantity_available: payload.quantity_available,
          reorder_level: payload.reorder_level,
          supplier_name: payload.supplier_name,
          source: payload.source,
          entity_id: payload.entity_id,
          product_id: payload.product_id,
          created_by: payload.created_by,
          hash,
        },
      }).transacting(trx);

      return { stock_hash: hash };
    } catch (error) {
      logger.error(`
                StocksService.addLatestVersionStock: Error occurred : ${inspect(error)}`);
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

export default new StocksService();
