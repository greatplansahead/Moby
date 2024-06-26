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
    console.log("Class labels:", classLabels);

    recognizer.listen(
      result => {
        const Moby = result.scores[1];
        console.log("Moby score:", Moby);
        if (Moby > THRESHOLD && !listening) {
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

const WIT_API_TOKEN = '';

async function sendMessage(message) {
    const response = await fetch(`https://api.wit.ai/message?v=20230624&q=${encodeURIComponent(message)}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${WIT_API_TOKEN}`
        }
    });
    const data = await response.json();
    console.log(data);
    return data;
}

function addMessage({ role, content }) {
    const message = document.createElement('div');
    message.innerText = content;
    message.classList.add(role);
    document.getElementById('messages').appendChild(message);
    message.scrollIntoView(false);
}

async function speak(message) {
    return new Promise((resolve, reject) => {
        const synth = window.speechSynthesis;
        if (synth) {
            const utterance = new SpeechSynthesisUtterance(message);
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
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.start();
        recognition.addEventListener('result', event => {
            const current = event.resultIndex;
            const transcript = event.results[current][0].transcript;
            recognition.stop();
            resolve(transcript);
        });
    });
}

async function process() {
    document.getElementById('result').style.display = 'block';
    hear().then(result => {
        document.getElementById('result').style.display = 'none';
        const message = { role: 'user', content: result };
        addMessage(message);
        document.getElementById("loading").style.display = 'block';
        sendMessage(message.content).then(response => {
            const systemMessage = { role: 'system', content: response.text };
            addMessage(systemMessage);
            document.getElementById("loading").style.display = 'none';
            speak(systemMessage.content).then(() => {
                process();
            });
        }).catch(error => {
            console.error("Error in sendMessage:", error);
            document.getElementById("loading").style.display = 'none';
        });
    }).catch(error => {
        console.error("Error in hear:", error);
    });
}

function startListening() {
    process();
}