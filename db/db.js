import pg from 'pg'


const pool = new pg.Pool({
    user: "postgres",
    password: "mark",
    host: "localhost",
    port: 5433,
    database: "weather_db"
})

export default pool;
