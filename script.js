const myCtx = new AudioContext();
const analyser = myCtx.createAnalyser();
analyser.fftSize = 1024;

const saw = myCtx.createOscillator();
saw.type = "sawtooth";
saw.frequency.value = 100;

const filter = myCtx.createBiquadFilter();
filter.type = "lowpass";
filter.q = 50;
filter.frequency.value = 100;

saw.connect(filter);
filter.connect(myCtx.destination);

const ampTrack = function () {
  const data = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);
  console.log(data);
  requestAnimationFrame(ampTrack);
};

document.getElementById("start").addEventListener("click", async () => {
  myCtx.resume();
  saw.start();
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const micSource = myCtx.createMediaStreamSource(micStream);
  micSource.connect(analyser);
  ampTrack();
});
