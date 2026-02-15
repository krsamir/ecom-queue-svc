import { ENVIRONMENT, logger as logs, CONSTANTS } from "@ecom/utils";
import knex from "../knexClient.js";
import { inspect } from "util";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
let logger = logs(__filename);

class CategoriesService {
  async truncateTable({ trx }) {
    try {
      logger.info(`CategoriesService.truncateTable called :`);
      await trx.raw(`
        TRUNCATE TABLE ${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.CATEGORIES}
        RESTART IDENTITY CASCADE
        `);
      await trx.raw(`
        TRUNCATE TABLE ${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.CATEGORIES_PRODUCT_MAPPER}
        RESTART IDENTITY CASCADE
        `);
    } catch (error) {
      logger.error(`
                      CategoriesService.truncateTable: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  async syncCategoriesTable({ trx }) {
    logger.info(`CategoriesService.syncCategoriesTable called :`);
    try {
      const categoriesDraft = await knex(
        `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.CATEGORIES_DRAFT}`,
      );
      return await knex
        .batchInsert(
          CONSTANTS.TABLES.CATEGORIES,
          categoriesDraft,
          CONSTANTS.CHUNK_SIZE,
        )
        .returning("id")
        .transacting(trx);
    } catch (error) {
      console.info("Caught into error while syncing categories table.");
      throw error;
    }
  }

  async syncMapperTable({ trx }) {
    try {
      logger.info(`CategoriesService.syncMapperTable called :`);

      const mapperDraft = await knex(
        `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.CATEGORIES_PRODUCT_MAPPER_DRAFT}`,
      );

      return await knex
        .batchInsert(
          CONSTANTS.TABLES.CATEGORIES_PRODUCT_MAPPER,
          mapperDraft,
          CONSTANTS.CHUNK_SIZE,
        )
        .returning("id")
        .transacting(trx);
    } catch (error) {
      console.info("Caught into error while syncing Mapper table.");
      throw error;
    }
  }
  async copyCategoriesTable({ trx }) {
    logger.info(`CategoriesService.copyCategoriesTable called :`);
    const categories = await this.syncCategoriesTable(trx);
    const mapper = await this.syncMapperTable({ trx });
    return { categories, mapper };
  }
}

export default new CategoriesService();
