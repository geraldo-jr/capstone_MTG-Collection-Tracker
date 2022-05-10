const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const { Pool } = require('pg');
const mtg = require('mtgsdk'); // MTG API SDK that enables fetching cards data
const { render } = require('express/lib/response');
const { connect } = require('http2');
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
    const client = await pool.connect();
    if (userState.user_id === undefined) {
      var locals = {
        'decks': "User is not logged in"
      };
      
    } else {
      const decks = await client.query(
        `SELECT user_id, deck_id, description, deck_name, type_id FROM deck WHERE user_id = ${userState.user_id};`
      );
      
      var locals = {
        'decks': (decks) ? decks.rows : null
      };
      
    }
    res.render('pages/decks', locals);
    client.release();
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

      // Searching for the card info with the input of card name provided by the user.
      // This uses the mtg variable, which is the SDK for the API. It uses a query process to fetch the card using the name. If no card found under that name sends back a message to the front end and displays an error message to the user.
      mtg.card.where({ name: cardNameInserted})
      .then(cards => {
        if(cards[0] === undefined) {
          let cardNameNotFound = {'cardSelected': '"' + cardNameInserted + '"' + " is not a valid card name"};
          res.send(cardNameNotFound);

        } else {
          // If query is success, send the card image and name together with the card object containing all the card info to be used in the front end. 
          // THIS CAN BE IMPROVED AND USE ON THE "cards" OBJECT TO BE USED IN THE FRONTEND.
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
  .post('/save_card', async(req, res) => {
    try {
      
      const client = await pool.connect();
      
      const sqlCheckCardExistence = await client.query(
        `SELECT multiverse_id FROM card WHERE multiverse_id = ${req.body.multiverseId};`
      );

      console.log(sqlCheckCardExistence.rowCount);

      if (req.body.userId === null) {
        res.send('User not logged in. Please, sign in to access your collection and add the card.');
        console.log('User not logged in.');
      } else if(sqlCheckCardExistence.rowCount !== 0) {
        res.send('Card already in your collection.');
        console.log('Card already inserted.');
      } else {

        console.log(`(${req.body.multiverseId}, ${req.body.userId}, '${req.body.card_Name}', '${req.body.manaCost}', '${req.body.cardText}', '${req.body.cardType}', '{${req.body.cardSubtype}}', '${req.body.setName}', ${req.body.power}, ${req.body.toughness}, '${req.body.cardImage}', ${req.body.copies}, ${req.body.foiled})`);
        
        try {
          const sqlInsert = await client.query(
            `INSERT INTO card (multiverse_id, user_id, card_name, mana_cost, card_text, card_type, card_subtypes, set_name, power, toughness, card_image, copies, foiled) VALUES 
            (${req.body.multiverseId}, ${req.body.userId}, '${req.body.card_Name}', '${req.body.manaCost}', '${req.body.cardText}', '${req.body.cardType}', '{${req.body.cardSubtype}}', '${req.body.setName}', ${req.body.power}, ${req.body.toughness}, '${req.body.cardImage}', ${req.body.copies}, ${req.body.foiled})
            RETURNING multiverse_id;`);
              
            res.send(`Card with multiver id ${req.body.multiverseId} added to your collection`);
            
        } catch (error) {
          console.error(error);
          res.send("A problem occured and card couldn't be added to your collection.");

        }
        
      }
    
      client.release();

    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
    
  })
  .post('/cards_collection', async(req, res) => {
    try {
      
      const client = await pool.connect();
      
      // const sqlCheckCardExistence = await client.query(
      //   `SELECT * FROM card WHERE user_id = ${req.body.user_id};`
      // );
      
      // console.log(sqlCheckCardExistence);
      
      client.release();

    } catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }
    
  })
  .post('/addToDeck', async(req,res) => {
    try {
      const client = await pool.connect();
      const selDeck = req.body.deck_id;
      const selCard = req.body.card_id;

      const sqlInsert = await client.query(
        `INSERT INTO deck_card (deck_id, card_id) VALUES ('${selDeck}', '${selCard}')`
      );

      const result = {
        'respose': (sqlInsert) ? (sqlInsert.rows[0]) : null
      };
      res.set({
        'Content-Type': 'application/json'
      });
      res.json({ requestBody: result });

      client.release();
    }
    catch (err) {
      console.error(err);
      res.send("Error: " + err);
    }

  })
  .post('/createDeck', async(req, res) => {
    try {
      const client = await pool.connect();
      const deckName = req.body.deck_name;
      const deckDesc = req.body.deck_desc;
      const deckFormat = req.body.deck_format;
      const userId = req.body.user_id;

      

      console.log(`INSERT INTO deck (user_id, deck_name, description, type_id) values ('${userId}', '${deckName}', '${deckDesc}', '${deckFormat}');`);

      const sqlInsert = await client.query(
        `INSERT INTO deck (user_id, deck_name, description, type_id) values ('${userId}', '${deckName}', '${deckDesc}', '${deckFormat}');`
      )

    }
    catch (err) {
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

      const decks = await client.query(
        `SELECT user_id, deck_id, description, deck_name, type_id FROM deck;`
      );

      const cards = await client.query(
        `SELECT * FROM card;`
      );
            
      const locals = {
        'tables': (tables) ? tables.rows : null,
        'users': (users) ? users.rows : null,
        'card': (cards) ? cards.rows : null,
        'decks': (decks) ? decks.rows : null
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