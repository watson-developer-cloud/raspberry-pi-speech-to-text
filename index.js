var spawn = require('child_process').spawn;
var watson = require('watson-developer-cloud');
var lightshow = require('./lightshow');
require('dotenv').load();


lightshow.start();

var mic = spawn('arecord', ['--device=plughw:1,0', '--format=S16_LE', '--rate=44100', '--channels=1']);
mic.stderr.pipe(process.stderr);
mic.on('exit', console.log.bind(console, 'exit'));

var speech_to_text = watson.speech_to_text({
    username: process.env.STT_USERNAME,
    password: process.env.STT_PASSWORD,
    version: 'v1',
    url: 'https://stream.watsonplatform.net/speech-to-text/api'
});

var params = {
    audio: mic.stdout, // todo: pipe through a compression stream to (hopefully) avoid buffer overruns
    content_type: 'audio/l16; rate=44100',
    continuous: true // todo: figure out how to make this send back a stream of data instead of a big blob of json at the end
};

speech_to_text.recognize(params)
    .pipe(process.stdout)
    .on('error', console.error);

setTimeout(function() {
    mic.kill();
    lightshow.stop();
}, 15* 1000);
