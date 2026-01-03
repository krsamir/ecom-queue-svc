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

class CostsDraftService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS_DRAFT}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS_DRAFT}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS_DRAFT}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS_DRAFT}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  async getCostByProductIdWithMaxVersion({ id }) {
    try {
      logger.info(
        `CostsDraftService.getCostByProductIdWithMaxVersion called :`,
      );

      return knex(`${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS_DRAFT}`)
        .where({ product_id: id })
        .andWhere("version", function () {
          this.select(knex.raw("MAX(version)")).from(
            `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.COSTS_DRAFT}`,
          );
        })
        .select("*");
    } catch (error) {
      logger.error(`
        CostsDraftService.getCostByProductIdWithMaxVersion: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  async addHashAndChangeStatus({ id = null, trx = null }) {
    try {
      logger.info(`ProductDraftService.addHashAndChangeStatus called :`);
      const arr = [];
      const costs = await this.getCostByProductIdWithMaxVersion({
        id,
      });
      if (costs?.length > 0) {
        for (let i = 0; i < costs.length; i++) {
          const item = costs[i];
          const oldHash = generateHash(
            getConcatedValueFromObject({
              payload: item,
              keys: this.getHashKeyIds(),
            }),
          );
          arr.push({ id: item.id, hash: oldHash });
          await this.update({
            where: { id: item.id },
            payload: { hash: oldHash },
          }).transacting(trx);
        }
        return { old_costs_hash: arr, costs };
      }
      return { old_costs_hash: [], costs };
    } catch (error) {
      logger.error(`
          ProductDraftService.addHashAndChangeStatus: Error occurred : ${inspect(error)}`);
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

export default new CostsDraftService();
