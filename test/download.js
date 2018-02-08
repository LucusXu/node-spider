var request = require('request');
var cheerio = require('cheerio');
const moment = require("moment-timezone");
const string = require('../lib/string');

function download(url, callback) {
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            if ($('div[class="article"]').children('div[class=""]').length == 0) {
                callback(false);
            }
            var tag_list = [];
            $('div[class="article"]').children('div[class=""]').children('div[class=""]').each(function() {
                let className = $(this).children('a').attr('name');
                console.log(className)
                tag_list.push(className);
                $(this).find('td').each(function() {
                    let tag = $(this).children('a').text()
                    let number = $(this).children('b').text()
                    number = number.replace('(', '')
                    number = number.replace(')', '')
                    console.log("tag: " + tag + " " + number)
                });
            });
            callback(tag_list);
        } else {
            callback(false);
        }
    });
}

var url = "https://book.douban.com/tag/?view=type&icn=index-sorttags-all"
download(url, function(tag_list){
    if (!tag_list) {
        console.log("\033[31m[failed hub:]\033[0m " + url);
    } else {
        console.log("\033[01;32m[success hub:]\033[00m " + url);
        for (let j = 0; j < tag_list.length; j++) {
            console.log(tag_list[j]);
        }
    };
});
