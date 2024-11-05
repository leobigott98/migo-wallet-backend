//import dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require( 'helmet');
const corsOptions = require('./config/corsOptions');
const path = require('path')
const PORT = process.env.PORT || 3500;
const pool = require('./config/dbConn');

//set up express server
const app = express();

//middleware
app.use(helmet());
app.use(cors(corsOptions));

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

pool.getConnection((err, connection)=>{
    if(err instanceof Error){
        console.log('pool.getConnection error:', err);
        return;
    }
});

pool.addListener("connection", ()=>{
    console.log('Connected to DB');
    app.listen(PORT, ()=>{
        console.log(`Listening on PORT ${PORT}`)
    })
})
