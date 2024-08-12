const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const { PORT, VERIFY_TOKEN, GRAPH_API_VERSION, PAGE_ACCESS_TOKEN } = process.env;

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

app.post('/webhook', (req, res) => {
  console.log(req.body.entry.length);
  console.log(req.body.entry.messaging);
  
  // const entry = req.body.entry[0];
  // const messaging = entry.messaging[0];
  // const senderId = messaging.sender.id;
  // const pageId = messaging.recipient.id;
  // const messageText = messaging.message.text;

  // // Check if the message is from the page
  // // if (messaging.recipient.id === 'YOUR_PAGE_ID')
  //   // Send reply
  
  // const reply = `Hello! You said: ${messageText}`;
  // sendReply(senderId, pageId, reply);

  res.status(200).send('OK');
});

// const sendReply = (senderId, pageId, reply) => {
//   const messageData = {
//     recipient: {
//       id: senderId
//     },
//     message: {
//       text: reply
//     }
//   };

//   axios.post(`https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
//     .then((response) => {
//       console.log('Message sent successfully');
//     })
//     .catch((error) => {
//       console.error('Failed to send message:', error);
//     });
// }

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
