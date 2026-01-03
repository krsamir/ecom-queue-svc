import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const ENVIRONMENT = Object.freeze({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  KNEX_USERNAME: process.env.KNEX_USERNAME,
  KNEX_HOST: process.env.KNEX_HOST,
  KNEX_PASSWORD: process.env.KNEX_PASSWORD,
  KNEX_SCHEMA: process.env.KNEX_SCHEMA,
  KNEX_DATABASE: process.env.KNEX_DATABASE,
  KNEX_CLIENT: process.env.KNEX_CLIENT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
});

export default ENVIRONMENT;
