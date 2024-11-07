//import dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require( 'helmet');
const morgan = require('morgan');
const corsOptions = require('./config/corsOptions');
const path = require('path')
const PORT = process.env.PORT || 3500;
const pool = require('./config/dbConn');
const {logEvents, assignDateTime, assignId} = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const {resBodyFormat, reqResBodyFormat} = require('./config/morganFormats');
const {inReqOptions, getMethodOptions} = require('./config/morganOptions');

//set up express server
const app = express();

//Environment
console.log(process.env.NODE_ENV)

//middleware
app.use(express.json())
app.use(assignDateTime);
app.use(assignId);
app.use(morgan(reqResBodyFormat, inReqOptions));
app.use(morgan(resBodyFormat, getMethodOptions));
app.use(cors(corsOptions));
app.use(helmet());

//public accessed files
app.use('/', express.static(path.join(__dirname, 'public')));

//index
app.use('/', require('./routes/root'));

//404 for all other non-specified routes
app.all('*', (req, res)=>{
    res.status(404);
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')){
        res.json({message: '404 Not Found'});
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);

pool.getConnection((err, connection)=>{
    if(err instanceof Error){
        console.log('pool.getConnection error:', err);
        logEvents(`${err.name}: ${err.code}\t${err.errno}\t${err.message}`, 'MySQLErrLog.log')
        return;
    }
});

pool.addListener("connection", ()=>{
    console.log('Connected to DB');
    app.listen(PORT, ()=>{
        console.log(`Listening on PORT ${PORT}`)
    })
})
