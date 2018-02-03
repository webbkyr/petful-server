'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const {PORT, CLIENT_ORIGIN} = require('./config');
const {dbConnect} = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

//import the two queues and the helper function
const {catQueue, theCats, dogQueue, theDogs, helpers} = require('./animaldata');

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

const rePopulate = (queue, data) => {
  data.forEach(animal => queue.enqueue(animal));
  return queue;
};

app.get('/api/cat', (req, res) => {
  rePopulate(catQueue, theCats);

  const message = 'Sorry, no cats available.';
  if (helpers.peek(catQueue)) {
    return res.json(catQueue.first.data);
  } 
  else {
    res.json({message});
  }
});

app.get('/api/dog', (req, res) => {
  rePopulate(dogQueue, theDogs);

  const message = 'Sorry, no dogs available.';
  if (helpers.peek(dogQueue)) {
    return res.json(dogQueue.first.data); 
  } 
  else {
    res.json({message});
  }
});

app.delete('/api/cat', (req, res) => {
  catQueue.dequeue();
  res.status(204).end();

});

app.delete('/api/dog', (req, res) => {
  dogQueue.dequeue();
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
