const CONSTANTS = Object.freeze({
  CREATE_TIMESTAMP: "YYYY-MM-DD HH:mm:ss",
  AUTHORIZATION: "Authorization",
  HEADERS: {
    COORELATION_ID: "x-correlation-id",
    M_TOKEN: "m-token",
  },
  ENVIRONMENT: {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
  },
  STATUS: {
    SUCCESS: 1,
    FAILURE: 0,
  },

  ERROR_MESSAGE: {
    SERVER_ERROR: "Caught into some issue",
    INVALID_DATA: "Invalid data provided",
    DUPLICATE_DATA: "Duplicate Data",
  },
  ROUTE_LOGS: "ROUTE_LOGS",
  TABLES: {
    ENTITY: "entity",
    LOCATION: "location",
    MASTER: "master",
    MASTER_ENTITY_MAPPER: "master_entity_mapper",
    ROLE: "role",
    USER: "user",
    HSNS: "hsns",
    UNITS: "units",
    PRODUCTS: "products",
    TEMPLATES: "templates",
    COSTS: "costs",
    COSTS_DRAFT: "costs_draft",
    STOCKS: "stocks",
    STOCKS_DRAFT: "stocks_draft",
    PRODUCTS_DRAFT: "products_draft",
    MEDIA: "media",
    MEDIA_DRAFT: "media_draft",
  },
  AUTHENTICATION: {
    TOKEN_VALIDITY_IN_MINS: 10,
    BCRYPT_SALT: 10,
    NO_OF_INVALID_LOGINS_COUNT: 10,
    PASSWORD_CHANGE_TOKEN: "PCW",
  },
});

const EVENT_NAME = Object.freeze({
  ADD_PRODUCT_FOR_PUBLISH: "ADD_PRODUCT_FOR_PUBLISH",
});

export { CONSTANTS, EVENT_NAME };
