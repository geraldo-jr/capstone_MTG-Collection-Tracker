const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const mtg = require('mtgsdk');
const { render } = require('express/lib/response');
let userState = {};


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
      
      res.render('pages/index');
      
    } catch (err) {

      console.error(err);
      res.send("Error: " + err);
      
    }
  })
  .post('/userLoginStatus', async(req,res) => {
    try {
      if (userState === undefined || userState.success !== true) {
        userState = {'success': false};
        res.json(userState);
      } else {
        res.json(userState);
      }
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  })
  .get('/decks', async(req, res) => {
    res.render('pages/decks');
  })
  .get('/help', async(req, res) => {
    res.render('pages/help');
  })
  .get('/about', async(req, res) => {
    res.render('pages/about');
  })
  .post('/fetchCard', async(req, res) => {
    try {

      const cardNameInserted = req.body.card_name;

      mtg.card.where({ name: cardNameInserted})
      .then(cards => {
        if(cards[0] === undefined) {
          let cardNameNotFound = {'cardSelected': '"' + cardNameInserted + '"' + " is not a valid card name"};
          res.send(cardNameNotFound);

        } else {
          const locals = {
            'card_Name': (cards) ? cards[0].name : null,
            'cardImage': (cards) ? cards[0].imageUrl : null,
            'cards': (cards) ? cards : null
          };

          res.send(locals);
        } 
        
      });

    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  })
  .post('/save_card', async(req, res) =>{
    // User the card fechted with /fetchCard and save here into the db
    // Still need to figure out how to make user chose a card when has more then one of the same from different sets
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
				WHERE c.relname IN ('users')
				ORDER BY c.relname, a.attnum;`
			);

      const users = await client.query(
        `SELECT user_id, last_name, username FROM users;`
      );
      
      const locals = {
        'tables': (tables) ? tables.rows : null,
        'users': (users) ? users.rows : null
      };

      res.render('pages/db-info', locals);
      client.release();

    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  })
  .post('/signup_user', async(req, res) => {
    try {
      const client = await pool.connect();
      const userPassword = req.body.password;
      const userUsername = req.body.username;
      const userEmail = req.body.email;
      const userFirst_name = req.body.first_name;
      const userLast_name = req.body.last_name;
      
      const sqlInsert = await client.query(
        `INSERT INTO users (password, username, email, first_name, last_name)
        VALUES ('${userPassword}', '${userUsername}', '${userEmail}', '${userFirst_name}', '${userLast_name}')
        RETURNING user_id, username;`);

      // console.log(`Tracking task ${sqlInsert}`);

      const result = {
        'respose': (sqlInsert) ? (sqlInsert.rows[0]) : null
      };

      userState = {
        'success': true,
        'username': sqlInsert.rows[0].username,
        'user_id': sqlInsert.rows[0].user_id
      };
      
      console.log(userState);

      res.set({
        'Content-Type': 'application/json'
      });
      res.json({ requestBody: result });

      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  })
  .post('/login_user', async(req, res) => {
    try {
      const client = await pool.connect();

      const informedEmail = req.body.user_email;
      const informedPassword = req.body.user_password;

      const queryUserCredentials = await client.query(
        `SELECT user_id, username, email, password FROM users WHERE email = '${informedEmail}';`
      );
      
      if (queryUserCredentials.rowCount > 0 && informedPassword === queryUserCredentials.rows[0].password) {
        var result = {
          'success': true,
          'username': queryUserCredentials.rows[0].username,
          'user_id': queryUserCredentials.rows[0].user_id
        };

        userState = result;

      } else {
        var result = {
          'success': false
        };
      }
      
      res.send(result);

      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  })
  .post('/logout_user', async(req, res) =>{
    
    // console.log(`User ${userState.username}logged out`);

    userState = {'success': false};

    // console.log(userState);

    res.send('200');
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));