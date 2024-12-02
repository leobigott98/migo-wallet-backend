const {logEvents} = require('../../middleware/logger');
const msal = require("@azure/msal-node");
const { saveMSALToken } = require("../../cache/imapToken");

const clientConfig = {
    auth: {
      clientId: process.env.MSAL_IMAP_CLIENT_ID,
      authority: process.env.MSAL_AUTHORITY,
      clientSecret: process.env.MSAL_IMAP_CLIENT_SECRET,
    },
  };
  
  const cca = new msal.ConfidentialClientApplication(clientConfig);
  
  const clientCredentialRequest = {
    scopes: [process.env.MSAL_IMAP_SCOPE], // replace with your resource
  };
  
  const msalAuthenticate = async () => {
    try{
      console.log('attempting token request')
      const response = await cca.acquireTokenByClientCredential(clientCredentialRequest)
      const authToken = response.accessToken;
      logEvents(`MSAL Response: ${JSON.stringify(response)}`, "msalLog.log");
      await saveMSALToken(authToken);
      return authToken;
    } catch(error) {
        logEvents(`MSAL Error: ${JSON.stringify(error)}`, "msalErrorLog.log");
        console.log(JSON.stringify(error));
        return null;
      };
  };
  
  module.exports = { msalAuthenticate };