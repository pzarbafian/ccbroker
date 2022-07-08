require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const download = () => {
  let transcribeIds = [];
  function print(data) {
    switch (data.status) {
      case 'queued':
      case 'processing':
        console.log('AssemblyAI is still transcribing your audio, please try again in a few minutes!');
        break;
      case 'completed':
        console.log(`Success: ${data}`);
        console.log(`Text: ${data.text}`);
        break;
      default:
        console.log(`Something went wrong :-( : ${data.status}`);
        break;
    }
  }
  if (fs.existsSync('ids.json')) {
    fs.readFile('ids.json', (err, data) => {
      if (err) {
        return console.log(err);
      }
      transcribeIds = [...JSON.parse(data).ids]
      console.log(transcribeIds)
      for (const transcript_id of transcribeIds) {
        // let args = process.argv.slice(2);
        let id = transcript_id;
        // let id = args[0];
        const url = `https://api.assemblyai.com/v2/transcript/${id}`;
    
        const params = {
          headers: {
            "authorization": process.env.ASSEMBLYAI_API_KEY,
            "content-type": "application/json",
          },
          method: 'GET'
        };
        fetch(url, params)
          .then(response => response.json())
          .then(data => {
            print(data);
            console.log("helooooooooooo")
          })
          .catch((error) => {
            console.error(`Error: ${error}`);
          });
      }
    
    })
  
}
}
download();
module.exports = { download }
