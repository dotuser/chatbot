const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT;

app.get('/', (req, res) => res.send('Welcome to Chika Chino'));

app.get('/webhook', (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.MESSENGER_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.status(403).send('Forbidden');
  }
});

app.post('/webhook', (req, res) => {
  const payload = req.body;

  if (payload.object === 'page' && payload.entry) {
    payload.entry.forEach((entry) => {
      let webhook_event = entry.messaging[0];
      let sender_psid = webhook_event.sender.id;

      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      }
    });
    return res.status(200).send('OK');
  } else {
    return res.status(404).send('Not Found');
  }
});

const handleMessage = (sender_psid, received_message) => {
  if (received_message.text) {
    const response = {
      "text": `You sent the message: "${received_message.text}".`
    };
    callSendAPI(sender_psid, response);
  }
};

const callSendAPI = async (sender_psid, response) => {
  const request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  };

  try {
    await axios.post('https://graph.facebook.com/v2.6/me/messages', request_body, {
      params: { "access_token": process.env.FB_PAGE_ACCESS_TOKEN }
    });
    console.log('message sent!');
  } catch (err) {
    console.error("Unable to send message:" + err);
  }
};

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
