/**
 * Created by khk on 2016-04-04.
 */
'use strict';

const chai = require("chai");
const expect = chai.expect;
const dropbox = require('../lib/drop.js')();
const rq = require('request-promise-native');
const util = require('../lib/util');
const _ = require('lodash');


//파일메타데이터 가져오는 프로미스 테스트 : 잘못된 데이터
describe("메타데이터 가져오기", function(){
    this.timeout(10000);

    it("파일메타데이터 가져오는 프로미스 테스트 Docker.md", async () => {
        const fileMeta = await dropbox.getMetaData("/Docker.md");
        expect(fileMeta['name']).equal("Docker.md");
    });

    it("없는 파일을 찾을 경우  에러 발생", async () => {
        try {
            await dropbox.getMetaData("/asdfasdf");
            expect.fail("error is not raise");
        } catch (e) {
            expect(e.statusCode).to.be.equal(409);
        }
    });

    it("파일정보 체크후 마크다운 파일 가져오기", async () => {
        const markdown = await dropbox.downMarkDown("/Docker.md");
        expect(markdown).to.include("# Docker #")
    });
});

//마크다운 파일 가져오는지 테스트
describe("마크다운 파일 다운로드", function() {
    this.timeout(10000);

    it("마크다운 파일 가져오는지 테스트", async () => {
        const markdown = await dropbox.downMarkDown("/Docker.md");
        expect(markdown).to.include("Docker");

    });
});

describe("한글파일명 처리", function() {
    this.timeout(10000);

    let requestOption = {
        url: 'https://api.dropboxapi.com/2/files/get_metadata',
        headers: {
            'Content-Type': 'application/json'
        },
        json : true,
        body : {}
    };

    it("한글 파일명 메타데이터 가져오기", async () => {
        dropbox.addAuthorizationToHeader(requestOption);
        const fileName = "long-pulling 방식의 서버 개발.md";
        requestOption.body = { path : `/${fileName}` };

        const respData = await rq.post(requestOption);
        expect(respData.name).to.equal(fileName);
    });

    let requestOptionDown = {
        url: 'https://content.dropboxapi.com/2/files/download',
        headers: {}
    };

    it("다운로드", async () => {
        dropbox.addAuthorizationToHeader(requestOptionDown);
        const fileNameEnc= util.unicodeEscape("/long-pulling 방식의 서버 개발.md");
        requestOptionDown.headers['Dropbox-API-Arg'] = "{ \"path\" : \""+fileNameEnc+"\" }";
        const respData = await rq.post(requestOptionDown);

        expect(respData).to.include("# long-pulling 방식의 서버 개발 #");
    });
});

describe("전체 리스트 가져오는 코드", function() {
    this.timeout(10000);

    it("dropbox-api 사용", async () => {
        const data = await dropbox.getAllFileList();
        const allFileList = data.entries;
        const fileNamea = _.map(allFileList, val => val.name);

        expect(fileNamea).to.include("how_develop_long-pulling_server.md");
    });
});








