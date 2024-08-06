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

// app.post('/webhook', async (req, res) => {
//   const payload = req.body;
//   let psid = null;
//   let pgid = null;
//   let msg = null;

//   if (payload.object === 'page' && payload.entry) {
//     payload.entry.forEach(entry => {
//       const event = entry.messaging[0];
      
//       psid = event.sender.id;
//       pgid = event.recipient.id;
//       msg = event.message.text;
//     });

//     //  FACEBOOK PAGE
//     if (psid && pgid && msg) {
//       const url = `https://graph.facebook.com/v20.0/${pgid}/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`;
          
//       const payload = {
//         recipient: {
//           id: psid,
//         },
//         messaging_type: 'RESPONSE',
//         message: {
//           text: `Server received your message: ${msg}`,
//         },
//       };
      
//       try {
//         await axios.post(url, payload)
//         .then(res => {
//           console.log(`Success: ${res.data}`);
//           res.status(200).send('OK');
//         }).catch(e => {
//           console.log(`Success: ${res.data}`);
//           res.status(400);
//         })
//       } catch (error) {
//         console.log(error);
//       }
//     }
//   }
// });

// const callSendAPI = async (pgid, psid, msg) => {
//   const url = `https://graph.facebook.com/v20.0/${pgid}/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`;

//   const payload = {
//     recipient: {
//       id: psid,
//     },
//     messaging_type: 'RESPONSE',
//     message: {
//       text: `Server received your message: ${msg}`,
//     },
//   };

//   try {
//     await axios.post(url, payload);
//     console.log('Message Sent');
//   } catch (error) {
//     console.log(error);
//   }
// };

// await axios.post(url, payload, {
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })
//   .then(response => {
//     console.log('Message sent:', response.data);
//   })
//   .catch(error => {
//     console.error('Error sending message:', error.response ? error.response.data : error.message);
//   });

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
