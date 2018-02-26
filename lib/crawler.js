'use strict';
const fs = require('fs');
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const request = require('request');
const needle = require('needle');
const iconv = require('iconv-lite');
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const assert = require('assert');
const log = require('./log');
const logger = new log("crawler", false);
const agent = require('../conf/agent');

class crawler {
    constructor() {
        this.agent = agent;
        this.encoding = 'utf8';
        this.cookies = {};
        this.options = this.init_options();
    }

    init_options() {
        let index = Math.floor(Math.random() * agent.length);
        let option = {
            method: 'GET',
            encoding: null,
            headers: {
                'User-Agent': agent[index],
            },
            timeout: 60 * 1000
        };
        return option;
    }

    set_method(value) {
        this.options['method'] = value;
        return this;
    }

    set_form(value) {
        this.options['form'] = value;
        return this;
    }

    set_url(value) {
        this.options['url'] = value;
        return this;
    }

    set_proxy(value) {
        this.options['proxy'] = value;
        return this;
    }

    set_time_out(value) {
        this.options['timeout'] = value * 1000;
        return this;
    }

    set_user_agent(value) {
        this.options['headers']['User-Agent'] = value;
        return this;
    }

    set_referer(value) {
        this.options['headers']['Referer'] = value;
        return this;
    }

    set_encoding(value) {
        this.encoding = value;
        return this;
    }

    set_header(key, value) {
        this.options['headers'][key] = value;
        return this;
    }

    set_agent(type) {
        return this;
    }

    set_cookie(key, value) {
        this.cookies[key] = value;
        return this;
    }

    head(path) {
        let options = {
            timeout: 60 * 1000
        }
        if (this.options.proxy) {
            options.proxy = this.options.proxy;
        }
        return new Promise(function (resolve, reject) {
            request.head(path, options, function (err, response, body) {
                if (err) {
                    logger.custom("request异常[" + this.options.proxy + "][" + url + "]:" + err.message);
                    resolve(null);
                } else if (response && response.statusCode && response.statusCode == 200) {
                    resolve(response.headers);
                } else {
                    logger.custom("获取数据异常[" + response.statusCode + "][" + url + "]");
                    resolve(null);
                }
            }.bind(this));
        }.bind(this));
    }

    get(path) {
        let info = url.parse(path);
        if (!info || !info.protocol) {
            logger.custom("url格式异常" + path);
            return '';
        }
        let index = Math.floor(Math.random() * agent.length);
        this.set_user_agent(agent[index]);
        let options = {};
        if (this.options.proxy) {
            let proxy_info = url.parse(this.options.proxy);
            options = {
                'hostname': proxy_info.hostname,
                'port': proxy_info.port,
                'method': this.options.method,
                'path': path,
                'headers': this.options.headers,
                'timeout': this.options.timeout,
            };
        } else {
            options = {
                'hostname': info.hostname,
                'method': this.options.method,
                'path': info.path,
                'headers': this.options.headers,
                'timeout': this.options.timeout,
            };
        }
        if (this.options.proxy || info.protocol == 'http:') {
            return new Promise(function (resolve, reject) {
                let request = http.request(options, function (response) {
                    if (this.options.proxy) {
                        proxy_logger.custom(`代理请求记录：[${this.options.proxy}][${response.statusCode}][${path}]`);
                    }
                    if (response.statusCode != 200) {
                        logger.custom(`请求异常[${response.statusCode}][${path}]: ${JSON.stringify(response.headers)}`);
                        resolve('');
                    }
                    let rawData = '';
                    response.on('data', function (chunk) {
                        rawData += chunk;
                    });
                    response.on('end', function () {
                        let body = '';
                        if (this.encoding != 'utf8') {
                            body = iconv.decode(rawData, this.encoding);
                        } else {
                            body = rawData.toString('utf8');
                        }
                        resolve(body);
                    }.bind(this));
                }.bind(this));
                request.on('error', function (e) {
                    logger.custom(`请求遇到问题[${e.message}]:${JSON.stringify(options)}`);
                    resolve('');
                }.bind(this));
                request.end();
            }.bind(this));
        }
        else if (info.protocol == 'https:') {
            return new Promise(function (resolve, reject) {
                let request = https.request(options, function (response) {
                    if (response.statusCode != 200) {
                        logger.custom(`请求异常[${response.statusCode}][${path}]`);
                        resolve('');
                    }
                    let rawData = '';
                    response.on('data', function (chunk) {
                        rawData += chunk;
                    });
                    response.on('end', function () {
                        let body = '';
                        if (this.encoding != 'utf8') {
                            body = iconv.decode(rawData, this.encoding);
                        } else {
                            body = rawData.toString('utf8');
                        }
                        resolve(body);
                    }.bind(this));
                }.bind(this));
                request.on('error', function (e) {
                    logger.custom(`请求遇到问题[${e.message}]:${JSON.stringify(options)}`);
                    resolve('');
                }.bind(this));
                request.end();
            }.bind(this));
        }
    }

