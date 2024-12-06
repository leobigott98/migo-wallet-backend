const axios = require("axios");
const asyncHandler = require("express-async-handler");
const { logEvents } = require("../middleware/logger");
const { savePMToken, getToken } = require("../cache/pagoMovilToken");

const instance = axios.create({
  baseURL: process.env.BANK_URL,
  timeout: 40000,
});

// @desc Authenticates with the bank
const authenticate = async () => {
  console.log("attempting PM authentication");
  const data = {
    grant_type: "client_credentials",
  };
  const urlEncoded = new URLSearchParams(Object.entries(data)).toString();
  try {
    const response = await instance.post(process.env.PM_TOKEN_URL, urlEncoded, {
      auth: {
        username: process.env.BANK_USERNAME,
        password: process.env.BANK_PASSWORD,
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log("sent auth request");
    logEvents(
      `reqURL: ${process.env.PM_TOKEN_URL} \treqBody: ${JSON.stringify(
        data
      )} \tresData: ${JSON.stringify(response.data)}`,
      "pagoMovilLog.log"
    );
    if (response.status == 200) {
      const authToken = response.data.access_token;
      const expiration = response.data.expires_in;
      await savePMToken(authToken, expiration);
      return authToken;
    } else
      throw new Error(`status: ${response.status} \tmessage: ${response.data}`);
  } catch (err) {
    logEvents(
      `Error authenticating with Pago Movil: ${err}`,
      "pagoMovilErrorLog.log"
    );
    console.log("There was an error authenticating with Pago Movil");
  }
};

// @desc Gets bank list
const getAllBanks = async (req) => {
  let token = await getToken();
  if (!token) {
    token = await authenticate();
  }

  const data = {
    requestListar: {
      canal: 1,
      identificadorExterno: token,
      terminal: process.env.PM_LISTARBANCOS_TERMINAL,
      tipoLista: process.env.PM_LISTARBANCOS_TIPOLISTA,
    },
  };
  const response = await instance.post(process.env.PM_LISTARBANCOS_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  //log the response
  logEvents(
    `reqId: ${req.id} \treqURL: ${
      process.env.PM_LISTARBANCOS_URL
    } \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(
      response.data
    )}`,
    "pagoMovilLog.log"
  );

  if (response.status == 200) {
    return response.data.Envelope.Body.listarBancosApiResponse.out
      .listaBancosC2p.BancoC2PBean;
    //res.status(200).json({message: "success", data: response.data.Envelope.Body.listarBancosApiResponse.out.listaBancosC2p.BancoC2PBean})
  }
};

// @desc Query a B2P Payment
const queryPaymentB2P = async (req) => {
  try {
    // Check if we have token or authenticate to get a new one
    let token = await getToken();
    if (!token) {
      token = await authenticate();
    }

    // Request to Pago Movil API
    const { ci, tlf, ref, monto, fecha } = req.body;
    const data = {
      rif: process.env.PM_PUNTOGO_RIF,
      identificadorPersona: ci,
      telefonoDebito: tlf,
      montoTransaccion: monto,
      referencia: ref,
      factura: null,
      tipoTrx: process.env.PM_QUERYPAYMENTB2P_TIPOTRX,
      fecha: fecha,
    };
    const response = await instance.post(
      process.env.PM_QUERYPAYMENTB2P_URL,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    //log the response
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.PM_QUERYPAYMENTB2P_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`,"pagoMovilLog.log");

    // Return the response
    if (response.status == 200) {
      return response.data;
    } else {
      console.log(response.data);
      return null;
    }
  } catch (err) {
    logEvents(`Error querying B2P Payment: ${err}`, "pagoMovilErrorLog.log");
    console.log("Error querying B2P Payment:", err);
  }
};

// send C2P Payment
const C2P = async (req) => {
  try {

    // Check if valid token is available or authenticate to get a new one
    let token = await getToken();
    if (!token) {
      token = await authenticate();
    }

    // Pago Movil API Request
    const { ci, tlf, otp, banco, monto } = req.body;
    const data = {
      request: {
        identificadorExterno: token,
        direccionInternet: req.ip ? req.ip : "10.100.49.91",
        rif: process.env.PM_PUNTOGO_RIF,
        telefonoCredito: process.env.PM_PUNTOGO_TLF,
        nombreComercio: process.env.PM_C2P_NOMBRECOMERCIO,
        bancoCredito: process.env.PM_PUNTOGO_BANK,
        canalVirtual: 1,
        identificadorPersona: ci,
        telefonoPersona: tlf,
        otp: otp,
        bancoPagador: banco,
        codigoMoneda: 928,
        montoTransaccion: monto,
        sucursal: 1,
        cajaTerminal: "1",
        tipoTerminal: process.env.PM_C2P_TIPOTERMINAL,
        concepto: "Pago C2P",
        vendedor: 1,
        anulacion: "N",
        numeroReferencia: "0000001",
      },
    };
    const response = await instance.post(process.env.PM_C2P_URL, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    //log the response
    logEvents(`reqId: ${req.id} \treqURL: ${process.env.PM_C2P_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`,"pagoMovilLog.log");

    // Return the response
    if (response.status == 200) {
      return response.data.Envelope.Body.registrarPagoC2pApiResponse.out; 
    } else {
        console.log(response.data);
        return null
    }
  } catch (err) {
    logEvents(`Error making C2P Payment: ${err}`, "pagoMovilErrorLog.log");
    console.log("There was an error making C2P Payment:", err);
  }
};

// @desc send B2P Payment
const sendPaymentB2P = async (req) => {
    try{
        // Check if token is available
        let token = await getToken();
        if (!token) {
            token = await authenticate();
        }

        // Pago Movil API Request
        const { ci, tlf, banco, monto } = req.body;
        const data = {
            direccionInternet: req.ip ? req.ip : "10.0.5.123",
            bancoCredito: banco,
            bancoPagador: process.env.PM_PUNTOGO_BANK,
            cajaTerminal: 1,
            canalVirtual: "1",
            codigoMoneda: 928,
            concepto: "Pago Vuelto",
            identificadorPersona: ci,
            montoTransaccion: monto,
            nombreComercio: process.env.PM_SENDPAYMENTB2P_NOMBRECOMERCIO,
            oficina: 800,
            rif: process.env.PM_PUNTOGO_RIF,
            sucursal: 1,
            telefonoDebito: process.env.PM_PUNTOGO_TLF,
            telefonoCredito: tlf,
            tipoTerminal: process.env.PM_C2P_TIPOTERMINAL,
            vendedor: 1,
            factura: "",
        };
        const response = await instance.post(
        process.env.PM_SENDPAYMENTB2P_URL,
        data,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );
        //log the response
        logEvents(`reqId: ${req.id} \treqURL:${process.env.PM_SENDPAYMENTB2P_URL} \treqBody: ${JSON.stringify(data)} \tresData: ${JSON.stringify(response.data)}`,"pagoMovilLog.log");
        
        // return the response
         if (response.status == 200) {
            return response.data;
         }else{
            console.log(response.data)
            return null;
         }

    }catch(err){
        logEvents(`Error sending B2P Payment: ${err}`, "pagoMovilErrorLog.log");
        console.log("Error sending B2P Payment:", err);
    }
  
};

module.exports = {
  getAllBanks,
  queryPaymentB2P,
  C2P,
  sendPaymentB2P,
};
