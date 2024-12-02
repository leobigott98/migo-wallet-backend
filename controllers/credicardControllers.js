const axios = require('axios');
const asyncHandler = require('express-async-handler');
const {ccrBankCardInfo} = require('../services/credicardService');

//@desc Get Card Info
//@route /bank_card_info
//@access Private
const getBankCardInfo = asyncHandler(async(req,res)=>{

    const response = await ccrBankCardInfo(req, res);

    if(response.status == 200){
        res.status(200).json({message: "success", data: response.data})
    }
});

/* const payment = asyncHandler(async(req,res)=>{
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
}) */

module.exports = {
    getBankCardInfo,
    //payment
}