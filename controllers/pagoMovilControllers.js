const axios = require('axios');
const asyncHandler = require('express-async-handler');
const {queryPaymentB2P, C2P, sendPaymentB2P} = require('../services/pagoMovilService');
const {topUpWallet, withdrawFunds} = require('../services/walletService');

const instance = axios.create({
    baseURL: process.env.BANK_URL,
    timeout: 40000,
})

// @desc Gets bank list
// @route GET /listarBancos
// @access Private
const getAllBanks = asyncHandler(async(req, res)=>{
    let token = await getToken();
    if(!token){
        token = await authenticate();
    }

    const data = {
        requestListar: {
            canal: 1,
            identificadorExterno: token,
            terminal: process.env.PM_LISTARBANCOS_TERMINAL,
            tipoLista: process.env.PM_LISTARBANCOS_TIPOLISTA
        }
    }
    const response = await instance.post(process.env.PM_LISTARBANCOS_URL, data, {
        headers: {
            'Authorization': `Bearer ${token}` 
        }
    })
    //log the response
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.PM_LISTARBANCOS_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'pagoMovilLog.log')
    
    if(response.status == 200){
        res.status(200).json({message: "success", data: response.data.Envelope.Body.listarBancosApiResponse.out.listaBancosC2p.BancoC2PBean})
    }
})

//@desc Top Up with Pago Movil B2P
const topUpB2P = asyncHandler(async(req, res)=>{
    const pmResponse = await queryPaymentB2P(req);
    if(pmResponse){
        const dbResponse = await topUpWallet(req.body.walletID, pmResponse.monto, 'PAGO MOVIL B2P', req.dateTime);
        if(dbResponse){
            res.status(200).send({message: 'success', data: dbResponse})
        }
    }
});

//@desc Top Up with Pago Movil C2P
const topUpC2P = asyncHandler(async(req, res)=>{
    const pmResponse = await C2P(req);
    if(pmResponse.codigoError === 0){
        const dbResponse = await topUpWallet(req.body.walletID, req.body.monto, 'PAGO MOVIL C2P', req.dateTime);
        if(dbResponse){
            res.status(200).send({message: 'success', data: dbResponse})
        }else{
            res.status(400).send({message: 'Ocurrió en error en la recarga. Contacte a soporte', data: null})
        }
    }else{
        res.status(400).send({message: 'Ocurrió un error en la recarga', data: null})
    }
});

//@desc Top Up with Pago Movil B2P
const withdrawB2P = asyncHandler(async(req, res)=>{
    const pmResponse = await sendPaymentB2P(req);
    if(pmResponse){
        const dbResponse = await withdrawFunds(req.body.walletID, req.body.monto, 'PAGO MOVIL B2P', req.dateTime);
        if(dbResponse){
            res.status(200).send({message: 'success', data: dbResponse})
        }
    }
});


module.exports = {
    topUpB2P,
    topUpC2P,
    withdrawB2P,
    getAllBanks
}  