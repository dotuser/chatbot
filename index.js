const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json()); 
const PORT = process.env.PORT;


app.get('/', (req, res) => {
    res.send('Not WORKING!!!');
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.MESSENGER_TOKEN) {
      console.log("WEBHOOK VERIFIED");
      res
      .status(200)
      .send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.post("/webhook", (req, res) => {
  const payload = req.body;
  // Handle the payload (e.g., parse and process the changed fields)
  res.status(200).send("OK");
});

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});