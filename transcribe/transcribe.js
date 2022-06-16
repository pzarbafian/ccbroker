require('dotenv').config();
const fetch = require("node-fetch");

const transcribe = (audioUrl) => {

  const url = "https://api.assemblyai.com/v2/transcript";

  const params = {
    headers: {
      "authorization": process.env.ASSEMBLYAI_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify(audioUrl),
    method: "POST"
  };
  
  fetch(url, params)
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      console.log('ID:', data['id']);
    })
    .catch((error) => {
      console.error('Error:', error);
    }); 
}

transcribe();