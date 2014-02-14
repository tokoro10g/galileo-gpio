"use strict";
var fs = require("fs"),
	path = require("path");

var sysFsPath = "/sys/class/gpio";

var pinMapping = {
	"3": 18,
	"4": 28,
	"5": 17,
	"13": 39
};

function noop(){}

function handleExecResponse(method, pinNumber, callback) {
	return function(err, stdout, stderr) {
		if(err) {
			console.error("Error when trying to", method, "pin", pinNumber);
			console.error(stderr);
			callback(err);
		} else {
			callback();
		}
	}
}

function sanitizePinNumber(pinNumber) {
	return pinNumber;
}

function sanitizeDirection(direction) {
	direction = (direction || "").toLowerCase().trim();
	if(direction === "in" || direction === "input") {
		return "in";
	} else if(direction === "out" || direction === "output" || !direction) {
		return "out";
	} else {
		throw new Error("Direction must be 'input' or 'output'");
	}
}

var gpio = {
	open: function(pinNumber, direction, callback) {
		pinNumber = sanitizePinNumber(pinNumber);

		if(!callback && typeof direction === "function") {
			callback = direction;
			direction = "out";
		}

		direction = sanitizeDirection(direction);
		fs.writeFile(sysFsPath + "/export" , pinMapping[pinNumber] , callback);
		gpio.setDirection(pinNumber, direction, callback);
	},

	setDirection: function(pinNumber, direction, callback) {
		pinNumber = sanitizePinNumber(pinNumber);
		direction = sanitizeDirection(direction);

		fs.writeFile(sysFsPath + "/gpio" + pinMapping[pinNumber] + "/direction", direction, callback);
	},

	getDirection: function(pinNumber, callback) {
		pinNumber = sanitizePinNumber(pinNumber);

		fs.readFile(sysFsPath + "/gpio" + pinMapping[pinNumber] + "/direction", "utf8", function(err, direction) {
			if(err) return callback(err);
			callback(null, sanitizeDirection(direction.trim()));
		});
	},

	close: function(pinNumber, callback) {
		pinNumber = sanitizePinNumber(pinNumber);

		fs.writeFile(sysFsPath + "/unexport" , pinMapping[pinNumber] , callback);
	},

	read: function(pinNumber, callback) {
		pinNumber = sanitizePinNumber(pinNumber);

		fs.readFile(sysFsPath + "/gpio" + pinMapping[pinNumber] + "/value", function(err, data) {
			if(err) return (callback || noop)(err);

			(callback || noop)(null, parseInt(data, 10));
		});
	},

	write: function(pinNumber, value, callback) {
		pinNumber = sanitizePinNumber(pinNumber);

		value = !!value?"1":"0";

		fs.writeFile(sysFsPath + "/gpio" + pinMapping[pinNumber] + "/value", value, "utf8", callback);
	}
};

gpio.export = gpio.open;
gpio.unexport = gpio.close;

module.exports = gpio;