    post(path, body) {
        let info = url.parse(path);
        if (!info || !info.protocol) {
            logger.custom("url格式异常" + path);
            return '';
        }
        this.set_method('POST')
        let index = Math.floor(Math.random() * agent.length);
        this.set_user_agent(agent[index]);
        let data = require('querystring').stringify(body);
        this.set_header('Content-Type', 'application/x-www-form-urlencoded');
        this.set_header('Content-Length', data.length);
        let options = {};
        if (this.options.proxy) {
            let proxy_info = url.parse(this.options.proxy);
            options = {
                'hostname': proxy_info.hostname,
                'port': proxy_info.port,
                'method': this.options.method,
                'path': path,
                'headers': this.options.headers,
                'timeout': this.options.timeout,
            };
        } else {
            options = {
                'hostname': info.hostname,
                'method': this.options.method,
                'path': info.path,
                'headers': this.options.headers,
                'timeout': this.options.timeout,
            };
        }
        if (this.options.proxy || info.protocol == 'http:') {
            return new Promise(function (resolve, reject) {
                let request = http.request(options, function (response) {
                    if (response.statusCode != 200) {
                        logger.custom(`请求异常[${response.statusCode}][${path}]: ${JSON.stringify(response.headers)}`);
                        resolve('');
                    }
                    let rawData = '';
                    response.on('data', function (chunk) {
                        rawData += chunk;
                    });
                    response.on('end', function () {
                        let body = '';
                        if (this.encoding != 'utf8') {
                            body = iconv.decode(rawData, this.encoding);
                        } else {
                            body = rawData.toString('utf8');
                        }
                        resolve(body);
                    }.bind(this));
                }.bind(this));
                request.on('error', function (e) {
                    logger.custom(`请求遇到问题[${e.message}]:${JSON.stringify(options)}`);
                    resolve('');
                });
                request.write(data + "\n");
                request.end();
            }.bind(this));
        }
        else if (info.protocol == 'https:') {
            return new Promise(function (resolve, reject) {
                let request = https.request(options, function (response) {
                    if (response.statusCode != 200) {
                        logger.custom(`请求异常[${response.statusCode}][${path}]`);
                        resolve('');
                    }
                    let rawData = '';
                    response.on('data', function (chunk) {
                        rawData += chunk;
                    });
                    response.on('end', function () {
                        let body = '';
                        if (this.encoding != 'utf8') {
                            body = iconv.decode(rawData, this.encoding);
                        } else {
                            body = rawData.toString('utf8');
                        }
                        resolve(body);
                    }.bind(this));
                }.bind(this));
                request.on('error', function (e) {
                    logger.custom(`请求遇到问题[${e.message}]:${JSON.stringify(options)}`);
                    resolve('');
                });
                request.write(data + "\n");
                request.end();
            }.bind(this));
        }
    }

    trace(path) {
        let info = url.parse(path);
        let options = {
            'hostname': info.hostname,
            'port': info.port,
            'method': 'GET',
            'path': path,
            'timeout': 10000,
        };
        return new Promise(function (resolve, reject) {
            let request = http.request(options, function (response) {
                resolve(response.statusCode);
            }.bind(this));
            request.on('error', function (e) {
                logger.custom(`请求遇到问题[${path}][${e.message}]`);
                resolve('');
            });
            request.end();
        }.bind(this));
    }

    fetch(url, _agent) {
        let index = Math.floor(Math.random() * agent.length);
        if (_agent) {
            this.set_user_agent(_agent);
        } else {
            this.set_user_agent(agent[index]);
        }
        this.set_url(encodeURI(url));
        return new Promise(function (resolve, reject) {
            request(this.options, function (err, response, body) {
                if (err) {
                    logger.custom("request异常[" + this.options.proxy + "][" + url + "]:" + err.message);
                    resolve('');
                } else if (response && response.statusCode && response.statusCode == 200) {
                    if (this.encoding != 'utf8') {
                        body = iconv.decode(body, this.encoding);
                    } else {
                        body = body.toString('utf8');
                    }
                    resolve(body);
                } else {
                    logger.custom("获取数据异常[" + response.statusCode + "][" + url + "]");
                    resolve('');
                }
            }.bind(this));
        }.bind(this));
    }

