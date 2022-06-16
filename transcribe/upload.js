require('dotenv').config();
const fetch = require("node-fetch");
const fs = require('fs');
const {download} = require('./download');
const upload = () => {
  let audioUrl = "";
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
    let id = "";
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
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  

upload();
module.exports = { transcribe };
