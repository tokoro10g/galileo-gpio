var gpio = require("./galileo-gpio");

gpio.open(13, "output", function(err) {
	gpio.write(13, 1, function(err) {
		console.log(err);
	});
});
