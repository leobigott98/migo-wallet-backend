const {client} = require('../config/redisConn');

const saveCCRToken = async(token, expiration)=>{
    try{
        await client.set('ccr_auth_token', token, { EX: expiration});
        console.log('CCR Token stored in Redis with expiration');
    }catch(err){
        console.log(`Error storing CCR token in Redis: ${err}`);
        logEvents(`Error storing CCR token in Redis: ${err}`, 'errLog.log');
    }
};

const getToken = async()=>{
    try{
        const token = await client.get('ccr_auth_token');
        if(token){
            return token;
        }else{
            //Token expired or not found; handle re-authentication
            console.log('CCR Token expired, re-authenticating...');
        }
    }catch(err){
        console.log('Error retrieving from Redis:', err);
        logEvents(`Error retrieving from Redis: ${err}`, errLog.log);
    }
}

module.exports = {saveCCRToken, getToken}





