const express = require('express')
const router = express.Router()
const pagoMovilControllers = require('../controllers/pagoMovilControllers')

router.route('/token')
    .get(pagoMovilControllers.getToken)

router.route('/listarBancos')
    .get(pagoMovilControllers.getAllBanks)

router.route('/consultaB2P')
    .post(pagoMovilControllers.queryPaymentB2P)

router.route('/C2P')
    .post(pagoMovilControllers.C2P)

router.route('/enviarB2P')
    .post(pagoMovilControllers.sendPaymentB2P)

module.exports = router