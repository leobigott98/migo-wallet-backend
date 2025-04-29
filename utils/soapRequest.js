// Import soap library
const soap = require('soap');

export default async function soapRequest(url, methodName, args) {
    try {
        // Create SOAP client and make the request
        soap.createClient(url, function(err, client){
            if(err) throw err;

            // Call the SOAP method with the arguments
            client.consultaBalanceSimpletv(args, function(err, result){
                if(err) throw err; 

                // Handle the response
                console.log('SOAP Response:', result);
            });
        }) 
    } catch (error) {
        return error;
    }
}
