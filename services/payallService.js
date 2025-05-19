// Import the required libraries
const payallUUID = require('../utils/customUUID');
const soap = require('soap');
const { promisify } = require('util');

// Import environment variables
const { PAYALL_PV: pv, PAYALL_PIN: pin, PAYALL_KEY: key, PAYALL_CODE: code, PAYALL_URL: url } = process.env;

// Utility: Validate required parameters
function validateParams(params) {
    for (const [key, value] of Object.entries(params)) {
        if (!value) throw new Error(`Missing required parameter: ${key}`);
    }
}

// Helper function to create SOAP client and make requests
async function createSoapClient(url) {
    const client = await promisify(soap.createClient)(url);
    return client;
};

// Helper function to call SOAP methods
async function callSoapMethod(client, methodName, args) {
    const method = promisify(client[methodName].bind(client));
    return method(args);
};

// Generic SOAP request handler
async function handleSoapRequest(methodName, args) {
    try {
        const client = await createSoapClient(url);
        const result = await callSoapMethod(client, methodName, { arg0: args });
        console.log('SOAP Response:', result);
        return result;
    } catch (error) {
        console.error('SOAP Request Error:', error);
        throw error;
    }
}

// Unified function for recarga requests
async function recargaBase(method, operadora, producto, numero, monto) {
    validateParams({ operadora, producto, numero, monto });
    const uuid = payallUUID();
    const args = { pv, pin, key, code, uuid, operadora, producto, numero, monto };
    return handleSoapRequest(method, args);
}

// Service functions
async function recargaTelefono(operadora, producto, numero, monto) {
    return recargaBase('recargar', operadora, producto, numero, monto);
}

async function recargaInter(operadora, producto, numero, monto) {
    return recargaBase('recargarInter', operadora, producto, numero, monto);
}

async function saldoCuenta() {
    return handleSoapRequest('saldo', { pv, pin, key, code });
}

async function saldoCantv(operadora, producto, numero_contrato) {
    validateParams({ operadora, producto, numero_contrato });
    return handleSoapRequest('consultaSaldoCantv', { operadora, producto, numero_contrato });
}

async function saldoInter(operadora, producto, cedula) {
    validateParams({ operadora, producto, cedula });
    return handleSoapRequest('consultaSaldoInter', { operadora, producto, cedula });
}

async function balanceSimpletv(operadora, producto, smartcardnumber) {
    validateParams({ operadora, producto, smartcardnumber });
    return handleSoapRequest('consultaBalanceSimpleTV', { operadora, producto, smartcardnumber });
}

async function echoTest() {
    return handleSoapRequest('echoTest', pv);
}

async function saldoDigitel(operadora, producto, numero_contrato) {
    validateParams({ operadora, producto, numero_contrato });
    return handleSoapRequest('consultaSaldoDigitel', { operadora, producto, numero_contrato, pv });
}

async function saldoMovistar(operadora, producto, numero_contrato) {
    validateParams({ operadora, producto, numero_contrato });
    return handleSoapRequest('consultaSaldoMovistar', { operadora, producto, numero_contrato });
}

async function consultaSaldoMovilnet(operadora, producto, numero_contrato) {
    validateParams({ operadora, producto, numero_contrato });
    return handleSoapRequest('consultaSaldoMovilnet', { operadora, producto, numero_contrato, pv });
}

async function consultaTasa(operadora, producto, monto) {
    validateParams({ operadora, producto, monto });
    return handleSoapRequest('getTasa', { operadora, producto, monto });
}

async function consultaNetuno(nacionalidad, documento) {
    validateParams({ nacionalidad, documento });
    return handleSoapRequest('consultaSaldoNetUno', { documento, nacionalidad });
}

module.exports = {
    recargaTelefono,
    recargaInter,
    saldoCuenta,
    saldoCantv,
    saldoInter,
    balanceSimpletv,
    echoTest,
    saldoDigitel,
    saldoMovistar,
    consultaSaldoMovilnet,
    consultaTasa,
    consultaNetuno
};