/**
 * Created by khk on 2016-04-04.
 */
var https = require('https')
var expect = require('chai').expect

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

//파일 메타 정보 확인을 위한 request option
var optionsForGetMeta = {
    hostname: 'api.dropboxapi.com',
    path: '/2/files/get_metadata',
    port: 443,
    method: 'POST',
    headers: {
        'Authorization': 'Bearer lX5-zkIFJGUAAAAAAAB1v-bmjTXqxmA3ZZ3JZMqwbu9GyHp4SkJiz6zn0t7_q-mk',
        'Content-type' : "application/json"
    }
};



//@todo 프로미스 페턴 익히기
//request 를 이용한
describe("this one will work", function(){
    var jsonStr = "";

    before(function(done){
        var path = {"path": "/documents/markdown/Docker.md" };
        var postData = JSON.stringify(path);


        var metaReq = https.request(optionsForGetMeta, function (resForMeta) {
            resForMeta.on('data', function (data) {
                jsonStr = data+"";
                done();
            });
        });

        metaReq.write(postData);
        metaReq.end();
    });


    it("should pass", function(){
        expect(jsonStr).include("Docker.md")
    });
});


