//Import Dependencies
const {ImapFlow} = require('imapflow');
const {getToken} = require('../cache/imapToken');
const {msalAuthenticate} = require('../auth/serviceAuth/imapAuth');

//Set up IMAP connection
const setImapConn = async()=>{
    let token = await getToken();
    if(!token){
        token = await msalAuthenticate();
    }
    if(!token){
        throw new Error('Unable to retrieve or generate a valid authentication token');
    }
    console.log('Using token:', token);
    const client = new ImapFlow({
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        secure: true,
        greetingTimeout: 30000, // Increase timeout to 30 seconds
        auth: {
            user: process.env.ZELLE_MAIL_ID,
            accessToken: token,
            //pass: process.env.ZELLE_MAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
            servername: process.env.IMAP_SERVERNAME
        }
    });
    return client;
}

module.exports = {setImapConn}