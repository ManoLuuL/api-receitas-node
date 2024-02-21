const { Pool } = require("pg");

const pool = new Pool({
  host: "",
  user: "",
  password: "",
  database: "",
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = pool;
