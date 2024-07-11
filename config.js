const env = process.env;

const config = {
  db: {
    /* do not put password or any sensitive info here, done only for demo */
    host: env.POSTGRES_HOST,
    port: env.DB_PORT || "5432",
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DATABASE,
    ssl:env.POSTGRES_URL_NO_SSL
  },
  listPerPage: env.LIST_PER_PAGE || 10,
};

module.exports = config;
