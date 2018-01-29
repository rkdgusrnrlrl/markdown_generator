var express = require('express');
var router = express.Router();
var marked = require('marked');
var dropbox = require('../lib/drop.js')();
var moment = require('moment');
var Entities = require('html-entities').XmlEntities;
var entities = new Entities();

//const css = "/css/my_style.css";
const css = "/css/slim.css";

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

function unicodeEscape(str) {
    var result = "";
    for (var i = 0; i < str.length; i++) {
        result += "\\u" + ("000" + str[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
}

//현제 DB 역활을 하는 변수
var markDownDatas = {};

router.get('/', function (reqs, resp) {
    dropbox.getAllFileList()
        .then((json) => { //json data 가공(sort 랑 write date property 추가)

            var allFileList = JSON.parse(json).entries;
            allFileList.sort((f, s)=>{
                // f 가 크면 1, s가 크면 -1 같으면 0
                if (moment(f.server_modified).isSame(s.server_modified, 'day')) return 0;
                if (moment(f.server_modified).isAfter(s.server_modified, 'day')) {
                    return -1;
                } else {
                    return 1;
                }
            });

            allFileList.forEach((val) => {
                var writenDate = moment(val.server_modified).format("YYYY-MM-DD");
                val['writenDate'] = writenDate;
            });

            return allFileList
        })
        .then((allFileList) => {
            resp.render('home', {title: "메인페이지", allFileList: allFileList, css: css});
        })

});


/**
 * *.md 로 들어오는 요청을 처리함
 * https request 를 활용해 비동기로 dropbox를 핸들링해서
 * promise 패턴을 사용하였음
 */
router.get('*.md', function (reqs, resp) {
    var filename = decodeURI(reqs.originalUrl);
    dropbox.getMetaData(filename)
        .then((fileMetaData) => {
            if (isExsitAndIsSameVer(fileMetaData)) {
                return downloadAndSaveFile(fileMetaData);
            } else {
                return getMdContents(fileMetaData);
            }
        })
        .then((markdownContents) => {
            var pettern = /<h1[^>]*>([^<]*)<\/h1>/;
            var title = "";
            var body = marked(markdownContents);
            if (pettern.test(body)) {
                title = RegExp.$1;
                title = entities.decode(title);
            }
            resp.render('index', {title: title, body: body, css: css});
        })
        .catch((err) => {
            console.error("에러임!!");
            resp.render('index', {body: err.message, css: css});
        })
});



/**
 * md 파일을 DB 에 저장하고 md 파일 내용을 리턴
 * @param jsonMeta
 * @param markdownContents
 * @param markDownDatas
 * @returns {string|*}
 */
function saveMdFile(jsonMeta, markdownContents, markDownDatas) {
    markDownDatas[jsonMeta.name] = {
        name: jsonMeta.name,
        rev: jsonMeta.rev,
        contents: markdownContents
    };
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
 * @returns {Promise}
 */
function downloadAndSaveFile(fileMetaData) {
    if (fileMetaData.size == 0) {
        return saveMdFile(fileMetaData, "", markDownDatas)
    } else {
        var encFileName = unicodeEscape("/" + fileMetaData.name);
        return dropbox.downMarkDown(encFileName)
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

