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

class CostService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  async addLatestVersionCosts({ payload, trx }) {
    try {
      logger.info(`CostService.addLatestVersionCosts called :`);
      return this.create({
        payload: {
          id: payload.id,
          min_qty: payload.min_qty,
          max_qty: payload.max_qty,
          purchase_cost: payload.purchase_cost,
          cost_for_sell: payload.cost_for_sell,
          actual_cost: payload.actual_cost,
          currency: payload.currency,
          valid_from: payload.valid_from,
          valid_to: payload.valid_to,
          version: payload.version,
          entity_id: payload.entity_id,
          product_id: payload.product_id,
          created_by: payload.created_by,
          hash: generateHash(
            getConcatedValueFromObject({ payload, keys: this.getHashKeyIds() }),
          ),
        },
      })
        .transacting(trx)
        .returning(["hash"]);
    } catch (error) {
      logger.error(`
              CostService.addLatestVersionCosts: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }
  getHashKeyIds() {
    return [
      "id",
      "min_qty",
      "max_qty",
      "purchase_cost",
      "cost_for_sell",
      "actual_cost",
      "currency",
      "valid_from",
      "valid_to",
      "version",
      "entity_id",
      "product_id",
    ];
  }
}

export default new CostService();
