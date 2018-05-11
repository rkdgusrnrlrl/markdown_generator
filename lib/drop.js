/**
 * Created by khk on 2016-04-12.
 */
'use strict';
const resource = require('../resource/resource.json');
const rq = require('request-promise-native');

module.exports = function () {
    /**
     * header에 Authorization 값 세팅
     * @param option
     */
    function setApiKeyInHeader(option) {
        option['headers']['Authorization'] = `Bearer ${resource.accessTocken}`
    }

    return {
        getMetaData : (filename) => {
            return rq.post({
                url : 'https://api.dropboxapi.com/2/files/get_metadata',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization' : `Bearer ${resource.accessTocken}`
                },
                body : { path : `${filename}` },
                json : true
            });
        },
        downMarkDown : (filename) => {
            return rq.post({
                url: 'https://content.dropboxapi.com/2/files/download',
                headers: {
                    'Authorization' : `Bearer ${resource.accessTocken}`,
                    'Dropbox-API-Arg': `{"path" : "${filename}"}`
                }
            });
        },
        addAuthorizationToHeader : setApiKeyInHeader,
        getAllFileList : () => {
            return rq.post({
                url : 'https://api.dropboxapi.com/2/files/list_folder',
                headers: {
                    'Authorization' : `Bearer ${resource.accessTocken}`,
                    'Content-Type': 'application/json'
                },
                body : { path : "" },
                json : true
            });
        }
    };//end dropbox obj
};










