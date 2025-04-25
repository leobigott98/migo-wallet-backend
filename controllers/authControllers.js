const { isValidEmail, isValidname, isValidOTP } = require("../utils/stringValidation");
const { createUserInAuthServer, loginUser, refreshAuthToken, emailVerification, resendOTP, requestPasswordReset } = require('../services/authService');
const {logEvents} = require('../middleware/logger');
const {createUserInDB} = require('../services/authService');
const axios = require('axios');

const signUp = async (req, res)=>{
    try {
        // Get user info from request body
        const { name, lastname, email, password } = req.body;

        // Make validations
        if(!isValidEmail(email)){
            console.log("Not valid email:", email);
            return res.status(400).json({message: `Not valid email: ${email}`});
        }

        if(!isValidname(name)){
            console.log("Not valid name:", name);
            return res.status(400).json({message: `Not valid name: ${name}`});
        }

        if(!isValidname(lastname)){
            console.log("Not valid name:", lastname);
            return res.status(400).json({message: `Not valid name: ${lastname}` }); 
        }

        // Create User in Auth Server DB
        const user = await createUserInAuthServer(email, name, lastname, password);
        if(!user.userId) {
            return res.status(400).json({message: user})
        };

        // Create User in Wallet DB
        const dbResponse = await createUserInDB(email, name, lastname);
        if(!dbResponse.response) {
            console.log("Error creating user in DB:", dbResponse);
            return res.status(400).json({message: 'Error creating user in DB'});
        }

        res.status(201).json({ response: dbResponse})
        
    } catch (err) {
        console.error('Error signing-up:', err.message);
        res.status(500).json({ error: 'Internal Server Error', message: err.message});
    }

}

const signIn = async (req, res)=>{
    try {
        const {email, password} = req.body;

        // Make validations
        if(!isValidEmail(email)){
            console.log("Not valid email:", email);
            return res.status(400).json({message: `Not valid email: ${email}`});
        }

        // Log in user
        const response = await loginUser(email, password);
        if(response.error){
            return res.status(400).json({message: response.error_description});
        }

        return res.status(200).json(response);
        
    } catch (err) {
        console.error('Error signing-in:', err.message);
        return res.status(500).json({error: 'Internal Server Error', message: err.message});
        
    }
}

const refreshToken = async(req,res)=>{
    try {
        const {refresh_token} = req.body;

        const response = await refreshAuthToken(refresh_token);

        if(response.error){
            return res.status(400).json({message: response.error_description})
        }

        return res.status(200).json(response)
        
    } catch (err) {
        console.error('Error refreshing token:', err.message);
        res.status(500).json({error: 'Internal Server Error', message: err.message});
        
    }
}

const verifyEmail = async (req, res)=>{
    try {
        // Get email from request
        const {email, otp} = req.body;

        // Make validation
        if(!isValidEmail(email)){
            return res.status(400).json({message: 'Not valid email'});
        };

        if(!isValidOTP(otp)){
            return res.status(400).json({message: 'Not valid OTP'});
        };

        const response = await emailVerification(email, otp);

        if(response.error){
            return res.status(400).json({message: response.error_description});
        }

        return res.status(200).json(response);
        
    } catch (err) {
        console.error('Error verifying email:', err.message);
        return res.status(500).json({error: 'Internal Server Error', message: err.message});
    }
};

const sendOTP = async (req, res)=>{
    try {
        const { email } = req.body;

        // Check if valid email
        if(!isValidEmail(email)) return res.status(400).json({message: 'Not valid email'});

        const response = await resendOTP(email);

        if(response.error){
            return res.status(400).json({message: response.error_description});
        }

        return res.status(200).json(response);
        
    } catch (err) {
        console.error("Error sending OTP", err)
        return res.status(500).json({error: 'Internal Server Error', message: err.message});  
    }
};

const resetPassword = async (req, res) =>{
    try {
        
        const {email} = req.body;

        // Make validations
        if(!isValidEmail(email)){
            return res.status(400).json({message: 'Not valid email'});
        };

        const response = await requestPasswordReset(email);

        if(response.error){
            return res.status(400).json(response);
        }

        return res.status(200).json(response);
        
    } catch (err) {
        console.error("Error resetting password", err);
        return res.status(500).json({error: 'Internal Server Error', message: err.message});
    }
}

module.exports = {signUp, signIn, verifyEmail, sendOTP, refreshToken, resetPassword};

