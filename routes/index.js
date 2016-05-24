var express = require('express');
var router = express.Router();
var marked = require('marked');
var dropbox = require('../lib/drop.js')();

marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false,
    highlight: function (code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});


//현제 DB 역활을 하는 변수
var markDownDatas  = {

};
/**
 * *.md 로 들어오는 요청을 처리함
 * https request 를 활용해 비동기로 dropbox를 핸들링해서
 * promise 패턴을 사용하였음
 */
router.get('*.md', function(reqs, resp) {
    var filename = reqs.originalUrl
    dropbox.getMetaData(filename)
        .then((fileMetaData) => {
            if (isExsitAndIsSameVer(fileMetaData)) {
                return downloadAndSaveFile(fileMetaData)
            } else {
                return getMdContents(fileMetaData);
            }
        })
        .then((markdownContents) => {
            var pettern = /<h1[^>]*>([^<]*)<\/h1>/;
            var title = ""
            var body = marked(markdownContents)
            if (pettern.test(body)) {
                title =  RegExp.$1
            }
            resp.render('index', {title: title, body : body, css : "/css/my_style.css"});
        })
        .catch((err) => {
            console.log("에러임!!")
            resp.render('index', {body : err.message, css : "/css/my_style.css"});
        })
});


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
 * md 파일을 DB 에 저장하고 md 파일 내용을 리턴
 * @param jsonMeta
 * @param markdownContents
 * @param markdownContents
 * @returns {string|*}
 */
function saveMdFile(jsonMeta, markdownContents, markDownDatas) {
    console.log()
    markDownDatas[jsonMeta.name] = {
        name: jsonMeta.name,
        rev: jsonMeta.rev,
        contents: markdownContents
    }
    return markdownContents;
}

/**
 * 해당 파일이 DB에 없거나, DB 에 있는 파일이 최신이지 확인
 * @param jsonData
 * @returns {boolean}
 */
function isExsitAndIsSameVer(jsonData) {
    return markDownDatas[jsonData.name] == null
        || markDownDatas[jsonData.name].rev != jsonData.rev;
}
/**
 * 파을일 다운 로드 한뒤  save 하고, 파일 내용을 리턴함
 * @param fileMetaData
 * @returns {Promise.<T>|*}
 */
function downloadAndSaveFile(fileMetaData) {
    if (fileMetaData.size == 0) {
        return saveMdFile(fileMetaData, "", markDownDatas)
    } else {
        return dropbox.downMarkDown("/"+fileMetaData.name)
            .then((markdownfile) => {
                return saveMdFile(fileMetaData, markdownfile, markDownDatas)
            });
    }
}
/**
 * @param fileMetaData json 형태의 메타 데이터 파일
 * @returns {*}
 */
function getMdContents(fileMetaData) {
    return markDownDatas[fileMetaData.name].contents;
}


module.exports = router;

