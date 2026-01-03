import ProductDraftService from "./services/draft/productsDraft.js";
import CostsDraftService from "./services/draft/costsDraft.js";
import ProductService from "./services/products.js";
import StocksDraftService from "./services/draft/stockDraft.js";
import MediaDraftService from "./services/draft/mediaDraft.js";
import knex from "./knexClient.js";

export {
  ProductDraftService,
  ProductService,
  CostsDraftService,
  StocksDraftService,
  MediaDraftService,
};
export default knex;
