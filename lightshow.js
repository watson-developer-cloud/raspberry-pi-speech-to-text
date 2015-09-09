var Gpio = require('onoff').Gpio,
//https://github.com/pimoroni/explorer-hat/blob/master/documentation/GPIO-pins.md
    blue = new Gpio(4, 'out'),
    yellow = new Gpio(17, 'out'),
    red = new Gpio(27, 'out'),
    green = new Gpio(5, 'out'),
    leds = [blue, yellow, red, green],
    index = 0,
    interval;


function spinner() {
    leds[0].write(1);
    interval = setInterval(function() {
        var led = leds[index%leds.length];
        led.write(0);
        index++;
        led = leds[index%leds.length];
        led.write(1);
    }, 100);
}

function stop() {
    clearInterval(interval);
    var led = leds[index%leds.length];
    led.write(0);
}

function blinkRed() {
    stop();
    index = 2; // so that the stop command knows which led to turn off once we're done here
    var isOn = true;
    red.write(isOn);
    interval = setInterval(function() {
        isOn = !isOn;
        red.write(isOn ? 1 : 0);
    }, 400);
}

exports.start = spinner;
exports.blinkRed = blinkRed;
exports.stop = stop;

