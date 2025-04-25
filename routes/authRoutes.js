const express = require('express');
const router = express.Router()
const authControllers = require('../controllers/authControllers')

router.route('/sign-up')
    .post(authControllers.signUp)

router.route('/sign-in')
    .post(authControllers.signIn)

router.route('/refresh-token')
    .post(authControllers.refreshToken)

router.route('/verify-email')
    .post(authControllers.verifyEmail)

router.route('/resend-otp')
    .post(authControllers.sendOTP)

router.route('/reset-password')
    .post(authControllers.resetPassword);

module.exports = router