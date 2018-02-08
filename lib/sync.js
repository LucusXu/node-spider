const co = require('co');
const os = require('os');
const moment = require("moment-timezone");
const log = require('./log');
const system = require('./system');
const logger = new log("sync",false);
const sync = module.exports = {};

sync.do = function * (model, info) {
    try {
        let location = {};
        for (let key of model.unique) {
            location[key] = info[key]
        }
        if(!location) {
            throw new Error('location empty');
        }
        let instance = yield model.findOne({
            where: location
        });
        if (!instance) {
            info.created_at = moment().tz("Asia/Shanghai");
            info.updated_at = moment().tz("Asia/Shanghai");
            instance = yield model.create(info);
        } else {
            info.updated_at = moment().tz("Asia/Shanghai");
            let result = yield instance.update(info);
        }
        return instance;
    } catch (err) {
        logger.custom("同步数据异常:" + err.message);
        logger.custom("对象:" + model.getTableName());
        logger.custom("信息:" + JSON.stringify(info));
        return null;
    }
}

sync.create = function * (model, info) {
    try {
        info.created_at = moment().tz("Asia/Shanghai");
        info.updated_at = moment().tz("Asia/Shanghai");
        let instance = yield model.create(info);
        return instance;
    } catch (err) {
        logger.custom("对象:" + model.getTableName());
    }
}

sync.update = function * (instance) {
    try {
        instance.updated_at = moment().tz("Asia/Shanghai");
        yield instance.save();
    } catch (err) {
        logger.custom("信息:" + JSON.stringify(instance.get()));
    }
}

sync.job = function (worker, logger, job_name) {
    if (!logger) {
        logger = new log("sync", false);
    }
    return new Promise(function (resolve, reject) {
        co(function* () {
            logger.custom("任务开始");
            yield worker();
        }).then(function (result) {
            logger.custom("任务结束");
            resolve(true);
        }, function (err) {
            logger.custom("任务异常退出！");
            logger.custom(err.stack ? err.stack : err.message);
            logger.custom(err.message);
            if(job_name) {
                co(function* () {
                    let ip = system.get_ip();
                    let title = '【' + ip + '】异常退出提醒:' + job_name;
                    let message = '';
                    message += job_name + "异常退出";
                    message += "<br/>";
                    message += err.stack ? err.stack : err.message;
                    message = message.replace(/\n/g,'<br/>');
                }).then(function (result) {
                    return;
                }, function (err) {
                    logger.custom("退出清理工作异常:" + err.message);
                    return;
                });
            }
            resolve(false);
        });
    });
}

sync.error_exit = function (process_name, error) {
    let logger = new log("sync", false);
    co(function* () {
        logger.custom(process_name + "异常");
        logger.custom(error.stack ? error.stack : error.message);
        logger.custom(error.message);
    }).then(function (result) {
        logger.custom("任务异常:" + process_name);
        return;
    }, function (err) {
        logger.custom("退出清理工作异常:" + err.message);
        return;
    });
}
