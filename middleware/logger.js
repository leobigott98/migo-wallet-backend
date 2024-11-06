const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const morgan = require('morgan');

morgan.token('id', function getId(req){
    return req.id
})

morgan.token('date', function getDate(req){
    return  req.dateTime;
})

const logEvents = async (message, logFileName) =>{
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss')
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try{
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))){
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    }   catch(err){
        console.log(err)
    }
}

const inReqLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'inReqLog.log'), { flags: 'a' });

const assignDateTime = (req, res, next)=>{
    req.dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    next();
}

const assignId = (req, res, next)=>{
    req.id = uuid();
    next();
}

module.exports = { logEvents, assignDateTime, assignId, inReqLogStream }