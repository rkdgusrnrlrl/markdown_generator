var express = require('express');
var router = express.Router();
var marked = require('marked');
var dropbox = require('../lib/drop.js')();
var moment = require('moment');

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
        .then((json) => {
            console.log("json date recieve");
            var allFileList = JSON.parse(json).entries;
            var body =
            `
            <div class="home">
                <section>
                    <h2 class="smallcap">about</h2>
                    <p><a href="http://dakbutfly.me:81/">DakButFly개발서</a>는 개발 경험 정리 및 공유를 위한 사이트 이다. 해당 사이트는 <a href="https://github.com/syaning/slim">slim</a>테마를 기반으로 만들어졌다. </p>
                </section>
                <section>
                    <h2 class="smallcap">posts</h2>
                    <ul class="post-list">
            `;


            console.log("start make li");

            allFileList.forEach((val)=> {
                if (val['.tag'] == "file") {
                    var writenDate = moment(val.client_modified).format("YYYY-MM-DD");

                    body +=
                    `
                    <li>
                        <span> ${ writenDate } </span>
                        <a href="${val.name}">${ val.name.replace(".md", "") }</a>
                    </li>
                    `;
                }
            });
            console.log("end make li");
            body +=
            `
                            </ul>
                    <p><a href="javascript:;">view more...</a></p>
                </section>
            </div>
            `;
            return body
        })
        .then((body) => {


            resp.render('index', {title: "메인페이지", body: body, css: css});
        })

});


/**
 * *.md 로 들어오는 요청을 처리함
 * https request 를 활용해 비동기로 dropbox를 핸들링해서
 * promise 패턴을 사용하였음
 */
router.get('*.md', function (reqs, resp) {
    var filename = decodeURI(reqs.originalUrl);
    console.log(filename);
    dropbox.getMetaData(filename)
        .then((fileMetaData) => {
            console.log(fileMetaData);
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
            }
            resp.render('index', {title: title, body: body, css: css});
        })
        .catch((err) => {
            console.log("에러임!!");
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
    console.log();
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
        console.log(fileMetaData.name);
        var encFileName = unicodeEscape("/" + fileMetaData.name);
        console.log(encFileName);
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

