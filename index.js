const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, WAPP_ACCESS_TOKEN, GRAPH_API_VERSION, PAGE_ACCESS_TOKEN, PORT } = process.env;

app.get('/', (req, res) => res.send('Welcome to Chika Chino'));

app.get('/webhook', (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  console.log(req.query);
  

  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.status(403).send('Forbidden');
  }
});

app.post("/webhook", (req, res) => {
  const payload = req.body
  const entry = payload.entry;
  const type = payload.object;

  if (!entry) {
    res.sendStatus(400);
  };

  if (type === 'page') {
    msgToPage(payload, res);
  } else if (type === 'whatsapp_business_account') {
    msgToWapp(payload, res);
  } else {
    res.sendStatus(400);
  } 
});

const msgToPage = async (payload, res) => {
  const promises = payload.entry.map(async (entry) => {
    const event = entry.messaging[0];

    if (event.message && event.message.text) {
      res.sendStatus(400);
    };

    const psid = event.sender.id;
    const pgid = event.recipient.id;
    const msg = event.message.text;
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pgid}/messages?access_token=${PAGE_ACCESS_TOKEN}`;
    const payload = {
      recipient: {
        id: psid,
      },
      messaging_type: 'RESPONSE',
      message: {
        text: `Server received your message: ${msg}`,
      },
    };
    
    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`Success: ${response.data}`);
    } catch (error) {
      console.error(`Error sending message: ${error.response ? error.response.data : error.message}`);
    }
  });

  await Promise.all(promises);
  res.sendStatus(200);
};

const msgToWapp = async (payload, res) => {
  const message = payload.entry?.[0]?.changes[0]?.value?.messages?.[0];

  if (!message?.type === "text") {
    res.sendStatus(400);
  };
  
  const business_phone_number_id = 
    payload.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
  
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/${GRAPH_API_VERSION}/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${WAPP_ACCESS_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      to: message.from,
      text: { body: "Echo: " + message.text.body },
      context: {
        message_id: message.id,
      },
    },
  });
  
  // mark incoming message as read
  await axios({
    method: "POST",
    url: `https://graph.facebook.com/${GRAPH_API_VERSION}/${business_phone_number_id}/messages`,
    headers: {
      Authorization: `Bearer ${WAPP_ACCESS_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      status: "read",
      message_id: message.id,
    },
  });

  res.sendStatus(200);
};

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
