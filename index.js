const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async(req, res) => {
    try {
      const client = await pool.connect();
      
      client.release();
      res.send("MTG Collection Tracker Works!");
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
      
    }
  })
  .get('/db-info', async(red, res) => {
    try {
      const client = await pool.connect();
			const tables = await client.query(
				`SELECT c.relname AS table, a.attname AS column, t.typname as type
				FROM pg_catalog.pg_class AS c
				LEFT JOIN pg_catalog.pg_attribute AS a 
				ON c.oid = a.attrelid AND a.attnum > 0
				LEFT JOIN pg_catalog.pg_type AS t
				ON a.atttypid = t.oid
				WHERE c.relname IN ('users', 'observations', 'students', 'schools', 'tasks')
				ORDER BY c.relname, a.attnum;`
			);
      
      const locals = {
        'tables': (tables) ? tables.rows : null
      };

      res.render('pages/db-info', locals);
      client.release();

    } catch (error) {
      
      console.error(err);
      res.send("Error: " + err);
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));