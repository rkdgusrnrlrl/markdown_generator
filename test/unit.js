/**
 * Created by khk on 2016-04-04.
 */
'use strict';

var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var expect = chai.expect;
var assert = chai.assert;
var dropbox = require('../lib/drop.js')();

chai.should()
chai.use(chaiAsPromised);

//파일메타데이터 가져오는 프로미스 테스트
describe("Test getMeatData promise code", function(){
    it("should be contains Docker.md", function() {
        return dropbox.getMetaData("Docker.md")
            .then((fileMeta) => {
                expect(fileMeta['name']).equal("Docker.md")
            })
    });
});

//파일메타데이터 가져오는 프로미스 테스트 : 잘못된 데이터
describe("Test getMeatData promise code : put wrong filename", function(){
    it("should be error", function() {
        dropbox.getMetaData("asdfasdf")
            .then(null, (err) => {
                assert.ifError(err)
            })
    });
});

//마크다운 파일 가져오는지 테스트
describe("get markdown file", function() {
    it("should be get mark", function () {
        var filename = "Docker.md"
        return dropbox.downMarkDown(filename)
            .then((val) => {
                assert.include(val, "Docker")
            })
    })
})

//파일정보 체크후 마크다운 파일 가져오기
describe("if meta success get mark", function() {
    it("should be get mark", function () {
        var filename = "Docker.md"
        return dropbox.getMetaData(filename)
            .then(() => {
                return dropbox.downMarkDown(filename)
            })
            .then((markdown) => {
                assert.include(markdown, "Docker")
            })
    })
})

describe("if empty mark file", function() {
    it("should be show empty", function () {
        var filename = "WorkFlow.md"
        return dropbox.getMetaData(filename)
            .then(() => {
                return dropbox.downMarkDown(filename)
            })
            .then((markdown) => {
                assert.include(markdown, "Docker")
            })
    })
})









