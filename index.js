var spawn = require('child_process').spawn;
var watson = require('watson-developer-cloud');
var lightshow = require('./lightshow');
var ansi = require('ansi');
var cursor = ansi(process.stdout);

// load environment params from a file named .env that's .gitignore'd
require('dotenv').load({silent: true});

lightshow.start();


var speech_to_text = watson.speech_to_text({
    username: process.env.STT_USERNAME,
    password: process.env.STT_PASSWORD,
    version: 'v1',
    url: 'https://stream.watsonplatform.net/speech-to-text/api'
});

function exit(err) {
    lightshow.stop();
    console.error(err.stack || err);
    process.exit(1);
}


// first set up a session to connect the output and input(s)
speech_to_text.createSession(null, function(err, session) {
    if (err) {
        exit(err);
    }

    // set up the live output handler
    speech_to_text.observeResult({
        cookie_session: session.cookie_session,
        session_id: session.session_id,
        interim_results: true
    }, function (err, transcript) {
        if (err) {
            exit(err);
        }
        cursor.horizontalAbsolute(0).eraseLine().write(transcript.results[0].alternatives[0].transcript);
    });


    // set up the recognize live to handle inputs
    var transcriptInput = speech_to_text.recognizeLive({
        content_type: 'audio/l16; rate=44100',
        cookie_session: session.cookie_session,
        session_id: session.session_id
    }, function(err, transcript) {
        if (err) {
            exit(err);
        }
        lightshow.stop();
        cursor.horizontalAbsolute(0).eraseLine().write(transcript.results[0].alternatives[0].transcript);
    }).on('error', console.error);

    ['exit','close','end'].forEach(function(event) {
        transcriptInput.on(event, console.log.bind(console, 'transcript input', event));
    });

    var mic = spawn('arecord', ['--device=plughw:1,0', '--format=S16_LE', '--rate=44100', '--channels=1', '--duration=10']);
    mic.stderr.pipe(process.stderr);
    mic.stdout.pipe(transcriptInput);
    lightshow.blinkRed();
    console.log('Recording...');

    ['exit','close','end'].forEach(function(event) {
        mic.stdout.on(event, console.log.bind(console, 'mic output', event));
    });


    //setTimeout(function() {
    //    mic.kill();
    //}, 15* 1000);

});


