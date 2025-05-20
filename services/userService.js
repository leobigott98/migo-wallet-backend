const { promisePool } = require ("../config/dbConn");
const { logEvents } = require ("../middleware/logger");

async function createUserInDB (email, name, lastname){
    try {
        console.log('Creating user in DB...')

        const dbResponse = await promisePool.query('CALL sp_create_reg(?, ?, ?);', [name, lastname, email]);

        return dbResponse;
        
    } catch (err) {
        logEvents(`Error creating user ${email} in DB: ${err.message}`, 'MySQLErrLog.log');
        return err.message;
    }
};

module.exports = { createUserInDB };