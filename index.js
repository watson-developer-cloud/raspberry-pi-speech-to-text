var cp = require('child_process');
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

function updateLine(text) {
    cursor.horizontalAbsolute(0).eraseLine().write(text);
}

// sudo apt-get update && sudo apt-get install flac -y
var hasFlac = false;
try {
    hasFlac = !!cp.execSync('which flac').toString().trim()
} catch (ex) {
    // I think cp.execSync throws any time the exit code isn't 0
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
        updateLine('interim: ' + transcript.results[0].alternatives[0].transcript);
    });


    // set up the recognize live to handle inputs
    var transcriptInput = speech_to_text.recognizeLive({
        content_type: hasFlac ? 'audio/flac' : 'audio/l16; rate=44100',
        cookie_session: session.cookie_session,
        session_id: session.session_id
    }, function(err, transcript) {
        if (err) {
            exit(err);
        }
        lightshow.stop();
        updateLine('final: ' + transcript.results[0].alternatives[0].transcript + '\n');
    }).on('error', console.error);

    //['exit','close','end'].forEach(function(event) {
    //    transcriptInput.on(event, console.log.bind(console, 'transcript input', event));
    //});

    var mic = cp.spawn('arecord', ['--device=plughw:1,0', '--format=S16_LE', '--rate=44100', '--channels=1']); //, '--duration=10'
    //mic.stderr.pipe(process.stderr);

    if (hasFlac) {
        var flac = cp.spawn('flac', ['-0', '-', '-']);
        //flac.stderr.pipe(process.stderr);

        //require('fs').createReadStream('test.wav')
        mic.stdout.pipe(flac.stdin);
        //mic.stdout.pipe(transcriptInput);

        flac.stdout.pipe(transcriptInput);
    } else {
        mic.stdout.pipe(transcriptInput);
    }



    //mic.stdout.pipe(require('fs').createWriteStream('test.wav'));

    lightshow.blinkRed();

    //['exit','close','end'].forEach(function(event) {
    //    mic.stdout.on(event, console.log.bind(console, 'mic output', event));
    //});

    setTimeout(function() {
        mic.kill();
    }, 15* 1000);

});


