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
        'Dropbox-API-Arg': '{"path":"/abc"}'
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

function getHtmlBody(res, data) {
    var body = "";
    if (res.headers['content-type'] == 'application/json') { //error 핸들링
        var jsonData = JSON.parse(data);

        var error_msg = jsonData['error_summary'];
        if (error_msg.includes("path/not_found/") > -1) {
            var body = "해당경로에 파일이 존재하지 않습니다.";
        }
    } else {
        var body = marked('' + data);
    }
    return body;
}

router.get('/Documents/*', function(reqs, resp, next) {
    var filePath = reqs.originalUrl;
    var path = {"path": filePath };
    console.log("filePath : "+filePath);
    optionsForDownloadMd.headers['Dropbox-API-Arg'] = JSON.stringify(path);
    var req = https.request(optionsForDownloadMd, function (res) {
        res.on('data', function (data) {
            var body = getHtmlBody(res, data);
            console.log("body : "+body);
            resp.render('index', {body : body})
        });
    }).end();

});

module.exports = router;

