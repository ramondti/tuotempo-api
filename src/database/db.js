import "dotenv/config";
import knex from "knex";
import Oracle from "oracledb";

Oracle.initOracleClient({ libDir: process.env.ORACLE_DIR });

const db = knex({
  
  client: "oracledb",
  connection: {
    host: "10.0.38.7",
    user: "tuotempo",
    password: "jmz6hr",
    database: "sml",
  },
  pool: {
    min: 1,
    max: 5,
  },
});

export default db;
