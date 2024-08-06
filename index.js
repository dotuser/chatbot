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

app.post('/webhook', (req, res) => {
  const payload = req.body;

  // console.log(payload);
  //  FOR INSTA  |  if (body.object === 'instagram') {

  if (payload.object === 'page' && payload.entry) {
    payload.entry.forEach((entry) => {
      console.log(`Page ID: ${entry.id}`);
      
      let event = entry.messaging[0];
      
      let psid = event.sender.id;
      let pgid = event.recipient.id;
      let msg = event.message.text;

      console.log(`PGID: ${pgid}`);
      console.log(`PSID: ${psid}`);
      console.log(`MSG: ${msg}`);

      //  FACEBOOK PAGE
      // if (event.message) {
      //   callSendAPI(psid, event.message);
      // }
    });
    return res.status(200).send('OK');
  } else {
    return res.status(404).send('Not Found');
  }
});

// const callSendAPI = async (psid, msg) => {
//   console.log(msg.text);

//   if (msg.text) {
//     const url = `https://graph.facebook.com/v20.0/${process.env.PAGE_ID}/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`;
  
//     const payload = {
//       recipient: {
//         id: psid,
//       },
//       messaging_type: 'RESPONSE',
//       message: {
//         text: `Server received your message: ${msg.text}`,
//       },
//     };

//     await axios.post(url, payload, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     })
//       .then(response => {
//         console.log('Message sent:', response.data);
//       })
//       .catch(error => {
//         console.error('Error sending message:', error.response ? error.response.data : error.message);
//       });
//   }
// };

// const request_body = {
//   "recipient": {
//     "id": sender_psid
//   },
//   "message": response
// };

// try {
//   await axios.post('https://graph.facebook.com/v2.6/me/messages', request_body, {
//     params: { "access_token": process.env.INSTA_PAGE_ACCESS_TOKEN }
//   });
//   console.log('Message Sent!');
// } catch (err) {
//   console.error("Unable to send message:" + err);
// }

// function sendMessage(recipientId, messageText) {
//   axios.post(`https://graph.facebook.com/v15.0/${recipientId}/messages`, {
//       messaging_type: 'RESPONSE',
//       recipient: { id: recipientId },
//       message: { text: messageText },
//   }, {
//       params: { access_token: process.env.ACCESS_TOKEN },
//   })
//   .then(response => {
//       console.log('Message sent:', response.data);
//   })
//   .catch(error => {
//       console.error('Error sending message:', error);
//   });
// }


app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
