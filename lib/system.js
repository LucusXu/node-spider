const os = require('os');
const system = module.exports = {};

system.get_ip = function () {
    let map = [];
    let ifaces = os.networkInterfaces();
    if (ifaces['eth0'] && ifaces['eth0'].length > 0) {
        let family = ifaces['eth0'][0]['family'];
        if (family == 'IPv4') {
            return ifaces['eth0'][0]['address'];
        } else {
            return '0.0.0.0';
        }
    } else {
        return '0.0.0.0';
    }
}
