require('dotenv').config();
const fetch = require("node-fetch");
const fs = require('fs');
let transcript_ids = {"ids":[]};
if (fs.existsSync('ids.json')){
  fs.readFile('ids.json', (err, data) => {
    if (err) {
      return console.log(err) 
    }
    console.log("data= " , JSON.parse(data))
    transcript_ids["ids"] = [...transcript_ids["ids"], ...JSON.parse(data).ids]
   })
} 
const upload = () => {
  const url = "https://api.assemblyai.com/v2/upload";
  const path = '../getVoicemails_GC/voicemails/'
  let args = process.argv.slice(2);
  // let audioPath = args[0];
  const filenames = fs.readdirSync('../getVoicemails_GC/voicemails');
  for(const filename of filenames) {
    let audioPath = path + filename;
    console.log(audioPath)
     fs.readFile(audioPath, (err, data) => {
      if (err) {
        return console.log(err);
      }
  
      const params = {
        headers: {
          "authorization": process.env.ASSEMBLYAI_API_KEY,
          "Transfer-Encoding": "chunked"
        },
        body: data,
        method: 'POST'
      };
  
      fetch(url, params)
        .then(response => response.json())
        .then(data => {
          
          console.log(data)
          console.log(`URL: ${data['upload_url']}`)
          transcribe(data['upload_url']);
          fs.unlink(audioPath, () => {});
        })
        .catch((error) => {
          console.error(`Error: ${error}`);
        });
    });
  }  

  const transcribe = (audioUrl) => {
    const url = "https://api.assemblyai.com/v2/transcript";
    const data = {
      "audio_url": audioUrl
    };
    const params = {
      headers: {
        "authorization": process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
      method: "POST"
    };
    
    fetch(url, params)
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        console.log('ID:', data['id']);
        // download(data['id']);
        console.log("transcribe_ids = ", transcript_ids)
        transcript_ids["ids"].push(data['id'])
        fs.writeFileSync('ids.json', JSON.stringify(transcript_ids), (err, data) => {})
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }
  upload();
module.exports = { upload };
