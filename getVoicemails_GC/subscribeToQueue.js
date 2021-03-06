const platformClient = require('purecloud-platform-client-v2');
const WebSocketClient = require('websocket').client;
const client = platformClient.ApiClient.instance;
const voice = require('./getVoicemail')
require('dotenv').config();

// Get client credentials from environment variables
const CLIENT_ID = process.env.GENESYS_CLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.GENESYS_CLOUD_CLIENT_SECRET;
const ORG_REGION = process.env.GENESYS_CLOUD_REGION; // eg. us_east_1
const websocketClient = new WebSocketClient();
// API instances
const notificationsApi = new platformClient.NotificationsApi();
// Additional configuration variables
const queueId = 'b8544dae-74dd-4c0f-b4bb-c3b3d2992558';
const subscriptionTopic = `v2.routing.queues.${queueId}.conversations`;
let disconnected = false;
// Define the callbacks for the websocket listener
websocketClient.on('connect', connection => {
    console.log('WebSocket client connected and listening...');
    connection.on('message', message => {
        let data = JSON.parse(message.utf8Data);
        let topic = data.topicName;
        let eventBody = data.eventBody;
        if(topic == subscriptionTopic){
            let conversation = eventBody;
            let customer = conversation.participants
                            .filter(p => p.purpose == 'customer')[0];
            let voicemail = conversation.participants
                            .filter(p => p.purpose == 'voicemail')[0];
            // Some messages based on events that are happening on the queue
            if(customer && !voicemail){
                console.log(`Customer ${customer.id} is waiting on queue.`);
            }
            if(voicemail && voicemail.connectedTime){
                console.log(`voicemail has accepted conversation with ${customer.id}`);
            }
            if(voicemail?.endTime && customer.calls[0].disconnectedTime){
                    console.log(`Customer ${customer.id} disconnected from conversation`);
                    disconnected = true;
            }
        }
        
        // For heartbeats
        if(topic == 'channel.metadata'){
            if(disconnected) {
                voice.getVoicemail();
                disconnected = false;
            }
            console.log("Heart Beat")
        }
    });
});

websocketClient.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

// Set environment
const environment = platformClient.PureCloudRegionHosts[ORG_REGION];
if(environment) client.setEnvironment(environment);

// Log in with Client Credentials
client.loginClientCredentialsGrant(CLIENT_ID, CLIENT_SECRET)
.then(() => {
    console.log('Authentication successful');
    return notificationsApi.postNotificationsChannels()
})
.then(data => {
    console.log('Channel created');

    let websocketUri = data.connectUri;
    let channelId = data.id;
    websocketClient.connect(websocketUri);

    // Add the subscription for queue events
    let topic = [{id: subscriptionTopic}];
    return notificationsApi.postNotificationsChannelSubscriptions(channelId, topic);
})
.then(data => {
    console.log('Subscribed to Queue');
})
.catch(e => console.error(e));

// NOTE: This next line is a simple way to make sure the app runs 'forever'
// In production you'd want the actual code running as a process/service
// setInterval(() => {}, 1 << 30);
