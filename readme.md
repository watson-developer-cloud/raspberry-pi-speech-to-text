Raspberry Pi & IBM Watson Speech to Text
========================================

## DEPRECATED: this repo is no longer actively maintained. It can still be used as reference, but may contain outdated or unpatched code.

Make your Pi listen to your speech and transcribe the results to the console. 

See the recently transcribed text occasionally change as Watson decides on a new translation based on added context.

Also see https://github.com/watson-developer-cloud/raspberry-pi-time-weather-demo for an example of using Text to Speech on a Raspberry Pi

**Note:** While this example should still work, it uses the older REST API, which is a bit more complicated than the newer Websocket-based API. The current recomendation is to use `createRecognizeStream` ([example](https://github.com/watson-developer-cloud/node-sdk/blob/master/examples/speech_to_text.v1.js)) instead of `createSession` + `observeResult` + `recognizeLive`. (This code should be updated sometime soon.)

## Requirements:

* **Raspberry Pi** - Tested on a Model B 2 (1GB)
* **Node.js** - Tested and working on `v0.12.7`. 
  (I'm using pre-compiled binaries from http://conoroneill.net/node-v01040-and-v0127-for-arm-v7-raspberry-pi-2-banana-pi-odroid-c1-available)
  It was tested on `v4.0.0` but at least one dependency had issues compiling.
* **Speech to Text service credentials** - 
  Log into bluemix.net, create a STT service instance, bind it to an app, click the "show credentials" link in the app's dashboard.
  Then put the username and password in either index.js or the `STT_USERNAME` and `STT_PASSWORD` environment variables. 
  You can also put them into a `.env` file which will be automatically parsed by https://www.npmjs.com/package/dotenv
* **USB Microphone** - Tested with the following:
  * Kinobo X000NPSKOB
  * Logitech Mobile Speakerphone P710e (connected via USB, not tested over bluetooth)
  * PS3 Eye
  * StarTech Stereo Audio USB Sound Card ICUSBAUDIOMH
  * Should work with any other Microphone that plays nice with ALSA

## Recommendations:

* **FLAC** - Compresses the audio before uploading - `sudo apt-get update && sudo apt-get install flac -y`
* **LEDs** - To indicate when the system is "working" and when it's recording. 
  I'm using a Pimoroni Explorer HAT Pro, but a few LEDs and a breadboard would do. 
  See `lightshow.js` for what colors go on what pins.

## Setup

Download the code and run `npm install` in the directory.

## Running

Run `node index.js`, wait for the red LED to begin blinking, and then start talking. 

If you don't see any text after a moment or two, make sure that you're online, your mic is unmuted, and the `arecord` and `aplay` commands can record and play back sound.

## Todo:

* Test on a PI 1
* Add lots of links and cleanup the documentation
* Shoot a video of it in action
