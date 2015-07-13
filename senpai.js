var https = require('https');
var Slack = require('slack-client');

var token = process.env.SLACK_TOKEN;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

slack.on('open', function () {
	console.log("Connection established!");
	var channel = slack.getChannelByName('#anime');
	channel.send('I am alive Onii-chan');
});

slack.on('message', function() {
	console.log('I got a message!');
});

slack.login();