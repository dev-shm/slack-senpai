var https = require('https');
var Slack = require('slack-client');
var fs = require('fs');

var channel = null;

var userData = [];

var Senpai = function(options) {
	var options;

	options = {
      token: process.env.SLACK_TOKEN,
      autoReconnect: true,
      autoMark: true
	};

	if (!options.token) {
		// Throw error
	}

	this.options = options;
	this.slack = new Slack(options.token, options.autoReconnect, options.autoMark);
	this.slack.on('open', this.open);
	this.slack.on('message', this.message);

	return this.slack.login();
}

Senpai.prototype.writeToChannel = function(message) {
	var channel = slack.getChannelByName('#anime');
	channel.send(message);
};

Senpai.prototype.checkUserData = function() {
	checkStory('', evalStory);
	checkStory('', evalStory);
	checkStory('', evalStory);
};

Senpai.prototype.evalStory = function(username, data) {
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

Senpai.prototype.checkStory = function(username, callback) {
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

Senpai.prototype.writeUserData = function() {
	console.log("Attempting to save: " + JSON.stringify(userData));
	fs.writeFile('data.json', JSON.stringify(userData), function (err) {
	if (err) throw err;
	console.log('It\'s saved!');
	});
};

Senpai.prototype.readUserData = function() {
	fs.readFile('data.json', function (err, data) {
	if (err) throw err;
	userData = JSON.parse(data);
	});
};

Senpai.prototype.open = function() {
	console.log("Connection established!");
	var channel = slack.getChannelByName('#anime');
	var general = slack.getChannelByName('#general');
	setInterval(checkUserData, 5000);
	setInterval(writeUserData, 7000);
};

Senpai.prototype.message = function() {
	console.log('I got a message!');
};

module.exports = Senpai;
