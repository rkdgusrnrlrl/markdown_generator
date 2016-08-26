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

chai.should()
chai.use(chaiAsPromised);

//파일메타데이터 가져오는 프로미스 테스트
describe("Test getMeatData promise code", function(){
    it("should be contains Docker.md", function() {
        return dropbox.getMetaData("/Docker.md")
            .then((fileMeta) => {
                expect(fileMeta['name']).equal("Docker.md")
            })
    });
});

//파일메타데이터 가져오는 프로미스 테스트 : 잘못된 데이터
describe("Test getMeatData promise code : put wrong filename", function(){
    it("should be error", function() {
        dropbox.getMetaData("/asdfasdf")
            .then(null, (err) => {
                assert.ifError(err)
            })
    });
});

//마크다운 파일 가져오는지 테스트
describe("get markdown file", function() {
    it("should be get mark", function () {
        var filename = "/Docker.md"
        return dropbox.downMarkDown(filename)
            .then((val) => {
                assert.include(val, "Docker")
            })
    })
})

//파일정보 체크후 마크다운 파일 가져오기
describe("if meta success get mark", function() {
    it("should be get mark", function () {
        var filename = "/Docker.md"
        return dropbox.getMetaData(filename)
            .then(() => {
                return dropbox.downMarkDown(filename)
            })
            .then((markdown) => {
                assert.include(markdown, "Docker")
            })
    })
})

//파일에 내용이 없는 경우 무한 루프 도는 것을 방지.
//curl의 경우 문제가 없느나 node의 https request의 경우 계속 돌음
describe("if empty mark file", function() {

    function saveMdFile(jsonMeta, markdownContents, markDownDatas) {
        markDownDatas[jsonMeta.name] = {
            name: jsonMeta.name,
            rev: jsonMeta.rev,
            contents: markdownContents
        }
        return markdownContents;
    }

    it("should be show empty", function () {
        var filename = "/WorkFlow.md";
        return dropbox.getMetaData(filename)
            .then((fileMetaData) => {
                if (fileMetaData.size == 0) {
                    return saveMdFile(fileMetaData, "", markDownDatas)
                } else {
                    return dropbox.downMarkDown("/"+fileMetaData.name)
                        .then((markdownfile) => {
                            return saveMdFile(fileMetaData, markdownfile, markDownDatas)
                        });
                }
            })
            .then((markdown) => {
                assert.equal(markdown, "")
            })
    })
});

describe("한글파일명 처리", function() {
    var https = require('https')
    var option = {
        hostname: 'api.dropboxapi.com',
        path: '/2/files/get_metadata',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    var optionDown = {
        hostname: 'content.dropboxapi.com',
        path: '/2/files/download',
        port: 443,
        method: 'POST',
        headers: {

        }
    };

    it("메타데이터 가져오기", function () {
        dropbox.addAuthorizationToHeader(option, resource.accessTocken);
        function makePathJsonString(filename) {
            var postData = {path: ""};
            postData['path'] = filename;
            return JSON.stringify(postData);
        }

        var getList = new Promise((fulfil, reject) => {
            var metaReq = https.request(option, function (resForFileList) {
                var data = "";
                resForFileList.on('data',  (val) => data += val+"" );
                resForFileList.on('end',  (val) => fulfil(data) );
            });
            metaReq.write(makePathJsonString("/long-pulling 방식의 서버 개발.md"));
            metaReq.end();
        });
        return getList.then((json) => console.log(json));
    });


    it("다운로드", function () {
        dropbox.addAuthorizationToHeader(optionDown, resource.accessTocken);

        function unicodeEscape(str){
            var result = "";
            for(var i = 0; i < str.length; i++){
                result += "\\u" + ("000" + str[i].charCodeAt(0).toString(16)).substr(-4);
            }
            return result;
        };
        var fileNameEnc= unicodeEscape("/long-pulling 방식의 서버 개발.md");
        console.log(encodeURI("/long-pulling 방식의 서버 개발.md"));
        console.log(encodeURIComponent("/long-pulling 방식의 서버 개발.md"));
        console.log(fileNameEnc);


        optionDown.headers['Dropbox-API-Arg'] = "{ \"path\" : \""+fileNameEnc+"\" }";
        function makePathJsonString(filename) {
            var postData = {path: ""};
            postData['path'] = filename;
            return JSON.stringify(postData);
        }

        var getList = new Promise((fulfil, reject) => {
            var metaReq = https.request(optionDown, function (resForFileList) {
                var data = "";
                resForFileList.on('data',  (val) => data += val+"" );
                resForFileList.on('end',  (val) => fulfil(data) );
            });
            metaReq.end();
        });
        return getList.then((json) => console.log(json));
    });


});



describe("전체 리스트 가져오는 코드", function() {
    var https = require('https')
    var option = {
        hostname: 'api.dropboxapi.com',
        path: '/2/files/list_folder',
        port: 443,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };


    it("성공 기원", function () {
        dropbox.addAuthorizationToHeader(option, resource.accessTocken);
        function makePathJsonString(filename) {
            var postData = {path: ""};
            postData['path'] = filename;
            return JSON.stringify(postData);
        }

        var getList = new Promise((fulfil, reject) => {
            var metaReq = https.request(option, function (resForFileList) {
                var data = "";
                resForFileList.on('data',  (val) => data += val+"" );
                resForFileList.on('end',  (val) => fulfil(data) );
            });
            metaReq.write(makePathJsonString(""));
            metaReq.end();
        });
        return getList.then((json) => {
            var allFileList = JSON.parse(json).entries;
            allFileList.forEach((val)=>{
                console.log(val.name);
            })
        });
    })
});








