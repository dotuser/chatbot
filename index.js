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

app.post("/webhook", async (req, res) => {
  console.log(req.body);
  res.status(200).send('Ok');
  // log incoming messages
  // console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));

  // check if the webhook request contains a message
  // details on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
  // const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];

  // // check if the incoming message contains text
  // if (message?.type === "text") {
  //   // extract the business number to send the reply from it
  //   const business_phone_number_id =
  //     req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;

  //   // send a reply message as per the docs here https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
  //   await axios({
  //     method: "POST",
  //     url: `https://graph.facebook.com/${GRAPH_API_VERSION}/${business_phone_number_id}/messages`,
  //     headers: {
  //       Authorization: `Bearer ${WAPP_ACCESS_TOKEN}`,
  //     },
  //     data: {
  //       messaging_product: "whatsapp",
  //       to: message.from,
  //       text: { body: "Echo: " + message.text.body },
  //       context: {
  //         message_id: message.id, // shows the message as a reply to the original user message
  //       },
  //     },
  //   });

  //   // mark incoming message as read
  //   // await axios({
  //   //   method: "POST",
  //   //   url: `https://graph.facebook.com/v18.0/${business_phone_number_id}/messages`,
  //   //   headers: {
  //   //     Authorization: `Bearer ${GRAPH_API_TOKEN}`,
  //   //   },
  //   //   data: {
  //   //     messaging_product: "whatsapp",
  //   //     status: "read",
  //   //     message_id: message.id,
  //   //   },
  //   // });
  // }

  // res.sendStatus(200);
});

// app.post('/webhook', async (req, res) => {
//   const payload = req.body;
//   console.log(payload);


//   if (payload.object === 'page' && payload.entry) {
//     const promises = payload.entry.map(async (entry) => {
//       const event = entry.messaging[0];

//       if (event.message && event.message.text) {
//         const psid = event.sender.id;
//         const pgid = event.recipient.id;
//         const msg = event.message.text;

//         const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pgid}/messages?access_token=${PAGE_ACCESS_TOKEN}`;

//         const payload = {
//           recipient: {
//             id: psid,
//           },
//           messaging_type: 'RESPONSE',
//           message: {
//             text: `Server received your message: ${msg}`,
//           },
//         };

//         try {
//           const response = await axios.post(url, payload, {
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           });
//           console.log(`Success: ${response.data}`);
//         } catch (error) {
//           console.error(`Error sending message: ${error.response ? error.response.data : error.message}`);
//         }
//       }
//     });

//     await Promise.all(promises);
//     res.status(200).send('OK');
//   } else {
//     res.status(400).send('Bad Request');
//   }
// });

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
