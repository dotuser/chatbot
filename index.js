const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

// const messengerToken = process.env.MESSENGER_TOKEN 

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/webhook', (req, res) => {
  const { hubMode, hubVerifyToken, hubChallenge } = req.query;

  if (hubMode === 'subscribe' && hubVerifyToken === 123456789) {
    res.send(hubChallenge);
  } else {
    res.status(400).send('Invalid request');
  }
});

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});