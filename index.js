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
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
  // Stoped at minute 4:16 of second video
  // I also included the .env file but didn't push it to git or heroku. Not sure if it's necessary.