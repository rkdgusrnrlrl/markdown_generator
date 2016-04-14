var express = require('express');
var router = express.Router();
var https = require('https')
var marked = require('marked');
var resource = require('../resource/resource.json');
var dropbox = require('../lib/drop.js')();

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

/**
 *
 * @param jsonMeta
 * @param markdownContents
 * @param markdownContents
 * @returns {string|*}
 */
function saveMdFile(jsonMeta, markdownContents, markDownDatas) {
    markDownDatas[jsonMeta.name] = {
        name: jsonMeta.name,
        rev: jsonMeta.rev,
        contents: markdownContents
    }
    return markdownContents;
}


function getMarkDownContents(jsonData, postData, markdownContents) {
    if (markDownDatas[jsonData.name] == null) {
        optionsForDownloadMd.headers['Dropbox-API-Arg'] = postData;
        https.request(optionsForDownloadMd, function (resForDown) {
            resForDown.on('data', function (downData) {
                markdownContents = saveMdFile(jsonData, downData, markDownDatas);
            });
        }).end();
    } else {
        markdownContents = markDownDatas[jsonData.name].contents;
    }
    return markdownContents;
}


//파일 있는 지 체크 및 버전(현제 저장된 파일과 같은 버전 인지) 체크후
//  같은 버전이면 저장된 md 파일을 html 변환후 배포
//  다른 버전이면 md 파일을 받아 저정후 html 변환하여 배포
router.get('*.md', function(reqs, resp) {
    var filename = reqs.originalUrl
    console.log(filename)

    dropbox.getMetaData(filename)
        .then((jsonData) => {
            if (markDownDatas[jsonData.name] == null
                || markDownDatas[jsonData.name]['rev'] == jsonData.rev) {
                return dropbox.downMarkDown(filename)
                            .then((markdownfile) => {
                                markDownDatas[jsonData.name] = {
                                    name : jsonData.name,
                                    rev : jsonData.rev,
                                    contents : markdownfile
                                }
                                return markdownfile;
                            })
            } else {
                return markDownDatas[jsonData.name].contents;
            }
        },
            (err) => {
                console.log(err);
                resp.end(err);
            }
        )
        .then((markdownContents) => {
            resp.render('index', {body : marked(markdownContents), css : "/css/my_style.css"});
        })
        .catch((err) => {
            console.log("에러임!!")
            console.log(err)
        })
});

module.exports = router;

