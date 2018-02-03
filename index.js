'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const {catData, dogData, cats, dogs, helpers} = require('./animaldata');
const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/cat', (req, res) => {
  const message = 'Sorry, no cats available.';
  if (helpers.peek(cats)) {
    res.json(cats.first.data);
  } 
  else {
    res.json({message});
  }
});

app.get('/api/dog', (req, res) => {
  const message = 'Sorry, no dogs available.';
  if (helpers.peek(dogs)) {
    res.json(dogs.first.data); 
  } 
  else {
    res.json({message});
  }
});

app.delete('/api/cat', (req, res) => {
  catData.shift();
  res.status(204).end();

});

app.delete('/api/dog', (req, res) => {
  dogData.shift();
  res.status(204).end();
});


function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = {app};
