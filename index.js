const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json()); 
const PORT = process.env.PORT;

app.get('/', (req, res) => {
  console.log('Server Running');
  res.send('Home');
});

app.get('/webhook', (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.MESSENGER_TOKEN) {
      console.log("WEBHOOK VERIFIED");
      res
      .status(200)
      .send(challenge);
    } else {
      res
      .status(403)
      .send('Forbidden');
    }
  }
});

// app.post('/webhook', (req, res) => {
//   const payload = req.body;
//   // Handle the payload (e.g., parse and process the changed fields)
//   res.status(200).send("OK");
// });


app.post('/webhook', (req, res) => {
  const payload = req.body;

  if (payload.object === 'page' && payload.entry) {
    payload.entry.forEach((entry) => {
      entry.messaging.forEach((messaging) => {
        if (messaging.message) {
          // Handle incoming message
          console.log('Received message:', messaging.message);
          // Send a response back to the user
          sendResponse(messaging.sender.id, 'Hello from my app!');
        }
      });
    });
  }

  res.status(200).send("OK");
});

// Add this function to send a response
function sendResponse(recipientId, message) {
  axios.post('https://graph.facebook.com/v14.0/me/messages', {
    recipient: { id: recipientId },
    message: { text: message },
  }, {
    headers: {
      'Authorization': `Bearer ${MESSENGER_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
}

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});
