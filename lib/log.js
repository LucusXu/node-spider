"use strict"
const path = require('path');
const fs = require('fs');
const moment = require("moment");
const config = require('../env');

class log {
    constructor(topic, is_debug) {
        this.log_root = config['logs_root'];
        if (is_debug == null) {
            this.is_debug = config['debug'];
        } else {
            this.is_debug = is_debug;
        }
        if (topic) {
            this.topic = topic;
        } else {
            this.topic = 'common'
        }
    }

    get_log_path(tag) {
        let log_path = path.join(this.log_root, tag);
        if (!fs.existsSync(log_path)) {
            fs.mkdirSync(log_path, "0777");
        }
        return log_path;
    }

    format_message(message) {
        if (!message) {
            message = '';
        }
        return "[" + moment().format("YYYY-MM-DD HH:mm:ss") + "] - " + message;
    }

    debug(message) {
        if (!this.is_debug) {
            return;
        }
        this.write(this.get_log_path("debug"), message);
    }

    info(message) {
        this.write(this.get_log_path("info"), message);
    }

    warn(message) {
        this.write(this.get_log_path("warn"), message);
    }

    error(message) {
        this.write(this.get_log_path("error"), message);
    }

    custom(message,tag) {
        if (!tag) {
            tag = this.topic;
        }
        this.write(this.get_log_path(tag), message);
    }

    log(message) {
        console.log(message);
        this.write(this.get_log_path(this.topic), message);
    }

    write(log_path,message) {
        message = this.format_message(message);
        if (this.is_debug) {
            console.info(message);
        }
        let file_name = path.join(log_path, moment().format("YYYYMMDD") + ".txt");
        var fd = fs.openSync(file_name, "a+");
        try {
            fs.appendFileSync(fd, message + "\r\n",{
                encoding: 'utf-8',
            });
        } finally {
            fs.closeSync(fd);
        }
    }
}

module.exports = log;
