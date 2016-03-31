var express = require('express');
var router = express.Router();
var https = require('https')
var marked = require('marked');

var appKey = '06r6pi3eyiazdm3'
var appSecret = 'aeunwyrz0lxrk0u'

var access_tocken = 'lX5-zkIFJGUAAAAAAAB1v-bmjTXqxmA3ZZ3JZMqwbu9GyHp4SkJiz6zn0t7_q-mk';


var optionsForAccountInfo = {
    hostname: 'api.dropboxapi.com',
    path: '/2/users/get_current_account',
    port: 443,
    method: 'POST',
    headers: {
        'Authorization': 'Bearer lX5-zkIFJGUAAAAAAAB1v-bmjTXqxmA3ZZ3JZMqwbu9GyHp4SkJiz6zn0t7_q-mk'
    }
};

var optionsForDownloadMd = {
    hostname: 'content.dropboxapi.com',
    path: '/2/files/download',
    port: 443,
    method: 'POST',
    headers: {
        'Authorization': 'Bearer lX5-zkIFJGUAAAAAAAB1v-bmjTXqxmA3ZZ3JZMqwbu9GyHp4SkJiz6zn0t7_q-mk',
        'Dropbox-API-Arg': '{"path":"/Documents/markdown/Docker.md"}'
    }
};

router.get('/getAccount', function(reqs, resp, next) {

    var req = https.request(optionsForAccountInfo, function (res) {
        res.on('data', function (chunk) {
            console.log('what is junk');
            console.log('BODY: '+chunk);
        });
        res.on('end', function () {
            console.log('response end');
            resp.send()
        })
    }).end();

});

router.get('/downFile', function(reqs, resp, next) {
    var req = https.request(optionsForDownloadMd, function (res) {
        res.on('data', function (chunk) {
            resp.send(marked(''+chunk))
        });
        res.on('end', function () {
        })
    }).end();
});
module.exports = router;

