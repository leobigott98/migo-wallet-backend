const {client} = require('../config/redisConn');

const savePMToken = async(token)=>{
    try{
        await client.set('pm_auth_token', token, { EX: 3600});
        console.log('PM Token stored in Redis with expiration');
    }catch(err){
        console.log(`Error storing PM token in Redis: ${err}`);
        logEvents(`Error storing PM token in Redis: ${err}`, 'errLog.log');
    }
};

const getToken = async()=>{
    try{
        const token = await client.get('pm_auth_token');
        if(token){
            return token;
        }else{
            //Token expired or not found; handle re-authentication
            console.log('PM Token expired, re-authenticating...');
        }
    }catch(err){
        console.log('Error retrieving from Redis:', err);
        logEvents(`Error retrieving from Redis: ${err}`, errLog.log);
    }
}

module.exports = {savePMToken, getToken}





