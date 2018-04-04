var express = require('express');
var http = require('http');
var WebSocket = require('ws');
var url = require('url');
var cookie = require('cookie');
var jpickle = require('jpickle');
var redis = require('redis');

var app = express();

var redisClient = redis.createClient(6379, '127.0.0.1');

var server = http.createServer(app);
var wss = new WebSocket.Server({server});

wss.on('connection', function connection(ws, req) {
	var location = url.parse(req.url, true);

	ws.on('open', function open() {
		console.log('Connected from client');
	});

	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});

	ws.on('close', function close() {
		clearInterval(intervalObj);
		console.log('Disconnected');
	});

	console.log('Cookie : '+req.headers.cookie);
	var cookies = cookie.parse(req.headers.cookie);
	var sid = cookies['qara_sc'];

	if (sid) {
		redisClient.get('sessiion:'+sid, function(err, data) {
			if(err) {
				console.log(err);
				return;
			}
			decoded_data = jpickle.loads(data);
			ws.send('Welcome web push : '+decoded_data['username']);
		});
	}

	var intervalObj = setInterval(function() {
		ws.send('Message from websocket server : ' + (new Date()));
	}, 1000);
	
});

server.listen(5003, function listening() {
	console.log('Listening on %d', server.address().port);
});
