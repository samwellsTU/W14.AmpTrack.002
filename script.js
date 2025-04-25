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

const a2db = function (amp) {
  return 20 * Math.log10(amp);
};

let runningAvg = new Array(10);
runningAvg.fill(0);

const dataSmooth = function (newDatum) {
  let sum = 0;
  runningAvg.shift();
  runningAvg.push(newDatum);
  runningAvg.forEach((dataPoint) => {
    sum += dataPoint;
  });
  let mean = sum / runningAvg.length;
  return mean;
};

const rms = function (sampleArray) {
  let sum = 0;
  sampleArray.forEach((indvSamp) => {
    sum += indvSamp * indvSamp;
  });

  let mean = sum / sampleArray.length;
  return Math.sqrt(mean);
};

const ampTrack = function () {
  const data = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(data);
  let myRMS = rms(data);
  let myDB = a2db(myRMS);
  let smoothedDB = dataSmooth(myDB);
  let cutoff = (smoothedDB - -80) * (4900 / 90) + 100;
  if (cutoff != -Infinity) {
    filter.frequency.linearRampToValueAtTime(cutoff, myCtx.currentTime + 0.1);
  }

  document.getElementById("dBDisp").innerText = `${smoothedDB.toFixed(
    2
  )} dB FS`;
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
