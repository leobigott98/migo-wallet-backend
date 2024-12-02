const axios = require('axios');
const asyncHandler = require('express-async-handler');
const {logEvents} = require('../middleware/logger');
const {getToken} = require('../cache/credicardToken'); 
const {ccrAuthenticate} = require('../auth/serviceAuth/ccrAuth')

const instance = axios.create({
    baseURL: process.env.CREDICARD_URL,
    timeout: 4000
})

//@desc Get Card Info
//@route /bank_card_info
//@access Private
const ccrBankCardInfo = asyncHandler(async(req, res)=>{
    let token = await getToken();
    if(!token){
        token = await ccrAuthenticate();
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
    
    return {status: response.status, data: response.data}
});

const payment = asyncHandler(async(req,res)=>{
    let token = await getToken();
    if(!token){
        token = await ccrAuthenticate();
    }
    const {amount, card_number, expiration_month, expiration_year, holder_name, holder_id_doc, holder_id, card_type, cvc} = req.body

    const data = {
        country: 'VE',
        //reason: '',
        amount: amount,
        currency: 'VES',
        //order_number: ''
        //payer_name: '',
        //payer_email: '',
        //card_bank_code: '',
    }
})

module.exports = {
    ccrBankCardInfo,
    payment
}