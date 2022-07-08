const http = require("https");
const https = require('https');
// const querystring = require('querystring');
const fs = require('fs');
const platformClient = require("purecloud-platform-client-v2");
const { upload } = require("../transcribe/upload");
const client = platformClient.ApiClient.instance;
const conversations = [];
let voicemessageId = "";
let token_type = "";
let access_token = "";
const voicemailUris = [];
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
    const access_token = "lsxXkMiOcGjHKH1JVfejLHcdKGWAzWVI0CE-CoetIPyhWzcLASq_3TSbREtA4Cl1bFzVxVjuk5OaBMFV4Db-Ow"
    client.setEnvironment(platformClient.PureCloudRegionHosts.ca_central_1); // Genesys Cloud region

    // Manually set auth token or use loginImplicitGrant(...) or loginClientCredentialsGrant(...)
    client.setAccessToken(access_token);


    let apiInstance = new platformClient.VoicemailApi();

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

  const getMessageId = (body) => {
    // token_type = body.token_type;
    // access_token = body.access_token;
    access_token = 'lsxXkMiOcGjHKH1JVfejLHcdKGWAzWVI0CE-CoetIPyhWzcLASq_3TSbREtA4Cl1bFzVxVjuk5OaBMFV4Db-Ow';
    options.method = 'GET',
      options.hostname = apiUri,
      options.path = '/api/v2/voicemail/queues/b8544dae-74dd-4c0f-b4bb-c3b3d2992558/messages',
      options.headers = {
        'authorization': 'bearer' + ' ' + access_token,
        'content-type': 'application/json'
      }
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks));
        for (const entity of body.entities) {
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
  }

  // auth request
  // const req = http.request(options, (res) => {
  //   const chunks = [];
  //   res.on('data', (chunk) => chunks.push(chunk));
  //   res.on('end', () => {
  //     const body = JSON.parse(Buffer.concat(chunks));
  //     console.log(body)
  //     makeNextRequest(body);
  //   });
  // })
  // req.write(querystring.stringify({grant_type: 'client_credentials'}));
  // req.end();
  getMessageId();
}
getVoicemail();
module.exports = { getVoicemail };
