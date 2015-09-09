var cp = require('child_process');
var watson = require('watson-developer-cloud');
var lightshow = require('./lightshow');
var ansi = require('ansi');
var cursor = ansi(process.stdout);

// load environment params from a file named .env that's .gitignore'd
require('dotenv').load({silent: true});

lightshow.start();

// save bandwidth with FLAC lossless compression
// sudo apt-get update && sudo apt-get install flac -y
var hasFlac = false;
try {
    hasFlac = !!cp.execSync('which flac').toString().trim()
} catch (ex) {
    // I think cp.execSync throws any time the exit code isn't 0
}


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

function updateLine(text) {
    cursor.horizontalAbsolute(0).eraseLine().write(text);
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
        // "final" indicates that the service is done processing that bit of audio (usually after a pause)
        // in that case, add a newline so that we don't overwrite it with text from the next bit of audio
        updateLine(transcript.results[0].alternatives[0].transcript + (transcript.results[0].final ? '\n' : ''));

    });


    // set up the recognize live to handle inputs
    var transcriptInput = speech_to_text.recognizeLive({
        content_type: hasFlac ? 'audio/flac' : 'audio/l16; rate=44100',
        cookie_session: session.cookie_session,
        session_id: session.session_id,
        interim_results: true,
        continuous: true
    }, function(err /*, finalTranscript */) {
        if (err) {
            exit(err);
        }
        lightshow.stop(); // recording is over, turn off the blinky red light
    }).on('error', console.error);

    // start the recording
    var mic = cp.spawn('arecord', ['--device=plughw:1,0', '--format=S16_LE', '--rate=44100', '--channels=1']); //, '--duration=10'
    //mic.stderr.pipe(process.stderr);

    // save a local copy of your audio (in addition to streaming it) by uncommenting this
    //mic.stdout.pipe(require('fs').createWriteStream('test.wav'));

    // optionally compress, and then pipe the audio to the STT service
    if (hasFlac) {
        var flac = cp.spawn('flac', ['-0', '-', '-']);
        //flac.stderr.pipe(process.stderr);

        mic.stdout.pipe(flac.stdin);

        flac.stdout.pipe(transcriptInput);
    } else {
        mic.stdout.pipe(transcriptInput);
    }

    // alternate option for testing: comment out all of the mic/flac stuff and pipe from a file
    //require('fs').createReadStream('test.wav').pipe(transcriptInput);


    // indicate recording with a blinking red light
    lightshow.blinkRed();

    // end the recording
    setTimeout(function() {
        mic.kill();
        lightshow.stop(); // recording is over, turn off the blinky red light
    }, 45* 1000);

});


