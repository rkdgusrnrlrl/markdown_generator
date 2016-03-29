var express = require('express');
var dbox  = require("dbox")
var router = express.Router();
var app   = dbox.app({ "app_key": "06r6pi3eyiazdm3", "app_secret": "06r6pi3eyiazdm3" })




/* GET home page. */

router.get('/', function(req, res, next) {
    //var client = app.client("lX5-zkIFJGUAAAAAAAB1uBPShfsJVR08xe1HpleNc9llr3xqxElM_QyY0vfo8xAI");
    app.requesttoken(function(status, request_token){
        console.log(request_token)
    })
});
module.exports = router;

