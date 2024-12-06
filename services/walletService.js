const pool = require("../config/dbConn");

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

// Function to Add Money to Wallet
const topUpWallet = async (walletID, amount, method, dateTime) => {
  try {
    // Make a query to Call the SP
    const response = await transactionSim(walletID, amount, dateTime);
    console.log(response);
    return response
    //const dbResponse = await promisePool.query('CALL SP_NAME(?,?,?,?)', [walletID, amount, method, dateTime]);
    //console.log(dbResponse);
  } catch (err) {
    console.log(`Error Topping-Up: ${err}`);
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
