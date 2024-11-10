const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const morgan = require("morgan");

morgan.token("id", function getId(req) {
  return req.id;
});

morgan.token("date", function getDate(req) {
  return req.dateTime;
});

morgan.token("reqBody", function getReqBody(req, res) {
  return JSON.stringify(req.body);
});

morgan.token('resBody', function (req, res) {
  if (res['statusCode'] != 200) {
      return res['__custombody__'] || null;
  }
  return null;
});

const logEvents = async (message, logFileName) => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, "..", "logs"))) {
      await fsPromises.mkdir(path.join(__dirname, "..", "logs"));
    }
    await fsPromises.appendFile(
      path.join(__dirname, "..", "logs", logFileName),
      logItem
    );
  } catch (err) {
    console.log(err);
  }
};

const assignDateTime = (req, res, next) => {
  req.dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  next();
};

const assignId = (req, res, next) => {
  req.id = uuid();
  next();
};

const setResponseBody = (req, res, next) => {
  const oldWrite = res.write,
      oldEnd = res.end,
      chunks = [];

  res.write = function (chunk) {
      chunks.push(Buffer.from(chunk));
      oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
      if (chunk) {
          chunks.push(Buffer.from(chunk));
      }
      const body = Buffer.concat(chunks).toString('utf8');
      res.__custombody__ = body;
      oldEnd.apply(res, arguments);
  };
  next();
};

module.exports = { logEvents, assignDateTime, assignId, setResponseBody };
