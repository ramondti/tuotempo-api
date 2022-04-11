import "dotenv/config";
import knex from "knex";
import Oracle from "oracledb";

Oracle.initOracleClient({ libDir: process.env.ORACLE_DIR });

const db = knex({
  
  client: "oracledb",
  connection: {
    host: "10.0.38.7", //'10.16.70.3',
    user: "tuotempo", //"dbamv", 
    password: "jmz6hr", // "inovar2013",
    database: "sml", //"MVTESTE2",
  },
  pool: {
    min: 1,
    max: 5,
  },
});

export default db;
