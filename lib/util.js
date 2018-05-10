
exports.unicodeEscape = (str) => {
    let result = "";
    for(let i = 0; i < str.length; i++){
        result += "\\u" + ("000" + str[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
};