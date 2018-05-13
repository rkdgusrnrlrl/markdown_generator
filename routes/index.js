const express = require('express');
const router = express.Router();
const marked = require('marked');
const util = require('../lib/util');
const contentsRepository = require('../repository/ContentsRepository');
const moment = require('moment');

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

router.get('/', async (reqs, resp) => {
    try {
        const allFileList = await contentsRepository.getAllContentsList();

        allFileList.sort(util.compareServerDateFunc);
        allFileList.forEach((val) => {
            val['writenDate'] = moment(val.server_modified).format("YYYY-MM-DD");
        });

        resp.render('home', {title: "메인페이지", allFileList: allFileList, css: css});
    } catch (e) {
        console.error(new Date());
        console.error(e);
        resp.render('index', {title: "Error", body: e.message, css: css});
    }
});


/**
 * *.md 로 들어오는 요청을 처리함
 * https request 를 활용해 비동기로 dropbox를 핸들링해서
 * promise 패턴을 사용하였음
 */
router.get('*.md', async (reqs, resp) => {
    try {
        const filename = decodeURI(reqs.originalUrl);
        const markdownContents = await contentsRepository.getMarkdownContents(filename);

        const pettern = /<h1[^>]*>([^<]*)<\/h1>/;
        let title = "";
        const body = marked(markdownContents);
        if (pettern.test(body)) {
            title = RegExp.$1;
        }
        resp.render('index', {title: title, body: body, css: css});
    } catch (err) {
        console.error(new Date());
        console.error(err);
        resp.render('index', {title: "Error", body: err.message, css: css});
    }
});


module.exports = router;

