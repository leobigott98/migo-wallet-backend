// Import dependencies
const {topUpWallet} = require('../services/walletService');

// Function to process the email
async function processEmail(email) {
    try{
        // Validate the sender
        const isValid = email.from.emailAddress.address === 'no.reply.alerts@chase.com' && email.subject.includes('Zelle®');
        if (!isValid) throw new Error('Not valid email');

        // Check amount and wallet id
        const amount = extractAmount(email.body.content);
        const walletID = extractWalletID(email.body.content);

        if (amount && walletID) {
            dbResponse = await topUpWallet(walletID, amount, 'ZELLE', email.sentDateTime);
            console.log(dbResponse);
        } else {
            throw new Error('Failed to extract required fields.');
        }


    }catch(err){
        console.log('There was an error processing the email:', err)
        return null;
    }
}

// Extract the zelle amount from the email body
function extractAmount(body) {
    const match = body.match(/\$([\d,]+\.\d{2})/);
    return match ? parseFloat(match[1].replace(',', '')) : null;
}

// Extract the wallet ID from the zelle memo
function extractWalletID(body) {
    const match = body.match(/Memo:\s(\w+)/);
    return match ? match[1] : null;
}

module.exports = {processEmail};