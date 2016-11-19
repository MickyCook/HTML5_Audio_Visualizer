// global vars
var aContext = new AudioContext();

var analyser = aContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

var javascriptNode = aContext.createScriptProcessor(2048, 1, 1);

var canvas = document.getElementById('noise-glitch'),
context = canvas.getContext('2d'),
img = new Image(),
w,
h,
offset,
glitchImg,
glitchInterval;

$(function(){
    function canvasInitialize(width, height) {
        // Set canvas parameters
        getCanvas().width = width;
        getCanvas().height = height;

        // Outline
        getCanvas().getContext('2d').clearRect(0,0,width,height);
        canvasDrawSquare(0,0,width,height);
    }

    function getAverageVolume(array) {
        var values = 0; 
        // get all the frequency amplitudes
        for (var i = 0; i < array.length; i++) {
            values += array[i];
        }
        return values / (array.length);
    }

    var clear = function() {
        context.rect(0, 0, w, h);
        context.fillStyle = '#ece5db';
        context.fill();
    };

    function onSuccess(stream) {
        
        var mediaStreamSource = aContext.createMediaStreamSource(stream);
        // console.log(mediaStreamSource);
        var avg;

        javascriptNode.onaudioprocess = function(e) {
            // get the average, bincount is fftsize / 2
            var array =  new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            
            // calculate average
            var average = getAverageVolume(array);
            
            // print value out
            //console.log(average);
            avg = average;
            return(avg);
        };
        
        // stream -> mediaSource -> analyser -> javascriptNode -> destination
        mediaStreamSource.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(aContext.destination);

        var randInt = function(a, b) {
            return ~~(Math.random() * (b - a) + a);
        };

        canvas.width = 640;
        canvas.height = 360;

        h = canvas.height;
        w = canvas.width;

        img.src = 'http://steadcast.steadfastlight.com/wp-content/themes/SteadCast/assets/images/home/podcast-distortion.png';

        var glitchImg = function() {
            for (var i = 0; i < Math.floor(avg); i++) {
                var x = (Math.random() * w / 100);
                if(i % 2){ x = x * -1; }
                var y = Math.random() * h;
                var spliceWidth = w - x;
                var spliceHeight = randInt(5, h / 3);
                context.drawImage(canvas, 0, y, spliceWidth, spliceHeight, x, y, spliceWidth, spliceHeight);
                context.drawImage(canvas, spliceWidth, y, x, spliceHeight, 0, y, x, spliceHeight);
            }
        };

        var init = function() {
            clearInterval(glitchInterval);
            canvas.width = w = window.innerWidth;
            offset = w * 0.1;
            canvas.height = h = ~~(img.height * ((w - offset) / img.width));
            glitchInterval = setInterval(function() {
                clear();
                context.drawImage(img, 0, 0, img.width, img.height, offset, 0, w - (offset * 2), h);
                setTimeout(glitchImg, randInt(100, 300));
            }, 100);
        };

        img.onload = function() {
            init();
            window.onresize = init;
        };
    }

    function onError() {
        alert('Please refresh and give us permission to use your microphone');
    }
      
    navigator.webkitGetUserMedia({video: false, audio: true}, onSuccess, onError);

});