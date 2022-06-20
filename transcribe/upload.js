require('dotenv').config();
const fetch = require("node-fetch");
const fs = require('fs');
let transcript_id = "";
const upload = () => {
  const url = "https://api.assemblyai.com/v2/upload";
  
  let args = process.argv.slice(2);
  let audioPath = args[0];
  
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
        transcript_id = data['id']
        return transcript_id;
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    }
  

upload();
module.exports = { transcript_id };
