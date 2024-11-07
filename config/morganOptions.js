const fs = require('fs');
const path = require('path');

const pagoMovilLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'pagoMovilLog.log'), { flags: 'a' });

const pagoMovilOptions = {
    skip: function (req, res) {
        return req.hostname != '35ecb.bancaribe.com.ve'
    },
    stream: pagoMovilLogStream
}

const inReqLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'inReqLog.log'), { flags: 'a' });

const inReqOptions = {
    stream: inReqLogStream,
    skip: function (req, res) {
        return req.method == 'GET'
    }
}

const getMethodOptions = {
    skip: function (req, res){
        return req.method != 'GET'
    },
    stream: inReqLogStream,
}

module.exports = {inReqOptions, getMethodOptions, pagoMovilOptions};