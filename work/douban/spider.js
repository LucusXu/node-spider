const moment = require("moment-timezone");
const co = require('co');
const cheerio = require('cheerio');
const urlencode = require('urlencode');
const sync = require('../../lib/sync');
const log = require('../../lib/log');
const crawler = require('../../lib/crawler');
const string = require('../../lib/string');
const util = require('./util');
const env_conf = require('../../env');
const logger = new log('douban');
const work = module.exports = {};
const server = new crawler().set_time_out(30);
const book_tag = require('../../models/book_tag');

work.fetch_tags = function () {
    return sync.job(function* () {
        yield work.get_tags();
    }.bind(this), logger, 'job_tags');
}

work.get_tags = function* () {
    var url = "https://book.douban.com/tag/?view=type&icn=index-sorttags-all"
    console.log(url);
    let html = yield server.fetch(url);
    var $ = cheerio.load(html);
    if ($('div[class="article"]').children('div[class=""]').length == 0) {
        return false;
    }
    var tag_list = [];
    $('div[class="article"]').children('div[class=""]').children('div[class=""]').each(function() {
        let className = $(this).children('a').attr('name');
        $(this).find('td').each(function() {
            let tag = $(this).children('a').text()
            let number = $(this).children('b').text()
            let sum = number.replace('(', '')
            sum = sum.replace(')', '')
            // 写库
            var nurl = 'https://book.douban.com/tag/' + urlencode(tag)
            var tag_info = {
                "tag" : tag,
                "classify" : className,
                "sum" : Number(sum),
                "site" : "douban",
                "url" : nurl,
            }
            tag_list.push(tag_info);
        });
    });
    for (let info of tag_list) {
        console.log(info)
        let result = yield sync.do(book_tag, info);
    }
}
