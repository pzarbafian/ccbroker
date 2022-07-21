const https = require('https');
const fs = require('fs');
const platformClient = require("purecloud-platform-client-v2");
require('dotenv').config();
const client = platformClient.ApiClient.instance;
const conversations = [];
let voicemessageId = "";
const access_token = process.env.ACCESS_TOKEN;
const voicemailUris = [];
const getVoicemail = () => {
  const getVoicemailUrl = (voicemessageId) => {
    client.setEnvironment(platformClient.PureCloudRegionHosts.ca_central_1); // Genesys Cloud region
      // Manually set auth token or use loginImplicitGrant(...) or loginClientCredentialsGrant(...)
    client.setAccessToken(access_token);
    let apiInstance = new platformClient.VoicemailApi();
    console.log("messageIsd= ", voicemessageId)
    let messageId = voicemessageId; // String | Message ID
    let opts = {
      "formatId": "WAV" // String | The desired media format.
    };
    // Get media playback URI for this voicemail message
    apiInstance.getVoicemailMessageMedia(messageId, opts)
      .then((data) => {
        voicemailUris.push(data.mediaFileUri)
        if (voicemailUris[0]) {
          downloadVoicemail(voicemailUris[0])
        }
      })
      .catch((err) => {
        console.log("There was a failure calling getVoicemailMessageMedia");
        console.error(err);
      });
    return true
  }

  const downloadVoicemail = (url) => {
    https.get(url, resp => resp.pipe(fs.createWriteStream(`voicemails/${voicemessageId}.WAV`)));
    fs.readFile('voicemails.json', (err, data) => {
      const voicemails = JSON.parse(data);
      const filenames = fs.readdirSync('voicemails');
      for (const filename of filenames) {
        if (!voicemails['filenames'].includes(filename)) {
          voicemails['filenames'].push(filename)
        }
      }
      fs.writeFileSync('voicemails.json', JSON.stringify(voicemails), (err, data) => {
      })
    });

  }

  const getMessageId = () => {
    client.setEnvironment(platformClient.PureCloudRegionHosts.ca_central_1); // Genesys Cloud region
    // Manually set auth token or use loginImplicitGrant(...) or loginClientCredentialsGrant(...)
    client.setAccessToken(access_token);
  let apiInstance = new platformClient.VoicemailApi();
  let queueId = process.env.QUEUE_ID; // String | Queue ID
  let opts = { 
    'pageSize': 25, // Number | Page size
    'pageNumber': 1 // Number | Page number
  };
  apiInstance.getVoicemailQueueMessages(queueId, opts)
    .then((data) => {
      // console.log(`getVoicemailQueueMessages success! data: ${JSON.stringify(data.entities[0], null, 2)}`);
      for (const entity of data.entities) {
        conversations.push({
          id: entity.id,
          conversation: entity.conversation,
          caller: entity.callerAddress,
          date: entity.createdDate
        })
      }
      voicemessageId = conversations[0].id;
      // console.log(voicemessageId)
      getVoicemailUrl(voicemessageId);
    })
    .catch((err) => {
      console.log('There was a failure calling getVoicemailQueueMessages');
      console.error(err);
    });
  }
  getMessageId();
}

module.exports = { getVoicemail };
