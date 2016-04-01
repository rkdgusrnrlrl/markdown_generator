var express = require('express');
var router = express.Router();
var https = require('https')
var marked = require('marked');

var appKey = '06r6pi3eyiazdm3'
var appSecret = 'aeunwyrz0lxrk0u'
var access_tocken = 'lX5-zkIFJGUAAAAAAAB1v-bmjTXqxmA3ZZ3JZMqwbu9GyHp4SkJiz6zn0t7_q-mk';

//파일 다운로드를 위한 request option
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

/**
 * dropbox api 가 error를 json 형태로 보내면
 * error_summary 파악해 error 메세지를 리턴
 * @param data
 */
function errorhandler(data) {
    var jsonData = JSON.parse(data);

    var error_msg = jsonData['error_summary'];

    if (error_msg.includes("path/not_found/") > -1) {
        return "해당경로에 파일이 존재하지 않습니다.";
    }

    return "에러입니다.";
}


/**
 * respon 을 체크해 application/json 이면 에러로 간추 에러 처리를 함
 * @param res
 * @param data
 * @returns {string}
 */
function getHtmlBody(res, data) {
    if (res.headers['content-type'] == 'application/json') { //error 핸들링
        return errorhandler(data);
    } else {
        return marked('' + data);
    }
}

router.get('/Documents/*', function(reqs, resp, next) {
    var path = {"path": reqs.originalUrl };
    optionsForDownloadMd.headers['Dropbox-API-Arg'] = JSON.stringify(path);

    var req = https.request(optionsForDownloadMd, function (res) {
        res.on('data', function (data) {
            var body = getHtmlBody(res, data);
            console.log("body : "+body);
            resp.render('index', {body : body, css : "/css/my_style.css"})
        });
    }).end();

});

module.exports = router;

