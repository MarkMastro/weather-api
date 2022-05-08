const Pool = require("pg").Pool;

const pool = new Pool({
    user: "postgres",
    password: "mark",
    host: "localhost",
    port: 5433,
    database: "weather_db"
})
module.exports = pool;
