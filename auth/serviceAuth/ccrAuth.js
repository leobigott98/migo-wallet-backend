const asyncHandler = require('express-async-handler');
const {saveCCRToken} = require('../../cache/credicardToken');
const {logEvents} = require('../../middleware/logger');
const axios = require('axios');

//@desc Authenticate with Credicard
const ccrAuthenticate = asyncHandler(async()=>{
    console.log('attempting CCR authentication');
    const data = {
        grant_type: process.env.CCR_GRANT_TYPE
    };
    const urlEncoded = new URLSearchParams(Object.entries(data)).toString();
    
    try{
        const response = await axios.post(process.env.CREDICARD_URL + process.env.CCR_TOKEN_URL, urlEncoded, {
            params:{
                grant_type: process.env.CCR_GRANT_TYPE,
                client_id: process.env.CCR_CLIENT_ID,
                client_secret: process.env.CCR_CLIENT_SECRET
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        console.log('sent ccr auth request');
        console.log(response);
        logEvents(`reqURL: ${process.env.CCR_TOKEN_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'credicardLog.log')
        if(response.status == 200){
            const authToken = response.data.access_token;
            await saveCCRToken(authToken);
            return authToken;
        }
        else throw new Error(`status: ${response.status} \tmessage: ${response.data}`)
    }catch(err){
        logEvents(`Error authenticating with Credicard: ${err}`, 'credicardErrorLog.log')
        console.log('There was an error authenticating with Credicard')
    }
});

module.exports = {ccrAuthenticate}