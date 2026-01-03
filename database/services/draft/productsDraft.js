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

class ProductDraftService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS_DRAFT}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS_DRAFT}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS_DRAFT}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.PRODUCTS_DRAFT}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  async getProductById({ id = null }) {
    try {
      logger.info(`ProductDraftService.getProductById called :`);
      return this.get({ where: { uuid: id } }).first();
    } catch (error) {
      logger.error(`
        ProductDraftService.getProductById: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  async updateProductById({ id, payload = null, trx = null }) {
    try {
      logger.info(`ProductDraftService.updateProductById called :`);
      return this.update({ where: { uuid: id }, payload }).transacting(trx);
    } catch (error) {
      logger.error(`
        ProductDraftService.updateProductById: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  async addHashAndChangeStatus({ id = null, trx = null }) {
    try {
      logger.info(`ProductDraftService.addHashAndChangeStatus called :`);
      const product = await this.getProductById({
        id,
      });
      if (product) {
        const oldHash = generateHash(
          getConcatedValueFromObject({
            payload: product,
            keys: this.getHashKeyIds(),
          }),
        );
        //
        await this.updateProductById({
          id,
          payload: {
            hash: oldHash,
            status: CONSTANTS.PRODUCT_WORKFLOW.PENDING,
          },
          trx,
        });
        return { old_product_hash: oldHash, product };
      }
      return { old_product_hash: null, product };
    } catch (error) {
      logger.error(`
        ProductDraftService.addHashAndChangeStatus: Error occurred : ${inspect(error)}`);
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
}

export default new ProductDraftService();
