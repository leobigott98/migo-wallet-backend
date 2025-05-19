const { getAccountStatusByUserId } = require('../services/walletService');

const getAccountStatus = async (req, res) => {
    try {
        const { user_id, coin_id } = req.body;
        const accountStatus = await getAccountStatusByUserId(user_id, coin_id);

        if (!accountStatus) {
            return res.status(404).json({ message: 'Account not found' });
        }

        if(accountStatus.error) {
            console.error('Error fetching account status:', accountStatus.error);
            return res.status(400).json({ error: 'Bad Request', message: accountStatus.error });
        }

        return res.status(200).json(accountStatus);
    } catch (err) {
        console.error('Error fetching account status:', err.message);
        return res.status(500).json({ error: 'Internal Server Error', message: err.message });
    }
}

module.exports = {
    getAccountStatus,
};