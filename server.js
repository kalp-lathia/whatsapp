const express = require("express");
const bodyParser = require("body-parser");

const { Client } = require('whatsapp-web.js');

var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

let sessionCfg;
if (localStorage.getItem('session')) {
    sessionCfg = JSON.parse(localStorage.getItem('session'))
    console.log("sessionCfg ---->    ", sessionCfg)
}

global.client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--unhandled-rejections=strict'
        ],
        ignoreDefaultArgs: ['--disable-extensions']
    },
    session: sessionCfg
});

global.authed = false;

const app = express();

const port = process.env.PORT || 5001;
//Set Request Size Limit 50 MB
app.use(bodyParser.json({ limit: '50mb' }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

client.on('qr', qr => {
    localStorage.setItem('qr', qr);
    console.log("qr set ----->  ", qr)
});

client.on('disconnected', reason => {
    console.log(reason)
    localStorage.removeItem('session');
    client.on('qr', qr => {
        localStorage.setItem('qr', qr);
        console.log("qr set ----->  ", qr)
    });
    client.initialize();
})

client.on('authenticated', (session) => {
    sessionCfg = session;
    localStorage.setItem('session', JSON.stringify(session))
    authed = true;
    localStorage.removeItem('qr');
});

client.on('auth_failure', () => {
    console.log("AUTH Failed !")
    sessionCfg = ""
    process.exit()
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (config.webhook.enabled) {
        axios.post(config.webhook.path, { msg })
    }
})
client.initialize()

const chatRoute = require('./components/chatting');
const groupRoute = require('./components/group');
const authRoute = require('./components/auth');
const contactRoute = require('./components/contact');

app.use(function(req, res, next){
    // console.log(req.method + ' : ' + req.path);
    next();
});
app.get('/', (req, res) => {
    res.send("Hello World");
})
app.use('/chat',chatRoute);
app.use('/group',groupRoute);
app.use('/auth',authRoute);
app.use('/contact',contactRoute);

app.listen(port, () => {
    console.log("Server Running Live on Port : " + port);
});
