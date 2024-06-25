const URL = 'https://teachablemachine.withgoogle.com/models/Hy4w5e7f1/';
const THRESHOLD = 0.6;
let listening = false;

window.onload = () => {
  let recognizer;

  async function createModel() {
    const checkpointURL = URL + 'model.json';
    const metadataURL = URL + 'metadata.json';

    recognizer = speechCommands.create(
      'BROWSER_FFT',
      undefined,
      checkpointURL,
      metadataURL
    );

    await recognizer.ensureModelLoaded();

    return recognizer;
  }

  async function init() {
    recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    recognizer.listen(
      async (result) => {
        const Moby = result.scores[1];
        if (Moby > THRESHOLD && !listening) {
          listening = true;
          await speak("Hey");
          console.log("Done speaking");
          listening = false;
        }
      },
      {
        includeSpectrogram: true,
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.5
      }
    );
  }

  init(); // Call the init function to start the recognizer
};

function addMessage({ role, content }) {
  let message = document.createElement('div');
  message.innerText = content;
  document.body.appendChild(message); // Ensure the message is appended to the document
  message.scrollIntoView(false); // Scroll to the message
}

async function speak(message) {
  return new Promise((resolve, reject) => {
    let synth = window.speechSynthesis;
    if (synth) {
      let utterance = new SpeechSynthesisUtterance(message);
      const voices = synth.getVoices();
      utterance.voice = voices[voices.findIndex(voice => voice.name === 'Good News')];
      utterance.rate = 1;

      synth.cancel();
      synth.speak(utterance);
      utterance.onend = resolve;
    } else {
      reject('speechSynthesis not supported');
    }
  });
}
