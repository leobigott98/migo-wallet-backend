const {setImapConn} = require('../config/imapConn');
const {msalAuthenticate} = require('../auth/serviceAuth/imapAuth');
const {simpleParser} = require('mailparser');


async function monitorBankEmails() {
    const client = await setImapConn();

    async function startSession() {
        try {
            await client.connect();
            await client.mailboxOpen('INBOX');
            console.log('Connected and mailbox opened.');
            
            // Add periodic "noop" command here if needed

        } catch (error) {
            console.error("Connection Error:", error);
            if (error.code === 'ClosedAfterConnectTLS' || error.code === 'NoConnection') {
                console.log('Attempting to reconnect after delay...');
                setTimeout(startSession, 10000); // Retry connection after 10 seconds
            }
        }
    }

    client.on('error', (error) => {
        console.error("Client encountered an error:", error);
        startSession();
    });

    await startSession();

    

    /* await client.mailboxOpen('INBOX');

    for await (let message of client.fetch({ seen: false })) {
        const parsed = await simpleParser(await client.download(message.uid));
        
        if (parsed.from.text.includes("bank@example.com")) {
            const memoMatch = parsed.text.match(/Memo:\s(\w+)/);
            const amountMatch = parsed.text.match(/Amount:\s\$([\d,]+\.\d{2})/);

            if (memoMatch && amountMatch) {
                const walletId = memoMatch[1];
                const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

                await updateWalletBalance(walletId, amount);
            }
        }
    }

    await client.logout(); */

    // Continue processing emails as before...
//}

/* async function updateWalletBalance(walletId, amount) {
    try {
        //await axios.post(`https://your-wallet-api.com/wallets/${walletId}/deposit`, { amount });
        console.log(`Deposited $${amount} to wallet ${walletId}`);
    } catch (error) {
        console.error("Failed to update wallet balance:", error);
    }
} */

    async function fetchEmails() {

        const client = await setImapConn();
        await client.connect();
        const lock = await client.getMailboxLock('INBOX');
        client.on('exists', data=>{
            console.log(`Message count in "${data.path}" is ${data.count}`);
    
        });
        try {
          for await (const message of client.fetch('1:*', {uid: true})) {
            const {content} = await client.download(message.uid, ['TEXT']);
            // Process content here
            console.log('Email Content:', content.toString());
          }
        } finally {
          lock.release();
          await client.logout();
        }
      }
      fetchEmails().catch(console.error);
    
    /* const main = async () => {
        // Wait until client connects and authorizes
        await client.connect();
    
        // Select and lock a mailbox. Throws if mailbox does not exist
        let lock = await client.getMailboxLock('INBOX');
        try {
            // fetch latest message source
            // client.mailbox includes information about currently selected mailbox
            // "exists" value is also the largest sequence number available in the mailbox
            let message = await client.fetchOne(client.mailbox.exists, { source: true });
            console.log(message.source.toString());
    
            // list subjects for all messages
            // uid value is always included in FETCH response, envelope strings are in unicode.
            for await (let message of client.fetch('1:*', { envelope: true })) {
                console.log(`${message.uid}: ${message.envelope.subject}`);
            }
        } finally {
            // Make sure lock is released, otherwise next `getMailboxLock()` never returns
            lock.release();
        }
    
        // log out and close connection
        await client.logout();
    }; */
}
    
    //main().catch(err => console.error(err));

module.exports = {monitorBankEmails}


