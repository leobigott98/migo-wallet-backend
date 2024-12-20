const {logEvents} = require('../middleware/logger');
const {fetchEmailContent} = require('../services/webhookService');
const {processEmail} = require('../services/zelleService');

const receiveNotification = async (req, res) => {
    // Validate the subscription request
    if (req.query.validationToken) {
        return res.send(req.query.validationToken); // Echo back the token for validation
    }

    // Process the notification
    const notification = req.body;
    logEvents(`Received notification: ${JSON.stringify(notification)}`, 'webhookLog.log');
    console.log('Received notification:', notification);

    // Extract the resource string
    const resource = notification.value[0].resource;

    // Use regex to extract the message ID
    const messageIdMatch = resource.match(/Messages\/([^/]+)/);
    const messageId = messageIdMatch ? messageIdMatch[1] : null;

    console.log('Message ID:', messageId);

    // Fetch the email content
    const emailContent = await fetchEmailContent(messageId);

    // Process the email to add money if it's the case
    const emailProcessing = await processEmail(emailContent);

    console.log(emailProcessing);

    // Extract and process email details (you may need to query Microsoft Graph)
    // Example: notification.value[0].resource
    res.status(202).send();
};

module.exports = {receiveNotification}