const http = require("https");
const querystring = require('querystring');
const platformClient = require("purecloud-platform-client-v2");
const client = platformClient.ApiClient.instance;
const conversations = [];
let voicemessageId = "";
let token_type = "";
let access_token = "";
const getVoicemail = () => {
  const clientId = "00cd1850-dfa8-4312-a314-48e7b728429f";
  const clientSecret = "pDViNxJlLaNOgdv29pUwH07XXIckK4KAEcTfiLWoH24";
  const authUri = "login.cac1.pure.cloud";
  const apiUri = "api.cac1.pure.cloud";
  
  const options = {
    'method': 'POST',
    'hostname': authUri,
    'port': null,
    'path': '/oauth/token',
    'headers': {
      'authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
      'content-type': 'application/x-www-form-urlencoded'
    }
  }
  //api call

  const getVoicemailUrl = (voicemessageId) => {

    client.setEnvironment(platformClient.PureCloudRegionHosts.ca_central_1); // Genesys Cloud region

    // Manually set auth token or use loginImplicitGrant(...) or loginClientCredentialsGrant(...)
    client.setAccessToken(access_token);
    

    let apiInstance = new platformClient.VoicemailApi();

    let messageId = voicemessageId; // String | Message ID
    let opts = { 
      "formatId": "WEBM" // String | The desired media format.
    };

    // Get media playback URI for this voicemail message
    apiInstance.getVoicemailMessageMedia(messageId, opts)
      .then((data) => {
        console.log(`getVoicemailMessageMedia success! data: ${JSON.stringify(data, null, 2)}`);
      })
      .catch((err) => {
        console.log("There was a failure calling getVoicemailMessageMedia");
        console.error(err);
      });
  }
  
  const makeNextRequest = (body) => {
    token_type = body.token_type;
    access_token = body.access_token;
    options.method = 'GET',
    options.hostname = apiUri,
    options.path = '/api/v2/voicemail/queues/b8544dae-74dd-4c0f-b4bb-c3b3d2992558/messages',
    options.headers = {
      'authorization': body.token_type + ' ' + body.access_token,
      'content-type': 'application/json' 
    }
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks));
        for(const entity of body.entities) {
          conversations.push({
            id: entity.id,
            conversation: entity.conversation,
            caller: entity.callerAddress,
            date: entity.createdDate
          })
        }
        voicemessageId = conversations[0].id;
        console.log(voicemessageId)
        getVoicemailUrl(voicemessageId);
      });
    });
    req.end();

    // console.log(voicemessageId);
  // return conversations;
  }  
  
  // auth request
  const req = http.request(options, (res) => {
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
      const body = JSON.parse(Buffer.concat(chunks));
      makeNextRequest(body);
    });
  })
  req.write(querystring.stringify({grant_type: 'client_credentials'}));
  req.end();
}
// getVoicemail();
module.exports={ getVoicemail, conversations};