const {client} = require('../config/redisConn');

const saveMSALToken = async(token)=>{
    try{
        await client.set('msal_auth_token', token, { EX: 1800});
        console.log('MSAL Token stored in Redis with expiration');
    }catch(err){
        console.log(`Error storing MSAL token in Redis: ${err}`);
        logEvents(`Error storing MSAL token in Redis: ${err}`, 'errLog.log');
    }
};

const getToken = async()=>{
    try{
        const token = await client.get('msal_auth_token');
        if(token){
            return token;
        }else{
            //Token expired or not found; handle re-authentication
            console.log('MSAL Token expired, re-authenticating...');
            return null;
        }
    }catch(err){
        console.log('Error retrieving from Redis:', err);
        logEvents(`Error retrieving from Redis: ${err}`, errLog.log);
        return null;
    }
}

module.exports = {saveMSALToken, getToken}