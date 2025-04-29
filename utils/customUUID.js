// This function generates a UUID for Payall transactions. It combines the Payall idPV with a timestamp to create a unique identifier for each transaction. The UUID is formatted as [xxxx_xxxxxxxxxxxxxxx], where xxxx is the idPV and xxxxxxxxxxxxxxx is the timestamp.
const payallUUID = () => {
    /* El atributo uuid es un código que identifica la transacción, este campo es generado por el cliente. 
     Los primeros 5 posiciones representan el idPV, justificado a la derecha y relleno con ceros a la izquierda, 
     seguido por un guión bajo, las siguientes 16 posiciones representan un timestamp. 
     Formato:[xxxx_xxxxxxxxxxxxxxx] * Ejemplo:[01234_01751776520726] 
     El uuid usado en este snippet es de ejemplo, ud tendra que generar el suyo como se menciono anteteriomente */
    
     // Payall idPV
    const pv = process.env.PAYALL_PV;
    // Generate a timestamp
    const timestamp = Date.now().toString().slice(0, 16); // Get the first 16 digits of the timestamp
    // Pad the pv with leading zeros to make it 5 digits
    const paddedPv = pv.padStart(5, '0');
    // Combine the pv and timestamp with an underscore
    const uuid = `${paddedPv}_${timestamp}`;
    return uuid;
  };

module.exports = payallUUID;


    
