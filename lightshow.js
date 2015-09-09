var Gpio = require('onoff').Gpio,
//https://github.com/pimoroni/explorer-hat/blob/master/documentation/GPIO-pins.md
    blue = new Gpio(4, 'out'),
    yellow = new Gpio(17, 'out'),
    red = new Gpio(27, 'out'),
    green = new Gpio(5, 'out'),
    leds = [blue, yellow, red, green],
    index = 3,
    interval;


function start() {
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

exports.start = start;
exports.stop = stop;

