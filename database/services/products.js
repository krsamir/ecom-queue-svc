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

class ProductService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  async upsert({ payload, trx }) {
    try {
      logger.info(`ProductService.upsert called :`);
      const hash = generateHash(
        getConcatedValueFromObject({ payload, keys: this.getHashKeyIds() }),
      );
      await this.create({
        payload: {
          id: payload.id,
          uuid: payload.uuid,
          name: payload.name,
          hindi_name: payload.hindi_name,
          description: payload.description,
          barcode: payload.barcode,
          unit: payload.unit,
          hsn_id: payload.hsn_id,
          unit_type: payload.unit_type,
          entity_id: payload.entity_id,
          is_active: payload.is_active,
          is_deleted: payload.is_deleted,
          hash,
        },
      })
        .onConflict("id")
        .merge(this.getUpsertKeys())
        .transacting(trx);

      return { product_hash: hash };
    } catch (error) {
      logger.error(`
            ProductService.upsert: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }
  getHashKeyIds() {
    return [
      "id",
      "uuid",
      "name",
      "hindi_name",
      "description",
      "barcode",
      "unit",
      "hsn_id",
      "unit_type",
      "entity_id",
      "is_active",
      "is_deleted",
    ];
  }
  getUpsertKeys() {
    return [
      "name",
      "hindi_name",
      "description",
      "barcode",
      "unit",
      "hsn_id",
      "unit_type",
      "entity_id",
      "is_active",
      "is_deleted",
    ];
  }
}

export default new ProductService();
