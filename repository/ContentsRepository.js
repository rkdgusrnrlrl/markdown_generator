const dropbox = require('../lib/drop')();
const util = require('../lib/util');

let markDownDatas = {};


/**
 * md 파일을 DB 에 저장하고 md 파일 내용을 리턴
 * @param jsonMeta
 * @param markdownContents
 * @returns {string}
 */
const saveMdFile = (jsonMeta, markdownContents) => {
    markDownDatas[jsonMeta.name] = {
        name: jsonMeta.name,
        rev: jsonMeta.rev,
        contents: markdownContents
    };
    return markdownContents;
};


/**
 * 해당 파일이 DB에 없거나, DB 에 있는 파일이 최신이지 확인
 * @param jsonData
 * @returns {boolean}
 */
const isExsitAndIsSameVer = (jsonData) => {
    return markDownDatas[jsonData.name] == null
        || markDownDatas[jsonData.name].rev !== jsonData.rev;
};


/**
 * 파을일 다운 로드 한뒤  save 하고, 파일 내용을 리턴함
 * @param fileMetaData
 * @returns {Promise<string>}
 */
const downloadAndSaveFile = (fileMetaData) => {
    if (fileMetaData.size === 0) {
        return saveMdFile(fileMetaData, "", markDownDatas)
    } else {
        const encFileName = util.unicodeEscape("/" + fileMetaData.name);
        return dropbox.downMarkDown(encFileName)
            .then((markdownfile) => {
                return saveMdFile(fileMetaData, markdownfile, markDownDatas)
            });
    }
};


/**
 * @param fileMetaData json 형태의 메타 데이터 파일
 * @returns string
 */
const getMdContents = (fileMetaData) => {
    return markDownDatas[fileMetaData.name].contents;
};


/**
 * 모든 컨텐츠 목록을 가져옴
 * @returns {Promise<array>}
 */
exports.getAllContentsList = () => {
    return dropbox.getAllFileList().then(data => data.entries);
};


/**
 * 해당 파일의 마크다운 컨텐츠를 가져옴
 * @param filename
 * @returns {Promise<string>}
 */
exports.getMarkdownContents = async (filename) => {
    const fileMetaData = await dropbox.getMetaData(filename);
    let markdownContents = "";
    if (isExsitAndIsSameVer(fileMetaData)) {
        markdownContents = await downloadAndSaveFile(fileMetaData);
    } else {
        markdownContents = getMdContents(fileMetaData);
    }
    return markdownContents;
};