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
const {logEvents, assignDateTime, assignId, setResponseBody} = require('./middleware/logger');
const {reqResBodyFormat, reqBodyFormat} = require('./config/morganFormats');
const {inReqOptions} = require('./config/morganOptions');
const cron = require('node-cron');
const {checkAndRenewSubscription} = require('./services/webhookService');


//set up express server
const app = express();

//Environment
console.log(process.env.NODE_ENV)

//middleware
app.use(express.json())
app.use(assignDateTime);
app.use(assignId);
app.use(setResponseBody);
app.use(morgan('dev'));
app.use(morgan(reqBodyFormat, inReqOptions));
//app.use(morgan(resBodyFormat, getMethodOptions));
app.use(cors(corsOptions));
app.use(helmet());

//// Run subscription check on server startup
(async () => {
    await checkAndRenewSubscription('https://1495-190-216-244-150.ngrok-free.app');
})();

// Schedule the subscription renewal task to run every day at 12:00 AM
cron.schedule('0 0 * * *', async () => { 
    try {
        console.log('Running scheduled subscription renewal...');
        await checkAndRenewSubscription('https://1495-190-216-244-150.ngrok-free.app');
    } catch (error) {
        console.error('Error during scheduled subscription renewal:', error);
    }
});

//public accessed files
app.use('/', express.static(path.join(__dirname, 'public')));

//index
app.use('/', require('./routes/root'));

//pago movil
app.use('/pago-movil', require('./routes/pagoMovilRoutes'));

//credicard
app.use('/credicard', require('./routes/credicardRoutes'));

//outlook webhook
app.use('/webhook', require('./routes/webhookRoutes'));

//monitorBankEmails().catch(console.error);

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

app.use(morgan(reqResBodyFormat, inReqOptions));

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
