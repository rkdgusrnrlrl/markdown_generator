/**
 * Created by khk on 2016-04-12.
 */
'use strict';
var https = require('https')
var resource = require('../resource/resource.json');



module.exports = function () {
    /**
     * header에 Authorization 값 세팅
     * @param option
     * @param accessTocken
     */
    function addAuthorizationToHeader(option, accessTocken) {
        option['headers']['Authorization'] = 'Bearer '+accessTocken;
    }

    /**
     * 파라미터 혹은 헤더에 파일경로를 담기위해 json 을 String으로 만들어줌
     * @param filename
     */
    function makePathJsonString(filename) {
        var postData = {path: ""}
        postData['path'] = filename
        return JSON.stringify(postData);
    }

    /**
     * dropbox api를 활용하기 위한 request option 값을 리턴
     * @param optionName
     * @param optionFileName
     * @returns {{}}
     */
    function getOption(optionName, optionFileName) {
        var optionOfMeta = {
            hostname: 'api.dropboxapi.com',
            path: '/2/files/get_metadata',
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        var optionsForDownloadMd = {
            hostname: 'content.dropboxapi.com',
            path: '/2/files/download',
            port: 443,
            method: 'POST',
            headers: {
                'Dropbox-API-Arg': '{"path":"/abc"}'
            }
        }
        var option = {}

        if (optionName == 'getMetaData') {
            addAuthorizationToHeader(optionOfMeta, resource.accessTocken)
            option = optionOfMeta
        } else if (optionName == 'downloadMarkDown') {
            optionsForDownloadMd.headers['Dropbox-API-Arg'] = makePathJsonString(optionFileName);
            option = optionsForDownloadMd
        } else {
            throw Error(optionName+' is not exist option')
        }

        addAuthorizationToHeader(option, resource.accessTocken)
        return option
    }

    return {
        getMetaData : function (filename) {

            return new Promise((fulfil, reject) => {

                var metaReq = https.request(getOption('getMetaData'), function (resForMeta) {
                    resForMeta.on('data', function (val) {
                        var json = JSON.parse(val)

                        if (json['error']) {
                            reject(Error(json['error_summary'].replace('/',' ')))
                        } else {
                            console.log("get meta done")
                            fulfil(json);
                        }

                    });
                })
                metaReq.write(makePathJsonString(filename))
                metaReq.end()
            })
        },
        downMarkDown : function promiseDownMarkDown(filename) {
            return new Promise(function (fulfil) {
                https.request(getOption('downloadMarkDown', filename), function (resForDown) {
                    resForDown.on('data', function (downData) {
                        console.log("get down done")
                        fulfil(downData + "")
                    })
                }).end()
            })
        }

    }//end dropbox obj
}










