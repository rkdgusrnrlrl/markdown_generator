var express = require('express');
var router = express.Router();
var https = require('https')
var marked = require('marked');
var resource = require('../resource/resource.json');

var accessTocken = resource.accessTocken

//파일 다운로드를 위한 request option
var optionsForDownloadMd = {
    hostname: 'content.dropboxapi.com',
    path: '/2/files/download',
    port: 443,
    method: 'POST',
    headers: {
        'Authorization': 'Bearer '+accessTocken,
        'Dropbox-API-Arg': '{"path":"/abc"}'
    }
};

//파일 메타 정보 확인을 위한 request option
var optionsForGetMeta = {
    hostname: 'api.dropboxapi.com',
    path: '/2/files/get_metadata',
    port: 443,
    method: 'POST',
    headers: {
        'Authorization': 'Bearer '+accessTocken,
        'Content-type' : "application/json"
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

var markDownDatas  = {

};

router.get('*', function(reqs, resp, next) {
    var path = {"path": "/documents/markdown"+reqs.originalUrl };

    var postData = JSON.stringify(path);


    var metaReq = https.request(optionsForGetMeta, function (resForMeta) {
        resForMeta.on('data', function (data) {

            var jsonData = JSON.parse(data+"");
            var markdownContents = "";

            if (markDownDatas[jsonData.name] == null) {
                optionsForDownloadMd.headers['Dropbox-API-Arg'] = postData;
                https.request(optionsForDownloadMd, function (resForDown) {
                    resForDown.on('data', function (downData) {
                        markDownDatas[jsonData.name] = {
                            name : jsonData.name,
                            rev : jsonData.rev,
                            contents : downData+""
                        };
                        markdownContents = downData+"";
                    });
                }).end();
            } else {
                markdownContents = markDownDatas[jsonData.name].contents;
            }
            resp.render('index', {body : marked(markdownContents), css : "/css/my_style.css"});
        });
    });

    metaReq.write(postData);
    metaReq.end();

});

module.exports = router;

