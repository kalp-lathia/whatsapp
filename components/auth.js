const router = require('express').Router();
const fs = require('fs');
var LocalStorage = require('node-localstorage').LocalStorage,
localStorage = new LocalStorage('./scratch');

router.get('/checkauth', async (req, res) => {
    client.getState().then((data) => {
        console.log(data)
        res.send(data)
    }).catch((err) => {
        if (err) {
            res.send("DISCONNECTED")
            localStorage.removeItem('session');
        }
    })
});

router.get('/getqr', (req,res) => {
    var qrjs = fs.readFileSync('components/qrcode.js');

    if (localStorage.getItem('session')) {
        res.send('already connected')
    } else {
        var page = `
            <html>
                <body>
                    <script>${qrjs}</script>
                    <div id="qrcode"></div>
                    <script type="text/javascript">
                        new QRCode(document.getElementById("qrcode"), "${localStorage.getItem('qr')}");
                    </script>
                </body>
            </html>
        `
        res.write(page)
        res.end();
    }
});

module.exports = router;