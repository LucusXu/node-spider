"use strict";
const co = require('co');
const async = require('async');
class dispatch {
    static *map(mission, worker) {
        return new Promise(function(resolve, reject) {
            async.map(mission, function(task, callback) {
                co(function*() {
                    return yield worker(task);
                }).then(function(result) {
                    callback(null, result);
                }, function(err) {
                    callback(err, null);
                });
            }, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static *parallel(mission, worker, thread) {
        if (!thread) {
            thread = 10
        }
        return new Promise(function(resolve, reject) {
            async.mapLimit(mission, thread, function(task, callback) {
                co(function*() {
                    return yield worker(task);
                }).then(function(result) {
                    callback(null, result);
                }, function(err) {
                    callback(err, null);
                });
            }, function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    static wait(second){
        return new Promise(function(resolve, reject) {
            let t = setTimeout(function() {
                resolve(true);
                clearTimeout(t);
            }, second * 1000);
        });
    }
}

module.exports = dispatch;
