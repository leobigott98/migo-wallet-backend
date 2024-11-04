//import dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require( 'helmet');
const corsOptions = require('./config/corsOptions');
const PORT = process.env.PORT || 3500;

//set up express server
const app = express();

//middleware
app.use(helmet());
app.use(cors(corsOptions))


app.listen(PORT, ()=>{
    console.log(`Server is up and listening on port ${PORT}`);
});

