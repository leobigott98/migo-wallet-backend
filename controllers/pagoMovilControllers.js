const axios = require('axios');
const asyncHandler = require('express-async-handler');
const {logEvents} = require('../middleware/logger');

var authToken = 'd6b457bb-804a-30d2-a895-84afa09b611a';

const instance = axios.create({
    baseURL: process.env.BANK_URL,
    timeout: 40000,
})

// @desc Authenticates with the bank
// @route GET /token
// @access Private
const getToken = asyncHandler(async (req, res)=>{
    const data = {
        grant_type: 'client_credentials'
    }
    const urlEncoded = new URLSearchParams(Object.entries(data)).toString();
    const response = await instance.post(process.env.PM_TOKEN_URL, urlEncoded, {
        auth: {
            username: process.env.BANK_USERNAME,
            password: process.env.BANK_PASSWORD
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.PM_TOKEN_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'pagoMovilLog.log')
    if(response.status == 200){
        authToken = response.data.access_token;
        res.status(200).json({message: "success", token: authToken})
    }
})

// @desc Gets bank list
// @route GET /listarBancos
// @access Private
const getAllBanks = asyncHandler(async(req, res)=>{
    const data = {
        requestListar: {
            canal: 1,
            identificadorExterno: authToken,
            terminal: process.env.PM_LISTARBANCOS_TERMINAL,
            tipoLista: process.env.PM_LISTARBANCOS_TIPOLISTA
        }
    }
    const response = await instance.post(process.env.PM_LISTARBANCOS_URL, data, {
        headers: {
            'Authorization': `Bearer ${authToken}` 
        }
    })
    //log the response
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.PM_LISTARBANCOS_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'pagoMovilLog.log')
    
    if(response.status == 200){
        res.status(200).json({message: "success", data: response.data.Envelope.Body.listarBancosApiResponse.out.listaBancosC2p.BancoC2PBean})
    }
})

// @desc Authenticates with the bank
// @route GET /token
// @access Private
const queryPaymentB2P = asyncHandler(async (req, res)=>{
    const {ci, tlf, ref, monto, fecha} = req.body
    const data = {
        rif: process.env.PM_PUNTOGO_RIF,
        identificadorPersona: ci,
        telefonoDebito: tlf,
        montoTransaccion: monto,
        referencia: ref,
        factura: null,
        tipoTrx: process.env.PM_QUERYPAYMENTB2P_TIPOTRX,
        fecha: fecha
    }
    const response = await instance.post(process.env.PM_QUERYPAYMENTB2P_URL, data, {
        headers: {
            'Authorization': `Bearer ${authToken}` 
        }
    })
    //log the response
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.PM_QUERYPAYMENTB2P_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'pagoMovilLog.log')

    if(response.status == 200){
        res.status(200).json({message: "success", data: response.data})
    }
})

// @desc Authenticates with the bank
// @route GET /token
// @access Private
const C2P = asyncHandler(async (req, res)=>{
    const {ci, tlf, otp, banco, monto} = req.body
    const data = {
        request:
            {
                identificadorExterno: authToken,
                direccionInternet: req.ip? req.ip : "10.100.49.91",
                rif: process.env.PM_PUNTOGO_RIF,
                telefonoCredito: process.env.PM_PUNTOGO_TLF,
                nombreComercio: process.env.PM_C2P_NOMBRECOMERCIO,
                bancoCredito: process.env.PM_PUNTOGO_BANK,
                canalVirtual: 1,
                identificadorPersona: ci,
                telefonoPersona: tlf,
                otp: otp,
                bancoPagador: banco,
                codigoMoneda: 928,
                montoTransaccion: monto,
                sucursal: 1,
                cajaTerminal: "1",
                tipoTerminal: process.env.PM_C2P_TIPOTERMINAL,
                concepto: "Pago C2P",
                vendedor: 1,
                anulacion: "N",
                numeroReferencia: "0000001"
            }
    }
    const response = await instance.post(process.env.PM_C2P_URL, data, {
        headers: {
            'Authorization': `Bearer ${authToken}` 
        }
    })
    //log the response
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.PM_C2P_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'pagoMovilLog.log')

    if(response.status == 200){
        res.status(200).json({message: "success", data: response.data})
    }
})

// @desc Authenticates with the bank
// @route GET /token
// @access Private
const sendPaymentB2P = asyncHandler(async (req, res)=>{
    const {ci, tlf, banco, monto} = req.body
    const data = {
            direccionInternet: req.ip? req.ip : "10.0.5.123",
            bancoCredito: banco,
            bancoPagador: process.env.PM_PUNTOGO_BANK,
            cajaTerminal: 1,
            canalVirtual: "1",
            codigoMoneda: 928,
            concepto: "Pago Vuelto",
            identificadorPersona: ci,
            montoTransaccion: monto,
            nombreComercio: process.env.PM_SENDPAYMENTB2P_NOMBRECOMERCIO,
            oficina: 800,
            rif: process.env.PM_PUNTOGO_RIF,
            sucursal: 1,
            telefonoDebito: process.env.PM_PUNTOGO_TLF,
            telefonoCredito: tlf,
            tipoTerminal: process.env.PM_C2P_TIPOTERMINAL,
            vendedor: 1,
            factura: ""
    }
    try{
        const response = await instance.post(process.env.PM_SENDPAYMENTB2P_URL, data, {
            headers: {
                'Authorization': `Bearer ${authToken}` 
            }
        })
        //log the response
        logEvents(`reqId: ${req.id} \treqURL:${process.env.PM_SENDPAYMENTB2P_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`, 'pagoMovilLog.log')
        if(response.status != 200){
            res.status(response.status).json({message: "error", data: response.data})
        }
        if(response.status == 200){
            res.status(200).json({message: "success", data: response.data})
        }

    }catch(err){
        logEvents(`reqId: ${req.id} \treqURL:${process.env.PM_SENDPAYMENTB2P_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(err.message)}`, 'pagoMovilLog.log')
        res.status(500).json({message: "error", data: err.message})
    }
    
})

module.exports = {
    getToken,
    getAllBanks,
    queryPaymentB2P,
    C2P,
    sendPaymentB2P
}