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
const bookworm = require('../../models/bookworm');

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

work.fetch_books = function () {
    return sync.job(function* () {
        let tag_infos = yield util.readDoubanTags();
        for (let one of tag_infos) {
            console.log(one.url);
            yield work.fetch_list_books(one);
            break;
        }
    }.bind(this), logger, 'job_tags');
}

work.fetch_list_books = function* (info) {
    var url = info.url;
    console.log(url);
    let html = yield server.fetch(url);
    var $ = cheerio.load(html);
    if ($('ul[class="subject-list"]').children('li[class="subject-item"]').length == 0) {
        return false;
    }
    var book_info_list = [];
    $('ul[class="subject-list"]').children('li[class="subject-item"]').each(function() {
        let pic_url = string.trim($(this).children('div[class="pic"]').children('a').children('img').attr('src'));
        console.log(pic_url);
        let title = string.trim($(this).children('div[class="info"]').children('h2').children('a').attr('title'));
        console.log(title);
        let author = string.trim($(this).children('div[class="info"]').children('div[class="pub"]').text());
        author = author.split('/')[0];
        console.log(author);

        let star = $(this).children('div[class="info"]').children('div').children('span[class="rating_nums"]').text();
        star = Number(star) * 10;
        console.log(star);

        let comment_count = string.trim($(this).children('div[class="info"]').find('span[class="pl"]').text());
        comment_count = comment_count.replace('(', '')
        comment_count = comment_count.replace(')', '')
        comment_count = comment_count.replace('人评价', '')
        comment_count = Number(comment_count) + parseInt(Math.random() * 10);
        console.log(comment_count);

        let summary = string.trim($(this).children('div[class="info"]').children('p').text());
        console.log(summary);

        // 写库
        var book_info = {
            "title" : title,
            "author" : author,
            "score" : star,
            "summary" : summary,
            "thumb" : pic_url,
            "view_cnt" : comment_count,
            "comment_cnt" : comment_count,
            "tag" : info.tag,
            "classify" : info.classify,
        }
        book_info_list.push(book_info);
    });

    for (let info of book_info_list) {
        console.log(info)
        let result = yield sync.do(bookworm, info);
    }
}
