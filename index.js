var webMidi = require("web-midi");
var stdout = require("stdout")("MIDI: ");
var noteStream = require("web-midi-note-stream");
var midiDevices = require("web-midi-devices");
var playerStream = require("note-player-stream");
var through2 = require("through2");

var player = playerStream();
var logs = logStream();

midiDevices.inputs().then(render_devices);

window.connect_device = connect_device;

var connected_map = {};

function connect_device(name) {
	if (connected_map[name]) return;

	var device = webMidi("Midi Fighter Spectra");

	var dataStream = device.pipe(noteStream());

	dataStream.pipe(stdout);
	dataStream.pipe(player);
	dataStream.pipe(logs);

	connected_map[name] = true;
	render_connected();
}

function render_devices(list) {
	document.querySelector("main").innerHTML = list.map(function (name) {
		return '<div class="option">' +
			'<button onclick="connect_device(\'' + name + '\')">' + name + "</button></div>";
	}).join("\n")
}

function render_connected() {
	document.querySelector("footer").innerHTML =
		Object.keys(connected_map).map(function (name) {
			return '<div class="connected">' + name + "</div>";
		}).join("\n");
}

function logStream() {
	var logs = [];
	var max_length = 16;
	return through2.obj(process);

	function process(data, enc, cb) {
		logs.push(data);

		if (logs.length > max_length)
			logs.shift();

		display();
		cb();
	}

	function display() {
		document
			.querySelector("aside")
			.innerHTML = logs.map(render_log).join("\n");
	}

	function render_log(data) {
		var pressed = data.pressed ? "Pressed" : "Released";
		return '<div class="log">' +
			pressed +
			": " +
			data.note +
			"</div>";
	}
}
