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

class MediaDraftService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA_DRAFT}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA_DRAFT}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA_DRAFT}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA_DRAFT}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  async getMediaByProductId({ id }) {
    try {
      logger.info(`MediaDraftService.getMediaByProductId called :`);

      return knex(`${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA_DRAFT}`)
        .where({ product_id: id })
        .select("*");
    } catch (error) {
      logger.error(`
        MediaDraftService.getMediaByProductId: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  async addHashAndChangeStatus({ id = null, trx = null }) {
    try {
      logger.info(`MediaDraftService.addHashAndChangeStatus called :`);
      const arr = [];
      const medias = await this.getMediaByProductId({
        id,
      });
      if (medias?.length > 0) {
        for (let i = 0; i < medias.length; i++) {
          const item = medias[i];
          const oldHash = generateHash(
            getConcatedValueFromObject({
              payload: item,
              keys: this.getHashKeyIds(),
            }),
          );
          arr.push({ hash: oldHash });
          await this.update({
            where: { id: item.id },
            payload: { hash: oldHash },
          }).transacting(trx);
        }
        return { old_media_hash: arr, media: medias };
      }
      return { old_media_hash: [], media: medias };
    } catch (error) {
      logger.error(`
          MediaDraftService.addHashAndChangeStatus: Error occurred : ${inspect(error)}`);
      throw error;
    }
  }

  getHashKeyIds() {
    return [
      "id",
      "original_name",
      "file_name",
      "path",
      "size",
      "mime_type",
      "sequence",
      "is_active",
      "entity_id",
      "product_id",
    ];
  }
}

export default new MediaDraftService();
