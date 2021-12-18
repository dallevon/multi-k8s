const keys = require('./keys');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});

pgClient.on('connect', (client) => {
  client.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch((err) => console.error(err));
});

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
  res.send('Hi from api');
});
app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('SELECT * from values');
  res.send(values.rows);
});
app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});
app.post('/values', async (req, res) => {
  const index = parseInt(req.body.index);
  if (!isNaN(index) && index >= 0) {
    redisClient.hget('values', index, (err, value) => {
      let response;
      console.log(`redis returned value ${value} for index ${index}`);
      if (!isNaN(value) && value !== null) {
        response = value;
      } else {
        !value && redisClient.hset('values', index, 'Nothing yet!');
        console.log(`setting redis index ${index} to 'Nothing yet!'`);
        redisPublisher.publish('insert', index);
        response = { working: true };
      }
      pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
      res.send(response);
    });
  } else {
    res.status(422).send('Please enter positive integer value');
  }
});

app.listen(5000, (err) => {
  console.log('Listening to port 5000');
});
