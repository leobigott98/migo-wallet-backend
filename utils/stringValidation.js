const isValidEmail = (email) => {
  if (typeof email === "string") {
    const regexProd = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/; // FOR PRODUCTION
    const regex = /^[\w-\.+]+@([\w-]+\.)+[\w-]{2,4}$/; // FOR DEVELOPMENT
    return regex.test(email);
  } else return false;
};

const isValidname = (name) => {
  if (typeof name === "string") {
    const processed = name.trim().toUpperCase();
    const regex = /^[A-ZÀ-ÿ-a-z']+(?: [A-ZÀ-ÿ-a-z']+)*$/;
    return regex.test(processed);
  } else return false;
};

const isValidID = (ID) => {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
  return regex.test(ID);
};

const isValidReference = (reference) => {
  const regex = /^[A-z0-9]{4,}$/;
  return regex.text(reference);
};

// Function to check if wallet ID is a 12 digit string
const isValidWallet = (walletID) => {
  const regex = /^[\d]{12}$/;
  return regex.test(walletID);
};

module.exports = { isValidEmail, isValidname, isValidID, isValidReference, isValidWallet };
