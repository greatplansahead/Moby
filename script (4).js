const URL = 'https://teachablemachine.withgoogle.com/models/Hy4w5e7f1/';
const THRESHOLD = 0.7;
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
      result => {
        const scores = result.scores; // probability of prediction for each class
        const maxScoreIndex = scores.indexOf(Math.max(...scores));
        const prediction = classLabels[maxScoreIndex];

        if (scores[maxScoreIndex] > THRESHOLD && !listening) {
          listening = true;
          speak("Hey!").then(() => {
            process();
          });
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

  if (role === 'user') message.classList.add('user');
  else message.classList.add('system');

  document.getElementById('messages').appendChild(message);
  message.scrollIntoView(false); // Scroll to the message
}

async function speak(message) {
  return new Promise((resolve, reject) => {
    let synth = window.speechSynthesis;
    if (synth) {
      let utterance = new SpeechSynthesisUtterance(message);
      const voices = synth.getVoices();
      utterance.voice = voices.find(voice => voice.name === 'Good News');
      utterance.rate = 1;

      synth.cancel();
      synth.speak(utterance);
      utterance.onend = resolve;
    } else {
      reject('speechSynthesis not supported');
    }
  });
}

async function hear() {
  return new Promise((resolve, reject) => {
    let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.start();
    recognition.addEventListener('result', function (event) {
      let current = event.resultIndex;
      let transcript = event.results[current][0].transcript;
      recognition.stop();
      resolve(transcript);
    });
  });
}

async function answer(message) {
  return new Promise(async (resolve, reject) => {
    async function fetchData() {
      const API_KEY = ''
      const response = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages:[{
            role: 'user',
            content: "Hello!"
          }]
        })
      });
      const data = await response.json();
      console.log(data);
    }
    fetchData();
  });
}

async function process() {
  document.getElementById('result').style.display = 'block';
  hear().then(result => {
    document.getElementById('result').style.display = 'none';
    let message = { role: 'user', content: result };
    addMessage(message);
    document.getElementById("loading").style.display = 'block';
    answer(message).then(response => {
      response.role = 'system';

      addMessage(response);

      document.getElementById("loading").style.display = 'none';

      speak(response.content).then(() => {
        process();
      });
    });
  });
}
