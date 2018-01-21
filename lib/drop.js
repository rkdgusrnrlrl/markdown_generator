/**
 * Created by khk on 2016-04-12.
 */
'use strict';
var https = require('https');
var resource = require('../resource/resource.json');
var Buffer = require('buffer').Buffer;


function setDataToFulfil(resForFileList, fulfil) {
    var beforeBuf = new Buffer("");
    resForFileList.on('data', (val) => beforeBuf = Buffer.concat([beforeBuf, val]));
    resForFileList.on('end', (val) => fulfil(beforeBuf + ""));
}
function ifErr(json, reject, fulfil) {
    if (json['error']) {
        reject(Error(json['error_summary'].replace('/', ' ')))
    } else {
        fulfil(json);
    }
}
module.exports = function () {
    /**
     * header에 Authorization 값 세팅
     * @param option
     * @param accessTocken
     */
    function setApiKeyInHeader(option, accessTocken) {
        option['headers']['Authorization'] = 'Bearer '+accessTocken;
    }

    /**
     * 파라미터 혹은 헤더에 파일경로를 담기위해 json 을 String으로 만들어줌
     * @param filename
     */
    function makePathJsonString(filename) {
        var postData = {path: ""};
        postData['path'] = filename;
        return JSON.stringify(postData);
    }

    /**
     * dropbox api를 활용하기 위한 request option 값을 리턴
     * @param optionName
     * @param optionFileName
     * @returns {{}}
     */
    function getOption(optionName, optionFileName) {

        var options = {
            getMetaData : {
                hostname: 'api.dropboxapi.com',
                path: '/2/files/get_metadata',
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            },
            downloadMarkDown : {
                hostname: 'content.dropboxapi.com',
                path: '/2/files/download',
                port: 443,
                method: 'POST',
                headers: {
                    'Dropbox-API-Arg': makePathJsonString(optionFileName).replace(/\\\\/gi, "\\")
                }
            },
            getAllFileList : {
                hostname: 'api.dropboxapi.com',
                    path: '/2/files/list_folder',
                port: 443,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        };

        var option= options[optionName];
        setApiKeyInHeader(option, resource.accessTocken);
        return option
    }

    return {
        getMetaData : (filename) => {
            return new Promise((fulfil, reject) => {
                var req = https.request(getOption('getMetaData'), function (resForMeta) {
                    resForMeta.on('data', (val) => ifErr(JSON.parse(val), reject, fulfil));
                });
                req.write(makePathJsonString(filename));
                req.end()
            });
        },
        downMarkDown : (filename) => {
            return new Promise((fulfil) => {
                var req = https.request(getOption('downloadMarkDown', filename), function (resForDown) {
                    setDataToFulfil(resForDown, fulfil);
                });
                req.end();
            });
        },
        addAuthorizationToHeader : setApiKeyInHeader,
        getAllFileList : () => {
            return new Promise((fulfil) => {
                var req = https.request(getOption('getAllFileList'), (resForFileList) => {
                    setDataToFulfil(resForFileList, fulfil);
                });
                req.write(makePathJsonString(""));
                req.end();
            });
        }
    };//end dropbox obj
};










