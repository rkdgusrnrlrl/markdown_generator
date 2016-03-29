var express = require('express');
var Dropbox = require("dropbox");
var router = express.Router();


var client = new Dropbox.Client({
    key: "your-key-here",
    secret: "your-secret-here"
});

/* GET home page. */
router.get('/', function(req, res, next) {
    var client = app.client("lX5-zkIFJGUAAAAAAAB1nueg3II0vRur31drgj-c4CFdEWAktrWiFLtHmvsw2Hb5");

    client.account(function(status, reply){
        console.log(status);
        console.log(reply);
    });
  //res.render('index', { title: 'Express' });
});

module.exports = router;
