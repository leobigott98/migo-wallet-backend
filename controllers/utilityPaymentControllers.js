const payallService = require('../services/payallService');
const { withdrawFunds } = require('../services/walletService');

const makePayment = async (req, res) => {
    try {
        const { balance, operadora, producto, numero, monto, metodo, userID, accID, requestID } = req.body;


        
    } catch (error) {
        console.error('Error making payment:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });   
    }
};