const axios = require('axios');

//  handle incoming messages
function handleIncomingMessageWhatsapp(event) {
  const from = event.messages[0].from; 
  const messageText = `You said: ${event.messages[0].text.body}`; 
  sendMessage(from, messageText);
}

//  send messages using WhatsApp Business API
function sendMessageWhatsapp(to, messageText) {
  axios.post(`https://graph.facebook.com/v13.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      messaging_product: 'whatsapp',
      to: to,
      text: { body: messageText },
  }, {
      headers: { 
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => {
      console.log('Message sent:', response.data);
  })
  .catch(error => {
      console.error('Error sending message:', error.response ? error.response.data : error.message);
  });
}

module.exports = {
  handleIncomingMessageWhatsapp,
  sendMessageWhatsapp,
};
