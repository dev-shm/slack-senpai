var https = require('https');
var Slack = require('slack-client');

var token = process.env.SLACK_TOKEN;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);
var channel = null;

var userData = [];

var writeToChannel = function(message) {
	var channel = slack.getChannelByName('#anime');
	channel.send(message);
};

var checkUserData = function() {
	checkStory('', evalStory);
	checkStory('', evalStory);
	checkStory('', evalStory);
};

var evalStory = function(username, data) {
	//console.log(data);
	var values = JSON.parse(data);
	console.log(values);
	writeToChannel('I got ' + values.length + ' stories for ' + username);
};

var checkStory = function(username, callback) {
	console.log("Checking " + username);
	var options = {
		host: 'hummingbird.me',
		port: 443,
		path: '/api/v1/users/' + username + '/feed/',
		method: 'GET'
	};

	https.request(options, function(res) {
		console.log('STATUS: ' + res.statusCode);
		console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.setEncoding('utf8');
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			callback(username, body);
	});
	}).end();
};

slack.on('open', function () {
	console.log("Connection established!");
	var channel = slack.getChannelByName('#anime');
	var general = slack.getChannelByName('#general');
	setTimeout(checkUserData, 10000);
});

slack.on('message', function() {
	console.log('I got a message!');
});

slack.login();
