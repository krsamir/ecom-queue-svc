import ProductDraftService from "./services/productsDraft.js";
import CostsDraftService from "./services/costsDraft.js";
import ProductService from "./services/products.js";
import StocksDraftService from "./services/stockDraft.js";
import knex from "./knexClient.js";

export {
  ProductDraftService,
  ProductService,
  CostsDraftService,
  StocksDraftService,
};
export default knex;
