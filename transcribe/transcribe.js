// Imports the Google Cloud client library
const fs = require('fs');
const speech = require('@google-cloud/speech');

const trnascribe = async () => {
  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  const path = '../getVoicemails_GC/voicemails/'

  const filenames = fs.readdirSync('../getVoicemails_GC/voicemails');
  for (const file of filenames) {
    let audioPath = path + file;
    //  console.log(audioPath)
    // fs.readFile(audioPath, (err, data) => {
    //  if (err) {
    //    return console.log(err);
    //  }
    const filename = audioPath;
    const encoding = 'LINEAR16';
    const sampleRateHertz = 16000;
    const languageCode = 'en-US';

    const config = {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
    };
    const audio = {
      content: fs.readFileSync(filename).toString('base64'),
    };

    const request = {
      config: config,
      audio: audio,
    };

    // Detects speech in the audio file
    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');
    console.log('Transcription: ', transcription);
  }
}

trnascribe();
