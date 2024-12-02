const {createSubscription, fetchEmailContent, renewSubscription} = require('./webhookService');
const simpleParser = require('mailparser').simpleParser;

function processEmail(email) {
    const isValid = email.from === 'no.reply.alerts@chase.com' && email.subject.includes('Zelle®');
    if (!isValid) return logError(email);

    const amount = extractAmount(email.body);
    const walletID = extractWalletID(email.body);

    if (amount && walletID) {
        callWalletService(walletID, amount);
    }
}

function extractAmount(body) {
    const match = body.match(/\$([\d,]+.\d{2})/);
    return match ? parseFloat(match[1].replace(",", "")) : null;
}

function extractWalletID(body) {
    const match = body.match(/Wallet ID:\s*(\d+)/);
    return match ? match[1] : null;
}

function fetchAndProcessEmail(seqNo) {
    const f = imap.seq.fetch(seqNo, { bodies: ["HEADER.FIELDS (FROM SUBJECT)", "TEXT"] });
    f.on("message", (msg) => {
        msg.on("body", (stream) => {
            streamToString(stream).then(processEmail);
        });
    });
}

function addMoneyToWallet(walletID, amount) {
    if (!isValidWallet(walletID)) {
        console.error("Invalid Wallet ID:", walletID);
        return;
    }
    if (amount <= 0) {
        console.error("Invalid Amount:", amount);
        return;
    }

    // Logic to update wallet balance
    updateWalletBalance(walletID, amount)
        .then(() => console.log("Wallet updated successfully"))
        .catch((err) => console.error("Failed to update wallet:", err));
}

// Extract the amount and wallet ID
const body = email.text || email.html || '';
const amount = extractAmount(body);
const walletID = extractWalletID(body);

if (amount && walletID) {
    await callWalletService(walletID, amount);
    console.log('Successfully processed email:', email.envelope.subject);
} else {
    console.log('Failed to extract required fields.');
}

function extractAmount(body) {
const match = body.match(/\$([\d,]+\.\d{2})/);
return match ? parseFloat(match[1].replace(',', '')) : null;
}

function extractWalletID(body) {
const match = body.match(/Wallet ID:\s*(\d+)/);
return match ? match[1] : null;
}




    try {

            // Check if email is from the bank
            if (parsed.from.text.includes("bank@example.com")) {
                // Extract transfer memo (wallet ID) and amount
                const memoMatch = parsed.text.match(/Memo:\s(\w+)/);
                const amountMatch = parsed.text.match(/Amount:\s\$([\d,]+\.\d{2})/);

                if (memoMatch && amountMatch) {
                    const walletId = memoMatch[1];
                    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

                    // Update wallet balance (replace with your function)
                    await updateWalletBalance(walletId, amount);
                    console.log(`Credited $${amount} to wallet ${walletId}`);
                }
            }

    } catch (error) {
        console.error('Error during email check:', error);
    } 

async function updateWalletBalance(walletId, amount) {
    // Placeholder function - replace with actual API call or database update
    console.log(`Updating wallet ${walletId} with amount ${amount}`);
}
