const { Pool } = require("pg");
const config = require("../config");
const pool = new Pool({
  connectionString:
    "postgres://default:TFtbpzsSH0C9@ep-nameless-frog-a4uj3j7m.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
});

/**
 * Query the database using the pool
 * @param {*} query
 * @param {*} params
 *
 * @see https://node-postgres.com/features/pooling#single-query
 */
async function query(query, params) {
  const { rows, fields } = await pool.query(query, params);

  return rows;
}

module.exports = {
  query,
};
