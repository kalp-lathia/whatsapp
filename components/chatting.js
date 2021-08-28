const router = require('express').Router();
const { MessageMedia, Location } = require("whatsapp-web.js");
const request = require('request')
const vuri = require('valid-url');
const fs = require('fs');

var multer  = require('multer');

var upload = multer() ;

const mediadownloader = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', callback)
    })
  }

router.post('/sendmessage/:phone', async (req,res) => {
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

router.post('/sendimage/:phone', upload.array('images'), async (req,res) => {
    if (req.params.phone == undefined || req.files.length === 0) {
        res.send({ status: "error", message: "please enter valid phone or images" })
    }
    req.files.map(async (file, index) => {
        let image = file.buffer.toString('base64')
        let media = new MessageMedia('image/png',image);
        client.sendMessage(`${ req.params.phone }@c.us`, media, { caption: req.body.caption || '' }).then(response => {
            if (index === req.files.length - 1) {
                res.send("Images uploaded successfully");
            }
        });
    })
});

router.post('/sendpdf/:phone', upload.array('pdfs'), async (req,res) => {
    if (req.params.phone == undefined || req.files.length === 0) {
        res.send({ status: "error", message: "please enter valid phone or pdfs" })
    }
    req.files.map(async (file, index) => {
        let pdf = file.buffer.toString('base64')
        let media = new MessageMedia('application/pdf',pdf);
        client.sendMessage(`${ req.params.phone }@c.us`, media, { caption: req.body.caption || '' }).then(response => {
            if (index === req.files.length - 1) {
                res.send("PDF's uploaded successfully");
            }
        });
    })
});

router.post('/sendlocation/:phone', async (req, res) => {
    let phone = req.params.phone;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let desc = req.body.description;

    if (phone == undefined || latitude == undefined || longitude == undefined) { 
        res.send({ status: "error", message: "please enter valid phone, latitude and longitude" })
    } else {
        let loc = new Location(latitude, longitude, desc || "");
        client.sendMessage(`${phone}@c.us`, loc).then((response)=>{
            if (response.id.fromMe) {
                res.send({ status: 'success', message: `MediaMessage successfully sent to ${phone}` })
            }
        });
    }
});

router.get('/getchatbyid/:phone', async (req, res) => {
    let phone = req.params.phone;
    if (phone == undefined) {
        res.send({status:"error",message:"please enter valid phone number"});
    } else {
        client.getChatById(`${phone}@c.us`).then((chat) => {
            res.send({ status:"success", message: chat });
        }).catch(() => {
            console.error("getchaterror")
            res.send({ status: "error", message: "getchaterror" })
        })
    }
});

router.get('/getchats', async (req, res) => {
    client.getChats().then((chats) => {
        res.send({ status: "success", message: chats});
    }).catch(() => {
        res.send({ status: "error",message: "getchatserror" })
    })
});

module.exports = router;