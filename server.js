const express = require("express");
const bodyParser = require("body-parser");
const fs = require('fs');

const app = express();

app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Path where the session data will be stored
const SESSION_FILE_PATH = './session.json';

// Load the session data if it has been previously saved
let sessionData;
if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
}

const { Client } = require('whatsapp-web.js');
const client = new Client({
    session: sessionData // saved session object
});

const qrcode = require('qrcode-terminal');

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('authenticated', (session) => {    
    console.log('Client is Authenticated!');
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            console.error(err);
        }
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

app.post('/sendmessage/:phone', async (req,res) => {
    let phone = req.params.phone;
    let message = req.body.message;
    console.log(phone, message)
    if (phone == undefined || message == undefined) {
        res.send({ status:"error", message:"please enter valid phone and message" })
    } else {
        client.sendMessage(phone + '@c.us', message).then((response) => {
            if (response.id.fromMe) {
                res.send({ status:'success', message: `Message successfully sent to ${phone}` })
            }
        }).catch(err => {
            console.log("inside error",  err)
            res.send({ status:'failure', message: `Session not active` })
        })
    }
});

client.initialize();

app.listen(process.env.PORT || 4545, () => {
    console.log("Server Running Live on Port : 4545");
});
