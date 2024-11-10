const redis = require('redis');
const {logEvents} = require('../middleware/logger');

const client = redis.createClient({ 
    url: process.env.REDIS_URL,
}); //create client

// Handle connection events
client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err)=>{
    console.error('Redis Client Error', err);
    logEvents(`Redis Client Error: ${err}`,'errLog.log')
}); //log errors

client.on('end', async () => {
    console.log('Redis connection closed, attempting to reconnect...');
    initializeRedis();
});

async function initializeRedis(){
    try{
        if (!client.isOpen) {
            await client.connect();
            console.log("Redis connected successfully.")
        }   
    }catch(error){
        console.error("Error connecting to Redis:", error);
    }
}

initializeRedis();  // Initialize Redis connection once at startup

const savePMToken = async(token)=>{
    try{
        await client.set('pm_auth_token', token, { EX: 3600});
        console.log('Token stored in Redis with expiration');
    }catch(err){
        console.log(`Error storing token in Redis: ${err}`);
        logEvents(`Error storing token in Redis: ${err}`, 'errLog.log');
    }
};

const getToken = async()=>{
    try{
        const token = await client.get('pm_auth_token');
        if(token){
            return token;
        }else{
            //Token expired or not found; handle re-authentication
            console.log('Token expired, re-authenticating...');
        }
    }catch(err){
        console.log('Error retrieving from Redis:', err);
        logEvents(`Error retrieving from Redis: ${err}`, errLog.log);
    }
}

process.on('SIGINT', async () => {
    await client.quit();
    console.log('Redis connection closed');
    process.exit(0);
});

module.exports = {savePMToken, getToken}





