const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json()); 
const PORT = process.env.PORT;


app.get('/', (req, res) => {
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
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {
  const body = req.body;
  console.log('Received webhook:', body);

  if (body.object === 'instagram') {
      body.entry.forEach(entry => {
          entry.messaging.forEach(event => {
              if (event.message && event.message.text) {
                  console.log(`Received message: ${event.message.text}`);
                  // Handle the message and send a response
                  handleIncomingMessage(event);
              }
          });
      });

      res.status(200).send('EVENT_RECEIVED');
  } else {
      res.sendStatus(404);
  }
});

// Function to handle incoming messages
function handleIncomingMessage(event) {
  const recipientId = event.sender.id;
  const messageText = `You said: ${event.message.text}`; 
  sendMessage(recipientId, messageText);
}

// Function to send messages using Instagram Graph API
function sendMessage(recipientId, messageText) {
  axios.post(`https://graph.facebook.com/v15.0/${recipientId}/messages`, {
      messaging_type: 'RESPONSE',
      recipient: { id: recipientId },
      message: { text: messageText },
  }, {
      params: { access_token: process.env.ACCESS_TOKEN },
  })
  .then(response => {
      console.log('Message sent:', response.data);
  })
  .catch(error => {
      console.error('Error sending message:', error);
  });
}


app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});