    send(url, body) {
        let index = Math.floor(Math.random() * agent.length);
        this.set_user_agent(agent[index]);
        this.set_method('POST')
            this.set_url(encodeURI(url));
        this.set_form(body);
        return new Promise(function (resolve, reject) {
            request(this.options, function (err, response, body) {
                if (err) {
                    logger.custom("request异常[" + this.options.proxy + "][" + url + "]:" + err.message);
                    resolve('');
                } else if (response && response.statusCode && response.statusCode == 200) {
                    if (this.encoding != 'utf8') {
                        body = iconv.decode(body, this.encoding);
                    } else {
                        body = body.toString('utf8');
                    }
                    resolve(body);
                } else {
                    logger.custom("获取数据异常[" + response.statusCode + "][" + url + "]");
                    resolve('');
                }
            }.bind(this));
        }.bind(this));
    }

    check_status(url) {
        this.set_url(url);
        return new Promise(function (resolve, reject) {
            request(this.options, function callback(error, response, body) {
                if (error) {
                    if (error.code === 'ETIMEDOUT') {
                        resolve('');
                    } else {
                        resolve(error.code);
                    }
                }
                if (response && response.statusCode) {
                    resolve(response.statusCode);
                }
            }.bind(this))
        }.bind(this));
    }

    get_xml_data(url, attr) {
        let option = {
            explicitArray: false,
            ignoreAttrs: attr ? false :true
        }
        return new Promise(function (resolve, reject) {
            this.fetch(url).then(function (xml) {
                xml2js.parseString(xml, option, function (err, result) {
                    if (err) {
                        this.logger.custom("xml解析异常:" + url);
                        resolve({});
                    } else {
                        resolve(result);
                    }
                }.bind(this));
            }.bind(this)).catch(function (err) {
                this.logger.custom("request异常:" + err.message);
                resolve({});
            }.bind(this));
        }.bind(this));
    }

    needle(url, body) {
        let options = {
            parse_response: false,
            open_timeout: this.options.timeout,
            follow_max: 2,
            follow_set_cookies:true,
            cookies: this.cookies,
            headers: this.options.headers
        }
        if(this.options.proxy) {
            options.proxy = this.options.proxy;
        }
        return new Promise(function (resolve, reject) {
            needle(this.options.method, url, body, options).then(function (response) {
                if (response.statusCode == 200) {
                    resolve(response.body.toString('utf8'));
                } else {
                    needle_logger.custom("needle获取数据异常[" + url + "][" + response.statusCode + "]");
                    needle_logger.custom(JSON.stringify(response.cookies));
                    needle_logger.custom(JSON.stringify(options));
                    resolve('');
                }
            }).catch(function (err) {
                needle_logger.custom("needle异常[" + url + "][" + err.message + "]");
                needle_logger.custom(JSON.stringify(options));
                resolve('');
            })
        }.bind(this));
    }

    get_cookie(url) {
        let options = {
            parse_response: false,
            open_timeout: this.options.timeout,
            follow_max: 2,
            follow_set_cookies:true,
            cookies: this.cookies,
            headers: this.options.headers
        }
        return new Promise(function (resolve, reject) {
            needle(this.options.method, url,{}, options).then(function (response) {
                resolve(response.cookies);
            }).catch(function (err) {
                needle_logger.custom("needle异常[" + url + "][" + err.message + "]");
                needle_logger.custom(JSON.stringify(options));
                resolve(null);
            })
        }.bind(this));
    }

    get_file(url, file_path) {
        let options = {
            timeout: 60 * 1000
        }
        if(this.options.proxy) {
            options.proxy = this.options.proxy;
        }
        return new Promise(function (resolve, reject) {
            request.get(url, options).pipe(fs.createWriteStream(file_path)).on('response', function(response) {
                if (response && response.statusCode && response.statusCode != 200) {
                    logger.custom("下载文件异常[" + url + "]:" + response.statusCode);
                    resolve(false);
                }
            }).on('close', function () {
                resolve(true);
            }).on('error', function(err) {
                logger.custom("下载文件异常[" + url + "]:" + err.message);
                resolve(false);
            })
        }.bind(this));
    }
}

module.exports = crawler;
