const walletService = require('../services/walletService');
const { isValidEmail } = require('../utils/stringValidation');

const getUserInfo = async (req, res) => {
    try {
        const {email} = req.user; // Extract email from the authenticated user

        // If the email is not provided or invalid, return a 400 Bad Request response
        if (!email) {
            return res.status(400).json({ message: 'Email not provided' });
        }
        // Check if the email format is valid using a utility function
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Fetch user information from the database using the userService
        const response = await walletService.getWalletByEmail(email); 

        // If the user information is not found, return a 404 Not Found response
        if (!response) {
            return res.status(404).json({ message: 'User not found' });
        }

        const account_info = response[0][0]; // Extract the first row of the response

        // Return the user information in the response with a 200 OK status
        res.status(200).json(account_info);
    } catch (error) {
        console.error('Error fetching user info:', error.message);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
};

module.exports = { getUserInfo };