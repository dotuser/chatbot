const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const { PORT, VERIFY_TOKEN, GRAPH_API_VERSION, PAGE_ACCESS_TOKEN, WAPP_ACCESS_TOKEN, WAPP_PHONE_NUMBER_ID } = process.env;

app.get('/', (req, res) => res.send('Welcome to Chika Chino'));

app.get('/webhook', (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(req.query);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.status(403).send('Forbidden');
  }
});

app.post('/webhook', async (req, res) => {
  const messaging = req.body.entry[0].messaging[0];

  const senderId = messaging.sender.id;
  const pageId = messaging.recipient.id;
  const message = messaging.message.text;

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/messages?access_token=${PAGE_ACCESS_TOKEN}`;
  const payload = {
    recipient: {
      id: senderId,
    },
    messaging_type: 'RESPONSE',
    message: {
      text: `Echo: ${message}`,
    },
  };
  
  try {
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Message Sent');
  } catch (error) {
    console.error(`Error sending message: ${error.response ? error.response.data : error.message}`);
  }

  res.status(200).send('OK');
});

app.get('/wapp-webhook', (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(req.query);

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.status(403).send('Forbidden');
  }
});

app.post("/wapp-webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message || message.type !== "text") {
    return res.sendStatus(400);
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WAPP_PHONE_NUMBER_ID}/messages?access_token=${WAPP_ACCESS_TOKEN}`;
  const payload = {
    messaging_product: "whatsapp",
    to: message.from,
    text: { body: "Echo: " + message.text.body },
    context: {
      message_id: message.id,
    },
  };
  const msgSeenReq = {
    messaging_product: "whatsapp",
    status: "read",
    message_id: message.id,
  };
  try {
    await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    await axios.post(url, msgSeenReq, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Message Sent');
    res.sendStatus(200);
  } catch (error) {
    console.error(`Error sending message: ${error.response ? error.response.data : error.message}`);
    res.sendStatus(400);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
