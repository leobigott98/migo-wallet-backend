const {promisePool} = require('../config/dbConn');
const { logEvents } = require("../middleware/logger");
const axios = require('axios');

const authServer = axios.create({
    baseURL: process.env.AUTH_SERVER_URL,
    timeout: 40000,
});

async function createUserInAuthServer (email, name, lastname, password) {
    try {
        console.log('Creating user in auth server...');
        
        // Prepare user data
        const authData = {
            name,
            lastname,
            email: email.toLowerCase(),
            password,
            role: 'user'
        };
   
        // Make request to auth server
        const authResponse = await authServer.post('/auth/sign-up', authData);

        return authResponse.data;

    } catch (err) {
        logEvents(`Error creating user ${email} in Auth Server: ${err.response.data.message}`, 'AuthServerErrLog.log');  
        return err.response.data.message;
    }
};

async function loginUser (email, password) {
    try {
        const authData = {
            grant_type: 'password',
            client_id: process.env.AUTH_SERVER_CLIENT_ID,
            client_secret: process.env.AUTH_SERVER_CLIENT_SECRET,
            username: email.toLowerCase(),
            password
        };

        const urlEncoded = new URLSearchParams(Object.entries(authData)).toString();

        const authResponse = await authServer.post('/auth/token', urlEncoded, {
            auth:{
                username: process.env.AUTH_SERVER_CLIENT_ID,
                password: process.env.AUTH_SERVER_CLIENT_SECRET
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });

        return authResponse.data;
        
    } catch (err) {
        logEvents(`Error loging user ${email} in Auth Server: ${err.response.data.error_description}`, 'AuthServerErrLog.log');
        return err.response.data; 
    }

};

async function refreshAuthToken (refreshToken){
    try {

        const authData = {
            grant_type: 'refresh_token',
            client_id: process.env.AUTH_SERVER_CLIENT_ID,
            client_secret: process.env.AUTH_SERVER_CLIENT_SECRET,
            refresh_token: refreshToken
        };

        const urlEncoded = new URLSearchParams(Object.entries(authData)).toString();

        const authResponse = await authServer.post('/auth/token', urlEncoded, {
            auth:{
                username: process.env.AUTH_SERVER_CLIENT_ID,
                password: process.env.AUTH_SERVER_CLIENT_SECRET
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            }
        });

        return authResponse.data;
        
    } catch (err) {
        logEvents(`Error refreshing token ${refreshToken} in Auth Server: ${err.response.data.error_description}`, 'AuthServerErrLog.log');
        return err.response.data;   
    }
}

async function emailVerification(email, otp){
    try {

        const response = await authServer.post('/auth/verify-email', {email, otp});

        return response.data;
        
    } catch (err) {
        logEvents(`Error verifying email ${email} in Auth Server: ${err.response.data.error_description}`, 'AuthServerErrLog.log');
        return err.response.data;
    }
};

async function resendOTP(email){
    try {

        // Send request to Auth Server
        const response = await authServer.post('/auth/request-new-otp', {email});

        return response.data;
        
    } catch (err) {
        logEvents(`Error sending OTP to email ${email} in Auth Server: ${err.response.data.error_description}`, 'AuthServerErrLog.log');
        return err.response.data;  
    }
}

async function requestPasswordReset(email){
    try {
        // Send request to Auth Server
        const response = await authServer.post('/auth/request-password-reset', {email});

        return response.data;
        
    } catch (err) {
        logEvents(`Error resetting password for ${email} in Auth Server: ${err.response.data.error_description}`, 'AuthServerErrLog.log');
        return err.response.data;
        
    }
}

module.exports = { createUserInAuthServer, loginUser, refreshAuthToken, emailVerification, resendOTP, requestPasswordReset };