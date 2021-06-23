import { hslToRgb } from './utils';

const WIDTH = 1200;
const HEIGHT = 700;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;
let analyzer;
let bufferLength;

function handleError(err) {
  console.log('You must give acces to your mic in order to procide');
}

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(handleError);
  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyzer);
  //   how much data should we collect
  analyzer.fftSize = 2 ** 10;
  //   pull the data oof the audio
  // how many pices of data are there
  bufferLength = analyzer.frequencyBinCount;
  const timeData = new Uint8Array(bufferLength);
  const frequencyData = new Uint8Array(bufferLength);
  drawTimeData(timeData);
  drawFrecuency(frequencyData);
}

function drawTimeData(timeData) {
  // inject the time data into our timeData array
  analyzer.getByteTimeDomainData(timeData);
  // now that we have the data, lets turn it into something visual

  // 1. Clear the canvas TODO;
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  // 2. Set some canvas drawing
  ctx.strokeStyle = '#ffc600';
  ctx.lineWidth = 10;
  ctx.beginPath();
  const sliceWidth = WIDTH / bufferLength;
  let x = 0;
  timeData.forEach((data, i) => {
    const v = data / 128;
    const y = (v * HEIGHT) / 2;
    // Draw our lines
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  });

  ctx.stroke();

  //   call itself as soon as possible
  requestAnimationFrame(() => drawTimeData(timeData));
}

function drawFrecuency(frequencyData) {
  // get the frecuency data into our frencuecyData array
  analyzer.getByteFrequencyData(frequencyData);
  // figure out the bar width
  const barWidth = (WIDTH / bufferLength) * 2.5;
  console.log(barWidth);
  let x = 0;
  frequencyData.forEach(amount => {
    //   0 to 255
    const percent = amount / 255;
    const [h, s, l] = [360 / (percent * 360) - 0.5, 0.8, 0.5];
    const barHeight = HEIGHT * percent * 1.2;
    // TODO: conver the colour to hsl
    const [r, g, b] = hslToRgb(h, s, l);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    x += barWidth + 2;
  });

  requestAnimationFrame(() => drawFrecuency(frequencyData));
}

getAudio();
