const {promisePool} = require("../config/dbConn");
const { logEvents } = require("../middleware/logger");
const { isValidEmail, isValidID, isValidReference, isValidWallet, isValidname } = require('../utils/stringValidation')

// Simulate a promise for testing purposes
const transactionSim = async (walletID, amount, dateTime) => {
  return new Promise((resolve, reject) => {
    setInterval(() => {
      resolve(`Successful Transaction by ${walletID} of ${amount} on ${dateTime}`);
    }, 3000);
  });
};


// Function to update wallet balance in Database
async function updateWalletBalance(userID, accID, requestID, amount, transactionTypeId, methodId, coinCode, reference) {
  // Database update
  try {
    console.log(`Updating wallet of user ${userID} with amount ${amount}`);

    // Call SP to Add Money to wallet
    const dbResponse = await promisePool.query('CALL SP_NAME(?,?,?,?,?,?,?,?)', [userID, accID, requestID, transactionTypeId, amount, methodId, coinCode, reference]);

    //Logging
    logEvents(`DB Balance Update: ${dbResponse} \tParameters: ${userID} ${accID} ${requestID} ${amount} ${transactionTypeId} ${methodId} ${coinCode} ${reference}`, 'dbLog.Log');
    console.log(dbResponse);
    console.log(`Credited $${amount} to user ${userID}`);

    //return response
    return dbResponse;

  } catch (error) {
    //loggint
    logEvents(`DB Balance Update Error: ${error} \tParameters: ${walletID} ${amount} ${methodId} ${dateTime}`, 'dbErrorLog.Log');
    return error;
  }
}

// Function to Add Money to Wallet
const topUpWallet = async (userID, accID, requestID, amount, transactionTypeId, methodId, coinCode, reference) => {
  try {

    // Validate Amount
    if (amount <= 0) {
        console.error("Invalid Amount:", amount);
        throw new Error("Invalid Amount:", amount);
    }

    // Validate Request ID
    if (!isValidID(requestID)) {
      console.error("Invalid Request ID:", requestID);
      throw new Error("Invalid Request ID:", requestID);
  }

    // Validate Account ID
    if (!isValidID(userID)) {
      console.error("Invalid User ID:", userID);
      throw new Error("Invalid User ID:", userID);
  }

  // Validate User ID
  if (!isValidID(accID)) {
    console.error("Invalid Account ID:", accID);
    throw new Error("Invalid Account ID:", accID);
}

  // Validate transactionTypeId
  if (transactionTypeId <= 0 || transactionTypeId >=7){
    console.error("Invalid Transaction Type ID:", transactionTypeId);
    throw new Error("Invalid Transaction Type ID:", transactionTypeId);
  }

  // Validate MethodId
  if (methodId <= 0 || methodId >=8){
    console.error("Invalid Method ID:", methodId);
    throw new Error("Invalid Method ID:", methodId);
  }

  // Validate CoinCode
  if (!coinCode === 926 && !coinCode === 840){
    console.error("Invalid CoinCode:", coinCode);
    throw new Error("Invalid CoinCode:", coinCode);
  }

  // Validate Reference
  if(!isValidReference){
    console.error("Invalid Reference:", reference);
    throw new Error("Invalid Reference:", reference);
  }

  // Logic to update wallet balance
  const updateResult = await updateWalletBalance(userID, accID, requestID, amount, transactionTypeId, methodId, coinCode, reference);
  if(updateResult.status === 'success'){
    return "Wallet updated successfully"
  }else{
    return `Failed to update wallet: ${err}`
  } 
    
  } catch (err) {
    console.log(`Error Topping-Up: ${err}`);
    return null;
  }
};

// Function to Withdraw funds from Wallet
const withdrawFunds = async (walletID, amount, methodId, dateTime) => {
  try {

    // Validate Wallet
    if (!isValidWallet(walletID)) {
      console.error("Invalid Wallet ID:", walletID);
      throw new Error("Invalid Wallet ID:", walletID);
    }

    // Validate Amount
    if (amount <= 0) {
        console.error("Invalid Amount:", amount);
        throw new Error("Invalid Amount:", amount);
    }

    // Make a query to Call the SP
    const response = await transactionSim(walletID, amount, dateTime);
    console.log(response);
    //const dbResponse = await promisePool.query('CALL SP_NAME(?,?,?,?)', [walletID, amount, methodId, dateTime]);
    //console.log(dbResponse);
  } catch (err) {
    console.log(`Error Withdrawing Funds: ${err}`);
  }
};

// Function to Transfer funds between two wallets
const transferFunds = async (senderID, recipientID, amount, dateTime) => {
  try {
    // Validate Sender Wallet
    if (!isValidWallet(senderID)) {
      console.error("Invalid Sender Wallet ID:", senderID);
      throw new Error("Invalid Sender Wallet ID:", senderID);
    }

    // Validate Recipient Wallet
    if (!isValidWallet(recipientID)) {
      console.error("Invalid Recipient Wallet ID:", recipientID);
      throw new Error("Invalid Recipient Wallet ID:", recipientID);
    }

    // Validate Amount
    if (amount <= 0) {
        console.error("Invalid Amount:", amount);
        throw new Error("Invalid Amount:", amount);
    }

    // Make a query to Call the SP
    const response = await transactionSim(senderID, amount, dateTime);
    console.log(response);
    //const dbResponse = await promisePool.query('CALL SP_NAME(?,?,?,?)', [senderID, recipientID, amount, dateTime]);
    //console.log(dbResponse);
  } catch (err) {
    console.log(`Error Transfering Funds ${err}`);
  }
};

module.exports = { topUpWallet, transferFunds, withdrawFunds };
