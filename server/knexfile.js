// knexfile.js
const config = require('./config');

module.exports = {
  development: {
    client: "pg",
    connection: {
      connectionString: config.database.connectionString,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 0, max: 10, idleTimeoutMillis: 30000 },
    migrations: {
      directory: "./db/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./db/seeds",
    },
  },

  staging: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: { directory: "./db/migrations", tableName: "knex_migrations" },
    seeds: { directory: "./db/seeds" },
  },

  production: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    migrations: { directory: "./db/migrations", tableName: "knex_migrations" },
    seeds: { directory: "./db/seeds" },
  },
};
