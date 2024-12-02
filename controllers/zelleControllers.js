const {cca, clientCredentialRequest} = require('../config/msalToken');
const {saveMSALToken, getToken} = require('../cache/msalToken');
const {logEvents} = require('../middleware/logger');

//get access token from msal
const authenticate = cca.acquireTokenByClientCredential(clientCredentialRequest).then((response) => {
    logEvents(`MSAL Response: ${response}`, 'msalLog.log')
    saveMSALToken(response.accessToken);
}).catch((error) => {
    logEvents(`Error acquiring MSAL Token: ${JSON.stringify(error)}`, 'msalErrorLog.log')
    console.log(JSON.stringify(error));
});

