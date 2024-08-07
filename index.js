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

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.status(403).send('Forbidden');
  }
});


app.post('/webhook', async (req, res) => {
  const payload = req.body;

  if (payload.object === 'page' && payload.entry) {
    const promises = payload.entry.map(async (entry) => {
      const event = entry.messaging[0];

      if (event.message && event.message.text) {
        const psid = event.sender.id;
        const pgid = event.recipient.id;
        const msg = event.message.text;

        const url = `https://graph.facebook.com/v20.0/${pgid}/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`;

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
      }
    });

    await Promise.all(promises);
    res.status(200).send('OK');
  } else {
    res.status(400).send('Bad Request');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
