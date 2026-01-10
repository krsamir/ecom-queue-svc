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

class MediaService {
  create({ payload = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA}`,
    ).insert({ ...payload });

    if (returning) {
      baseQuery?.returning(returning);
    }

    return baseQuery;
  }

  update({ payload = {}, where = {}, returning = null }) {
    const baseQuery = knex(
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA}`,
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
      `${ENVIRONMENT.KNEX_SCHEMA}.${CONSTANTS.TABLES.MEDIA}`,
    ).select(returning);

    if (isWhereAvailable) {
      baseQuery?.where({ ...where });
    }

    return baseQuery;
  }

  async upsert({ medias, trx }) {
    try {
      logger.info(`MediaService.upsert called :`);
      const arr = [];
      for (let i = 0; i < medias.length; i++) {
        const payload = medias[i];

        const hash = generateHash(
          getConcatedValueFromObject({ payload, keys: this.getHashKeyIds() }),
        );
        arr.push({ hash });
        await this.create({
          payload: {
            id: payload.id,
            original_name: payload.original_name,
            file_name: payload.file_name,
            path: payload.path,
            size: payload.size,
            mime_type: payload.mime_type,
            sequence: payload.sequence,
            is_active: payload.is_active,
            entity_id: payload.entity_id,
            product_id: payload.product_id,
            hash,
          },
        })
          .onConflict("id")
          .merge(this.getUpsertKeys())
          .transacting(trx);
      }

      return { media_hash: arr };
    } catch (error) {
      logger.error(`
            MediaService.upsert: Error occurred : ${inspect(error)}`);
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
  getUpsertKeys() {
    return [
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

export default new MediaService();
