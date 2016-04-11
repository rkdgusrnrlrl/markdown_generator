/**
 * Created by khk on 2016-04-04.
 */
'use strict';
var https = require('https')
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
var assert = chai.assert;
chai.should()


chai.use(chaiAsPromised);

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


function getMetaData(filename) {
    var optionsForGetMeta = {
        hostname: 'api.dropboxapi.com',
        path: '/2/files/get_metadata',
        port: 443,
        method: 'POST',
        headers: {
            'Authorization': 'Bearer lX5-zkIFJGUAAAAAAAB1v-bmjTXqxmA3ZZ3JZMqwbu9GyHp4SkJiz6zn0t7_q-mk',
            'Content-Type': 'application/json'
        }
    };

    var _promise = new Promise((fulfil) => {
        var metaReq = https.request(optionsForGetMeta, function (resForMeta) {
            resForMeta.on('data', function (val) {
                var json = JSON.parse(val)
                if (json['error']) {
                    throw Error(json['error_summary'].replace('/',' '))
                } else {
                    fulfil(json);
                }
            });
        })
        var postData = {path:""}
        postData['path'] = "/documents/markdown/"+filename
        metaReq.write(JSON.stringify(postData))
        metaReq.end()
    })
    return _promise;
}


//chai promise 테스트
describe("Test getMeatData promise code", function(){
    it("should be contains Docker.md", function() {
        expect(Promise.resolve({ foo: "bar" })).to.eventually.have.property("asdhfakjlshdfjkla");
    });
});


//파일메타데이터 가져오는 프로미스 테스트
describe("Test getMeatData promise code", function(){
    it("should be contains Docker.md", function() {
        var _promise = getMetaData("Docker.md");

       return _promise.then((fileMeta) => {
           expect(fileMeta['name']).equal("Docker.md")
       })
    });
});

//파일메타데이터 가져오는 프로미스 테스트 : 잘못된 데이터
/*
describe("Test getMeatData promise code : put wrong filename", function(){
    it("should be error", function() {
        var _promise = getMetaData("asdfasdf");
    });
});
*/

// todo 메타 체크해서 성공이면 파일 받기

function promiseDownMarkDown(filename) {
    return new Promise(function (fulfil) {
        var path = {"path": "/documents/markdown/"+filename};
        var postData = JSON.stringify(path);
        optionsForDownloadMd.headers['Dropbox-API-Arg'] = postData;
        https.request(optionsForDownloadMd, function (resForDown) {
            resForDown.on('data', function (downData) {
                fulfil(downData + "")
            })
        }).end()
    })
}

describe("if meta success get mark", function() {
    it("should be get mark", function () {
        var filename = "Docker.md"
        var _promise = promiseDownMarkDown(filename)
        return _promise
            .then((val) => {
                assert.equal(val, "helo")
            })
    })
})








