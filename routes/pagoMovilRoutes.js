const express = require('express')
const router = express.Router()
const pagoMovilControllers = require('../controllers/pagoMovilControllers')

router.route('/listarBancos')
    .get(pagoMovilControllers.getAllBanks)

router.route('/consultaB2P')
    .post(pagoMovilControllers.topUpB2P)

router.route('/C2P')
    .post(pagoMovilControllers.topUpC2P)

router.route('/enviarB2P')
    .post(pagoMovilControllers.withdrawB2P)

module.exports = router