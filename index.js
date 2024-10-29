const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { handleMessage } = require('./main.js');
const config = require('./config.json');

const app = express();
app.use(bodyParser.json());

// Serve the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Webhook for Messenger
app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = 'dipto008';
    const { mode, token, challenge } = req.query;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;
    //console.log(body)
    if (body.object === 'page') {
        for (const entry of body.entry) {
            const webhook_event = entry.messaging[0];
            const sender_psid = webhook_event.sender.id;

         //   console.log("webhook_event", webhook_event);

            if (webhook_event.message) {
                await handleMessage(sender_psid, webhook_event.message);
            }
        }
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Start the server
app.listen(1337, () => console.log('Server is running on port 1337'));