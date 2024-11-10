const express = require('express')
const router = express.Router()
const credicardControllers = require('../controllers/credicardControllers')

router.route('/bank_card_info')
    .post(credicardControllers.getBankCardInfo)

module.exports = router