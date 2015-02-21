var FlieSystem = require('fs');
var Q = require('q');
var Client = require('ssh2').Client;

var SshConnector = function(host, port, username, sshKeyPath) {

	var connectParams = {
		privateKey: FlieSystem.readFileSync(sshKeyPath),
		host: host,
		port: port,
		username: username
	};
	this.run = function(command) {
		var defered = Q.defer();
		var conn = new Client();
		conn.on('ready', function() {
			conn.exec(command, function(err, stream) {
				var buffer = '';
				if (err) {
					defered.reject(err);
				}
				stream.on('data', function(data) {
					console.log(data);
					buffer += data;
				});
				stream.on('close', function() {
					defered.resolve(buffer);
					conn.end();
				});
			});
		})
		conn.connect(connectParams);

		return defered.promise;
	};

	this.stream = function(command) {
		var onDataFn;
		var connStream;
		var conn = new Client();
		conn.on('ready', function() {
			conn.exec(command, function(err, stream) {
				connStream = stream;
				var buffer = '';
				if (err) {
				}
				stream.on('data', function(data) {
					if (onDataFn) {
						onDataFn(data);
					}
				});
				stream.on('close', function() {
					//conn.end();
				});
			});
		});
		conn.connect(connectParams);

		var actions = {
			onData: function(_onDataFn) {
				onDataFn = _onDataFn;
			},
			close: function() {
				if (connStream) {connStream.end();}
				if (conn) {conn.end();}
			}
		};

		return actions;
	};

};

exports = SshConnector;