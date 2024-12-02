const express = require('express')
const router = express.Router()
const webhookControllers = require('../controllers/webhookControllers')

router.route('/outlook')
    .post(webhookControllers.receiveNotification);

module.exports = router