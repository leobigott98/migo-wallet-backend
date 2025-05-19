const app = require('express');
const router = app.Router();
const {authenticateJWT} = require('../middleware/authMiddleware');
const userController = require('../controllers/userControllers');
const walletController = require('../controllers/walletControllers');

router.route('/info')
    .get(authenticateJWT, userController.getUserInfo);

router.route('/account-status')
    .post(authenticateJWT, walletController.getAccountStatus);

module.exports = router;