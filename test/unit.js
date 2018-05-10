/**
 * Created by khk on 2016-04-04.
 */
'use strict';

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
var assert = chai.assert;
var dropbox = require('../lib/drop.js')();
var resource = require('../resource/resource.json');
const rq = require('request-promise-native');
const util = require('../lib/util');
const _ = require('lodash');
chai.should();
chai.use(chaiAsPromised);

//파일메타데이터 가져오는 프로미스 테스트 : 잘못된 데이터
describe("메타데이터 가져오기", function(){
    it("파일메타데이터 가져오는 프로미스 테스트 Docker.md", async () => {
        const fileMeta = await dropbox.getMetaData("/Docker.md");
        expect(fileMeta['name']).equal("Docker.md");
    }).timeout(10000);

    it("없는 파일을 찾을 경우  에러 발생", async () => {
        expect(dropbox.getMetaData("/asdfasdf")).to.be.rejectedWith(Error, "Error: path not_found")
    });

    it("파일정보 체크후 마크다운 파일 가져오기", async () => {
        const filename = "/Docker.md";
        await dropbox.getMetaData(filename);
        const markdown = await dropbox.downMarkDown(filename);
        assert.include(markdown, "Docker");
    }).timeout(10000)
});

//마크다운 파일 가져오는지 테스트
describe("마크다운 파일 다운로드", function() {
    it("마크다운 파일 가져오는지 테스트", function () {
        const filename = "/Docker.md";
        return dropbox.downMarkDown(filename)
            .then((val) => {
                assert.include(val, "Docker")
            })
    }).timeout(10000)
});

describe("한글파일명 처리", function() {

    let requestOption = {
        url: 'https://api.dropboxapi.com/2/files/get_metadata',
        headers: {
            'Content-Type': 'application/json'
        },
        json : true,
        body : {}
    };

    it("한글 파일명 메타데이터 가져오기", async () => {
        dropbox.addAuthorizationToHeader(requestOption, resource.accessTocken);
        const fileName = "long-pulling 방식의 서버 개발.md";
        requestOption.body = { path : `/${fileName}` };

        const respData = await rq.post(requestOption);
        expect(respData.name).to.equal(fileName);
    }).timeout(10000);

    let requestOptionDown = {
        url: 'https://content.dropboxapi.com/2/files/download',
        headers: {}
    };

    it("다운로드", async () => {
        dropbox.addAuthorizationToHeader(requestOptionDown, resource.accessTocken);
        const fileNameEnc= util.unicodeEscape("/long-pulling 방식의 서버 개발.md");
        requestOptionDown.headers['Dropbox-API-Arg'] = "{ \"path\" : \""+fileNameEnc+"\" }";
        const respData = await rq.post(requestOptionDown);

        expect(respData).to.include("# long-pulling 방식의 서버 개발 #");
    });
});

describe("전체 리스트 가져오는 코드", function() {
    it("dropbox-api 사용", async () => {
        const data = await dropbox.getAllFileList();
        const allFileList = JSON.parse(data).entries;
        const fileNamea = _.map(allFileList, val => val.name);
        expect(fileNamea).to.include("how_develop_long-pulling_server.md");
    });
});








