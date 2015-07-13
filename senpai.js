var https = require('https');
var Slack = require('slack-client');
var fs = require('fs');

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
	console.log("During eval it is" + userData);
	//console.log(data);
	var stories = JSON.parse(data);
	//writeToChannel('I got ' + stories.length + ' stories for ' + username);
	// Iterate over the parent stories where type = media_story
	stories = stories.filter(function(story) {
		return story["story_type"] == "media_story";
	});

	// Select the parent where the child story has a higher ID than the last seen for that user
	var lastSeen = userData[username];
	if (lastSeen === undefined) {
		lastSeen = 0;
	}

	// Check all the stories to see if there is a substory with one with a higher value?
	stories = stories.filter(function(story) {
		if (story["substories"].length === 0) {
			return false;
		}

		return story["substories"].some(function(value, index, array) {
			return value["id"] > lastSeen;
		});
	});

	if (stories.length > 0) {
		// First member of array will have the most recent story!
		var recent = stories[0];
		//writeToChannel("Looks like " + username + " just watched " + recent.media.title);
		// Echo out the data
		console.log("Set user data for " + username);
		userData[username] = recent.id;
		console.log(userData);
	}
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

var writeUserData = function() {
	console.log("Attempting to save: " + JSON.stringify(userData));
	fs.writeFile('data.json', JSON.stringify(userData), function (err) {
	if (err) throw err;
	console.log('It\'s saved!');
	});
};

var readUserData = function() {
	fs.readFile('data.json', function (err, data) {
	if (err) throw err;
	userData = JSON.parse(data);
	});
};

slack.on('open', function () {
	console.log("Connection established!");
	var channel = slack.getChannelByName('#anime');
	var general = slack.getChannelByName('#general');
	setInterval(checkUserData, 5000);
	setInterval(writeUserData, 7000);
});

slack.on('message', function() {
	console.log('I got a message!');
});

slack.login();
