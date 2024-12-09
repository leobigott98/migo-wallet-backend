const pool = require("../config/dbConn");
const { logEvents } = require("../middleware/logger");

// Create a promisePool to use asyn/await for database async operations
const promisePool = pool.promise();

// Simulate a promise for testing purposes
const transactionSim = async (walletID, amount, dateTime) => {
  return new Promise((resolve, reject) => {
    setInterval(() => {
      resolve(`Successful Transaction by ${walletID} of ${amount} on ${dateTime}`);
    }, 3000);
  });
};

// Function to check if wallet ID is a 12 digit string
const isValidWallet = (walletID)=>{
  const regex = /^[\d]{12}$/;
  return regex.test(walletID);
}

// Function to update wallet balance in Database
async function updateWalletBalance(walletID, amount, method, dateTime) {
  // Database update
  try {
    console.log(`Updating wallet ${walletID} with amount ${amount}`);

    // AGREGAR SP AQUÍ
    const dbResponse = await promisePool.query('CALL SP_NAME(?,?,?,?)', [walletID, amount, method, dateTime]);

    //Logging
    logEvents(`DB Balance Update: ${dbResponse} \tParameters: ${walletID} ${amount} ${method} ${dateTime}`, 'dbLog.Log');
    console.log(dbResponse);
    console.log(`Credited $${amount} to wallet ${walletID}`);

    //return response
    return dbResponse;

  } catch (error) {
    //loggint
    logEvents(`DB Balance Update Error: ${error} \tParameters: ${walletID} ${amount} ${method} ${dateTime}`, 'dbErrorLog.Log');
    return error;
  }
}

// Function to Add Money to Wallet
const topUpWallet = async (walletID, amount, method, dateTime) => {
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

     // Logic to update wallet balance
         /* const updateResult = await updateWalletBalance(walletID, amount);
        if(updateResult.status === 'success'){
          return "Wallet updated successfully"
        }else{
          return `Failed to update wallet: ${err}`
        }  */

    const response = await transactionSim(walletID, amount, dateTime);
    console.log(response);
    return response;
    
  } catch (err) {
    console.log(`Error Topping-Up: ${err}`);
    return null;
  }
};

// Function to Withdraw funds from Wallet
const withdrawFunds = async (walletID, amount, method, dateTime) => {
  try {
    // Make a query to Call the SP
    const response = await transactionSim(walletID, amount, dateTime);
    console.log(response);
    //const dbResponse = await promisePool.query('CALL SP_NAME(?,?,?,?)', [walletID, amount, method, dateTime]);
    //console.log(dbResponse);
  } catch (err) {
    console.log(`Error Withdrawing Funds: ${err}`);
  }
};

// Function to Transfer funds between two wallets
const transferFunds = async (senderID, recipientID, amount, dateTime) => {
  try {
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
