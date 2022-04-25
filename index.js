const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const mtg = require('mtgsdk');



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
      res.render('pages/collection');
      res.render('pages/decks');
      res.render('pages/contact');

      // Using API directly through get requests and fetch. Still need to figure out how to use fetch here
      // var requestOptions = {
      //   method: 'GET',
      //   redirect: 'follow'
      // };
      
      // fetch("http://api.magicthegathering.io/v1/cards?name=Echo Mage", requestOptions)
      //   .then(response => response.text())
      //   .then(result => console.log(result.name))
      //   .catch(error => console.log('error', error));


    } catch (err) {

      console.error(err);
      res.send("Error: " + err);
      
    }
  })
  .post('/fetchCard' , async(req, res) => {
    try {

      const cardNameInserted = req.body.card_name;

      mtg.card.where({ name: cardNameInserted})
      .then(cards => {
        if(cards[0] === undefined) {
          let cardNameNotFound = {'cardSelected': '"' + cardNameInserted + '"' + " is not a valid card name"};
          res.send(cardNameNotFound);

        } else {
          const locals = {
            'cardText': (cards) ? cards[0].text : null,
            'cardImage': (cards) ? cards[0].imageUrl : null
          };

          res.send(locals);
        } 
        
      });

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
        RETURNING user_id as new_id;`);

      // console.log(`Tracking task ${sqlInsert}`);

      const result = {
        'respose': (sqlInsert) ? (sqlInsert.rows[0]) : null
      };
      res.set({
        'Content-Type': 'applicatio/json'
      });
      res.json({ requestBody: result });

      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
  })
  .post('/login_user', async(req, res) => {
    // try {
    //   const client = await pool.connect();

    //   const informedEmail = req.body.user_email;
    //   const informedPassword = req.body.user_password;

    //   const queryUserCredentials = await client.query(
    //     `SELECT user_id, username, email, password FROM users WHERE email = '${informedEmail}';`
    //   );
      
    //   if (informedEmail === queryUserCredentials.rows[0].email && informedPassword === queryUserCredentials.rows[0].password) {
    //     res.send(`User ${queryUserCredentials.rows[0].username} (id ${queryUserCredentials.rows[0].user_id}) has successfully logged in.`);
    //   } else {
    //     res.send('User not found or an incorrect email or password was provided.');
    //   }

    //   client.release();
    // } catch (err) {
    //   console.error(err);
    //   res.send("Error: " + err);
    // }
  })

  
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

  