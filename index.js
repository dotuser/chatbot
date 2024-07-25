const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.get("/messaging-webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.MESSENGER_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/messaging-webhook", (req, res) => {
  const payload = req.body;
  // Handle the payload (e.g., parse and process the changed fields)
  res.status(200).send("OK");
});

// app.get("/webhook", (req, res) => {
  
//   // Parse the query params
//     let mode = req.query["hub.mode"];
//     let token = req.query["hub.verify_token"];
//     let challenge = req.query["hub.challenge"];
  
//     // Check if a token and mode is in the query string of the request
//     if (mode && token) {
//       // Check the mode and token sent is correct
//       if (mode === "subscribe" && token === messengerToken) {
//         // Respond with the challenge token from the request
//         console.log("WEBHOOK_VERIFIED");
//         res
//         .status(200)
//         .send(challenge);
//       } else {
//         // Respond with '403 Forbidden' if verify tokens do not match
//         res.sendStatus(403);
//       }
//     }
//   });

// app.post('/webhook', (req, res) => {
//   const { hubMode, hubVerifyToken, hubChallenge } = req.query;

//   if (hubMode === 'subscribe' && hubVerifyToken === 123456789) {
//     res.send(hubChallenge);
//   } else {
//     res.status(400).send('Invalid request');
//   }
// });

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});