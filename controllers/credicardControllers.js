const axios = require('axios');
const asyncHandler = require('express-async-handler');
const {logEvents} = require('../middleware/logger');
const {saveCCRToken, getToken} = require('../cache/credicardToken'); 

const instance = axios.create({
    baseURL: process.env.CREDICARD_URL,
    timeout: 4000
})

//@desc Authenticate with Credicard
const authenticate = asyncHandler(async()=>{
    console.log('attempting CCR authentication');
    const data = {
        grant_type: process.env.CCR_GRANT_TYPE
    };
    const urlEncoded = new URLSearchParams(Object.entries(data)).toString();
    console.log(process.env.CREDICARD_URL + process.env.CCR_TOKEN_URL)
    
    try{
        const response = await instance.post(process.env.CCR_TOKEN_URL, urlEncoded, {
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
        logEvents(`Error authenticating with Pago Movil: ${err}`, 'credicardErrorLog.log')
        console.log('There was an error authenticating with Credicard')
    }
});

//@desc Get Card Info
//@route /bank_card_info
//@access Private
const getBankCardInfo = asyncHandler(async(req,res)=>{
    let token = await getToken();
    if(!token){
        token = await authenticate();
    }

    const {card_number} = req.body
    const data = card_number
    const response = await instance.post(process.env.CCR_BANK_CARD_INFO_URL, data, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain' 
        },
        params: {
            country: "VE"
        }
    })
    //log the response
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.CCR_BANK_CARD_INFO_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'credicardLog.log')
    
    if(response.status == 200){
        res.status(200).json({message: "success", data: response.data})
    }
});


module.exports = {
    getBankCardInfo
}