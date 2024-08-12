const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const { PORT, VERIFY_TOKEN, GRAPH_API_VERSION, PAGE_ACCESS_TOKEN, WAPP_ACCESS_TOKEN, WAPP_PHONE_NUMBER_ID } = process.env;

app.get('/', (req, res) => res.send('Welcome to Chika Chino'));

// Facebook Messenger webhook verification
app.get('/webhook', (req, res) => {
  const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Handle incoming Facebook Messenger messages
app.post('/webhook', async (req, res) => {
  const messaging = req.body.entry?.[0]?.messaging?.[0];
  
  if (messaging && messaging.sender && messaging.message) {
    const senderId = messaging.sender.id;
    const pageId = messaging.recipient.id;
    const message = messaging.message.text;

    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    const payload = {
      recipient: { id: senderId },
      messaging_type: 'RESPONSE',
      message: { text: `Echo: ${message}` },
    };
    
    try {
      await axios.post(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Message Sent');
    } catch (error) {
      console.error(`Error sending message: ${error.response?.data || error.message}`);
    }
  }

  // Respond quickly to avoid timeout issues
  res.status(200).send('OK');
});

// WhatsApp webhook verification
app.get('/wapp-webhook', (req, res) => {
  const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = req.query;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// Handle incoming WhatsApp messages
app.post("/wapp-webhook", async (req, res) => {
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (message && message.from && message.text?.body) {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WAPP_PHONE_NUMBER_ID}/messages?access_token=${WAPP_ACCESS_TOKEN}`;
    const payload = {
      messaging_product: "whatsapp",
      to: message.from,
      text: { body: "Echo: " + message.text.body },
      context: { message_id: message.id },
    };
    
    const msgSeenReq = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: message.id,
    };

    // Send both requests concurrently to minimize the delay
    try {
      await Promise.all([
        axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } }),
        axios.post(url, msgSeenReq, { headers: { 'Content-Type': 'application/json' } })
      ]);
      console.log('Message Sent');
    } catch (error) {
      console.error(`Error sending message: ${error.response?.data || error.message}`);
    }
  }

  // Respond quickly to avoid timeout issues
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
