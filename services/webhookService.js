const axios = require('axios');
const {logEvents} = require('../middleware/logger');
const {getToken} = require('../cache/webhookToken');
const {msalAuthenticate} = require('../auth/serviceAuth/webhookAuth');

const instance = axios.create({
    baseURL: process.env.MS_GRAPH_API_URL,
    timeout: 4000
})

//Function to create a webhook subscription
const createSubscription = async(notificationUrl, expirationDateTime)=>{

    try{
        // Get auth token
    let token = await getToken();
    // If there is no token, re-authenticate
    if(!token){
        token = await msalAuthenticate();
    };

    const data = {
        changeType: "created",
        notificationUrl: notificationUrl + '/webhook/outlook',
        resource: process.env.MS_GRAPH_API_SUBSCRIPTION_RESOURCE,
        expirationDateTime: expirationDateTime, // Max 4230 minutes from current time
        clientState: "random_string" // Optional, for validation
    }

    console.log(data)

    // Post request
    const response =  await instance.post(process.env.MS_GRAPH_API_SUBSCRIPTION_URL, data, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } 
    })
    
    console.log(response.data)

    //Log the response
    logEvents(`MS Graph API Response: ${JSON.stringify(response.data)}`, 'graphAPILog.log');

    if(response.status == 200){
        return response.data
    }else{
        return null
    } 

    }catch(err){
        console.log(`Error creating webhook subscription: ${err}`);
        logEvents(`Error creating webhook subscription: ${JSON.stringify(err)}`, 'errLog.log')
    }
    
};

// Function to renew the subscription
const renewSubscription = async(notificationUrl, expirationDateTime, subscriptionId)=>{

    try{
        let token = await getToken();
        if(!token){
            token = await msalAuthenticate();
        }

        const data = {
            notificationUrl: notificationUrl + '/webhook/outlook',
            expirationDateTime: expirationDateTime, // Max 4230 minutes from current time
        };

        const response = await instance.patch(process.env.MS_GRAPH_API_SUBSCRIPTION_URL + `/${subscriptionId}`, data, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        //Log the response
        logEvents(`MS Graph API Response: ${JSON.stringify(response.data)}`, 'graphAPILog.log');

        if(response.status == 200){
            return response.data
        }else{
            return null
        } 
    }catch(err){
        console.log(`Error renewing webhook subscription: ${err}`);
        logEvents(`Error renewing webhook subscription: ${JSON.stringify(err)}`, 'errLog.log')
    }
};

// Function to check a subscription
const checkSubscription = async()=>{

    try {
        let token = await getToken();
        if(!token){
            token = await msalAuthenticate();
        }

        const response = await instance.get(process.env.MS_GRAPH_API_SUBSCRIPTION_URL, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });

        //Log the response
        logEvents(`MS Graph API Response: ${JSON.stringify(response.data)}`, 'graphAPILog.log');

        if(response.status == 200){
            if(response.data.value[0]){
                return response.data.value[0]
            }else{
                return null
            }
        }else{
            return null
        }    
    } catch (err) {
        console.log(`Error checking webhook subscription: ${err}`);
        logEvents(`Error checking webhook subscription: ${JSON.stringify(err)}`, 'errLog.log');

        
    }

}

// Function to check and renew or create a subscription
const checkAndRenewSubscription = async(notificationUrl)=> {

    const currentDateTime = new Date();
    const expirationDateTime = new Date(currentDateTime.getTime() + (2 * 24 * 60 * 60 * 1000));

    try {
        console.log('Checking subscription status...');

        // Check subscriptions
        const subscriptionData = await checkSubscription();

        if (!subscriptionData) {
            console.log('Subscription expired or missing. Creating a new one...');
            
            // Create Subscription
            const newSubscriptionResponse = await createSubscription(notificationUrl, expirationDateTime);
            console.log(`Subscription created: ${newSubscriptionResponse}`);
            logEvents(`Subscription created: ${JSON.stringify(newSubscriptionResponse)}`, 'graphAPILog.log');
            return newSubscriptionResponse;
        } else {

            // Subscription expiration time (ensure this is a Date object)
            const subscriptionExpiration = new Date(subscriptionData.expirationDateTime); // Convert if needed
            
            // Calculate subscription time left in days
            const subscriptionTimeLeft = (subscriptionExpiration - currentDateTime) / (1000 * 60 * 60 * 24);

            // Update if notificationUrl changed or if there is less than a day left
            if (subscriptionData.notificationUrl !== (notificationUrl + '/webhook/outlook') || subscriptionTimeLeft < 1 ){ 
                if(subscriptionData.notificationUrl !== (notificationUrl + '/webhook/outlook'))
                    console.log(`Subscription url ${subscriptionData.notificationUrl} is different from ${notificationUrl + '/webhook/outlook'}. Updating...`)    
                else if(subscriptionTimeLeft < 1)
                    console.log(`Subscription has ${subscriptionTimeLeft.toFixed(2)} days left. Updating...`);
                
                const subscriptionId = subscriptionData.id;

                //Renew the subscription
                const subscriptionUpdateResponse = await renewSubscription(notificationUrl, expirationDateTime, subscriptionId);
                return subscriptionUpdateResponse;
            }else{
                console.log(`Subscription is valid for ${subscriptionTimeLeft.toFixed(2)} days. No update needed.`);
            }
        }
    } catch (err) {
        console.error('Error checking, updating or creating subscription:', err);
        logEvents(`Error checking, updating or creating subscription: ${JSON.stringify(err)}`, 'errLog.log')

    }
}

// Function to fetch the email content, granted an email ID
const fetchEmailContent = async(emailId)=>{
    try{
        // Get auth token
        let token = await getToken();
        // If there is no token, re-authenticate
        if(!token){
            token = await msalAuthenticate();
        };

        // Get request
        const response = await instance.get(process.env.MS_GRAPH_API_GET_USER_MESSAGES_URL + emailId, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        
        //Log the response
        logEvents(`MS Graph API Response: ${JSON.stringify(response.data)}`, 'graphAPILog.log');

        if(response.status == 200){
            return response.data
        }else{
            return null
        }    
    }catch(err){
        console.log(err);
        logEvents(`Error: ${err}`, 'errLog.log')
    }
};


module.exports = {fetchEmailContent, checkAndRenewSubscription}