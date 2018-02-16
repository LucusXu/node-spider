const moment = require("moment-timezone");
const co = require('co');
const urlencode = require('urlencode');
const sync = require('../../lib/sync');
const log = require('../../lib/log');
const string = require('../../lib/string');
const util = require('./util');
const env_conf = require('../../env');
const logger = new log('douban');
const work = module.exports = {};

work.fetch_tags = function () {
    return sync.job(function* () {
        yield work.get_tags();
    }.bind(this), logger, 'job_tags');
}

work.get_tags = function* () {
    var url = "https://book.douban.com/tag/?view=type&icn=index-sorttags-all"
    let html = yield server.fetch(url);
    var $ = cheerio.load(html);
    if ($('div[class="article"]').children('div[class=""]').length == 0) {
        return false;
    }
    var tag_list = [];
    $('div[class="article"]').children('div[class=""]').children('div[class=""]').each(function() {
        let className = $(this).children('a').attr('name');
        console.log(className)
        $(this).find('td').each(function() {
            let tag = $(this).children('a').text()
            let number = $(this).children('b').text()
            sum = sum.replace('(', '')
            sum = sum.replace(')', '')
            // 写库
        });
    });
}

work.insert = function* (className, tag, sum) {
    var url = 'https://book.douban.com/tag/' + urlencode(tag)
    var tag_info = {
        "tag" : tag,
        "classify" : className,
        "sum" : Number(sum),
        "site" : "douban",
        "url" : url,
    }
    let result = yield sync.do(book_tag, tag_info);
}
