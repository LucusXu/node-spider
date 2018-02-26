const moment = require("moment-timezone");
const urlencode = require('urlencode');
const sync = require('../../lib/sync');
const log = require('../../lib/log');
const string = require('../../lib/string');
const logger = new log('douban');
const util = module.exports = {};

util.insertTag = function* (className, tag, sum) {
    var url = 'https://book.douban.com/tag/' + urlencode(tag)
    console.log(url);
    var tag_info = {
        "tag" : tag,
        "classify" : className,
        "sum" : Number(sum),
        "site" : "douban",
        "url" : url,
    }
    console.log(tag_info)
    let result = yield sync.create(book_tag, tag_info);
}
