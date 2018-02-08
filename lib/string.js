"use strict";
const moment = require('moment');
const crypto = require('crypto');

// 字符串操作类
class string {
    // 判断字符串是不是中文
    static isChinese(str) {
        if (/^[\u4E00-\u9FA5]+$/.test(str)) {
            return true;
        }
        return false;
    }

    // 判断字符串是否包含中文
    static hasChinses(str) {
        if (/.*[\u4E00-\u9FA5]+.*$/.test(str)) {
            return true;
        }
        return false;
    }

    static English(str) {
        if (/^[A-Za-z0-9:.\-\s]+$/.test(str)) {
            return true;
        }
        return false;
    }

    // 判断字符串是否纯英文
    static PureEnglish(str) {
        if (/^[A-Za-z]+$/.test(str)) {
            return true;
        }
        return false;
    }

    // 判读是否是ip地址
    static IP(ip) {
        let ip_ip = '(25[0-5]|2[0-4]\\d|1\\d\\d|\\d\\d|\\d)';
        let ip_ipdot = ip_ip + '\\.';
        let ip_port = '(:(\\d\\d\\d\\d|\\d\\d\\d|\\d\\d|\\d))?';
        let isIPaddress = new RegExp('^' + ip_ipdot + ip_ipdot + ip_ipdot + ip_ip + ip_port + '$');
        return isIPaddress.test(ip);
    }

    // 判断是否是数字
    static isNumber(str) {
        if (/^[0-9]*$/.test(str)) {
            return true;
        }
        return false;
    }

    // 判断是否是合法url
    static isURL(str) {
        let RegUrl = new RegExp();
        RegUrl.compile("^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$");
        if (!RegUrl.test(str)) {
            return false;
        }
        return true;
    }

    // 字符串比较
    static Compare(str_1, str_2) {
        if (!str_1 || !str_2) {
            return false;
        }
        let info_1 = str_1.toLowerCase().split(" ").sort();
        let info_2 = str_2.toLowerCase().split(" ").sort();
        let new_info_1 = [];
        let new_info_2 = [];
        for (let data of info_1) {
            if (data != 'fc' && data != 'ac' && data != 'if' && data != 'fk') {
                new_info_1.push(data);
            }
        }
        for (let data of info_2) {
            if (data != 'fc' && data != 'ac' && data != 'if' && data != 'fk') {
                new_info_2.push(data);
            }
        }
        info_1 = new_info_1.sort();
        info_2 = new_info_2.sort();
        if (info_1.length != info_2.length) {
            return false;
        }
        for (let index = 0; index < info_1.length; index++) {
            if (info_1[index] != info_2[index]) {
                return false;
            }
        }
        return true;
    }

    // 空格分割后首字母大写
    static ucwords(str) {
        // 转换成小写数组
        let array = str.toLowerCase().split(" ");
        for (let i = 0; i < array.length; i++) {
            // 首字母大写
            array[i] = array[i][0].toUpperCase() + array[i].substring(1, array[i].length);
        }
        let string = array.join(" ");
        return string;
    }

    // 去除html标签
    static trimHtmlTag(msg) {
        var msg = msg.replace(/<\/?[^>]*>/g, ''); //去除HTML Tag
        msg = msg.replace(/[|]*\n/, '') //去除行尾空格
        msg = msg.replace(/&npsp;/ig, ''); //去掉npsp
        return msg;
    }

    // 字符串截取
    static between(str, begin, end) {
        let begin_index = str.indexOf(begin);
        let end_index = str.indexOf(end, begin_index);
        let result = str.substring(begin_index + begin.length, end_index);
        result = string.trimHtmlTag(result);
        result = string.trim(result);
        return result;
    }

    static trim(str) {
        if (!str) {
            return '';
        }
        return str.replace(/(^\s*)|(\s*$)/g, '');
    }

    static ltrim(str) {
        if (!str) {
            return '';
        }
        return str.replace(/(^\s*)/g, '');
    }

    static rtrim(str) {
        if (!str) {
            return '';
        }
        return str.replace(/(\s*$)/g, '');
    }

    static trim_br(str) {
        if (!str) {
            return '';
        }
        return str.replace(/[.\n]+/g, '');
    }

    static md5(str) {
        let md5 = crypto.createHash('md5');
        md5.update(str);
        return md5.digest('hex');
    }

    // 编辑距离
    static editDistance(s1, s2) {
        if (!s1 || !s2) {
            return 99999;
        }
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();
        let len1 = s1.length, len2 = s2.length;
        let d = [];
        let i, j;
        for (i = 0; i <= len1; i++) {
            d[i] = [];
            d[i][0] = i;
        }
        for (j = 0; j <= len2; j++) {
            d[0][j] = j;
        }
        for (i = 1; i <= len1; i++) {
            for(j = 1; j <= len2; j++) {
                let cost = s1[i] == s2[j] ? 0 : 1;
                let deletion = d[i-1][j] + 1; //删除动作
                let insertion = d[i][j-1] + 1; //增加动作
                let substitution = d[i-1][j-1] + cost; //替换字符，如果相同cost=0；不同cost=1
                d[i][j] = Math.min(deletion, insertion, substitution);
            }
        }
        return d[len1][len2];
    }

    // 利用编辑距离计算相似度
    static similarity(str_1, str_2) {
        if (!str_1 || !str_2) {
            return false;
        }
        let info_1 = str_1.toLowerCase().split(" ").sort();
        let info_2 = str_2.toLowerCase().split(" ").sort();
        let new_info_1 = [];
        let new_info_2 = [];
        for (let data of info_1) {
            if (data != 'fc' && data != 'ac' && data != 'afc' && data != 'pfc' && data != 'if' && data != 'fk' && data != 'sk' && data != 'nk' && data != 'nhk') {
                new_info_1.push(data);
            }
        }
        for (let data of info_2) {
            if (data != 'fc' && data != 'ac' && data != 'afc' && data != 'pfc' && data != 'if' && data != 'fk' && data != 'sk' && data != 'nk' && data != 'nhk') {
                new_info_2.push(data);
            }
        }
        info_1 = new_info_1.sort();
        info_2 = new_info_2.sort();
        return string.editDistance(info_1.join(''), info_2.join(''));
    }

    static parseDate(str,format) {
        let timestamp = Date.parse(str);
        if (!timestamp) {
            return null;
        }
        let time = moment(timestamp).format(format);
        return time;
    }

    static number_val(str) {
        let value = parseInt(str);
        return isNaN(value) ? 0 : value;
    }

    static parseSeasonName(season_name) {
        if (season_name.indexOf('/') > 0) {
            let season_name_info = season_name.split('/');
            let min = season_name_info[0];
            let max = season_name_info[1];
            let min_year = min.charAt(0) == '0' || min.charAt(0) == '1' ? '20' + min : '19' + min;
            let max_year = max.charAt(0) == '0' || max.charAt(0) == '1' ? '20' + max : '19' + max;
            return min_year + '/' + max_year;
        } else {
            return season_name;
        }
    }

    // 是否以某些字符结尾
    static endsWith(src, endStr) {
        let d = src.length - endStr.length;
        return (d >= 0 && src.lastIndexOf(endStr) == d)
    }
}

module.exports = string;
