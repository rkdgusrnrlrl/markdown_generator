const moment = require('moment');

exports.unicodeEscape = (str) => {
    let result = "";
    for(let i = 0; i < str.length; i++){
        result += "\\u" + ("000" + str[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
};

exports.compareServerDateFunc = (f, s) => {
    // f 가 크면 1, s가 크면 -1 같으면 0
    if (moment(f.server_modified).isSame(s.server_modified, 'day')) return 0;
    if (moment(f.server_modified).isAfter(s.server_modified, 'day')) {
        return -1;
    } else {
        return 1;
    }
};