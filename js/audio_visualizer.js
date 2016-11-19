var media = [
      "https://dl.dropboxusercontent.com/u/617747341/SteadCast/062_thefeed.mp3",
      "https://dl.dropboxusercontent.com/u/617747341/SteadCast/new_year_dubstep_minimix.ogg"
   ],
   fftSize = 1024,
   AudioContext = (window.AudioContext || window.webkitAudioContext),
   playing = false,
   startedAt, pausedAt,
   rotation = 0,
   avg, ctx, actx, asource, gainNode, analyser, frequencyData, frequencyDataLength, timeData;

window.addEventListener('load', initialize, false);

function initialize() {
	if (!AudioContext) {
	    // Feature Not Supported
	}

	ctx = document.createElement('canvas').getContext('2d');
	actx = new AudioContext();

	document.body.appendChild(ctx.canvas);
	initializeAudio();
}

function initializeAudio() {
    var xmlHTTP = new XMLHttpRequest();

    console.log("- Loading Audio Buffer -");

    xmlHTTP.open('GET', media[1], true);
    xmlHTTP.responseType = "arraybuffer";

    xmlHTTP.onload = function(e) {
        console.log("- Decoding Audio File Data -");
        analyser = actx.createAnalyser();
        analyser.fftSize = fftSize;
        analyser.minDecibels = -100;
        analyser.maxDecibels = -30;
        analyser.smoothingTimeConstant = 0.8;

        actx.decodeAudioData(this.response, function(buffer) {
            console.log('decoding audio data');
            console.log(buffer);
            audio_buffer = buffer;
            gainNode = actx.createGain();
            gainNode.connect(analyser);
            analyser.connect(actx.destination);

            frequencyDataLength = analyser.frequencyBinCount;
            frequencyData = new Uint8Array(frequencyDataLength);
            timeData = new Uint8Array(frequencyDataLength);

        }, function(e) { alert("Error decoding audio data" + e.err); });
    };

    xmlHTTP.send();
}


function getAvg(values) {
    var value = 0;

    values.forEach(function(v) {
        value += v;
    })

    return value / values.length;
}
