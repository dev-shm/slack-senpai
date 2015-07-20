var Hummingbird = require('./hummingbird');
var Slack = require('slack-client');
var Feed = require('./feed');
var Storage = require('./storage');
var fs = require('fs');
var _bind = function (fn, me) {
    return function () {
        return fn.apply(me, arguments);
    };
};

var Senpai = function (options) {
    var options = {
        token: process.env.SLACK_TOKEN,
        autoReconnect: true,
        autoMark: true
    };

    if (!options.token) {
        // Throw error
    }

    this.storage = new Storage();
    this.storage.load();

    this.options = options;

    this.slack = new Slack(options.token, options.autoReconnect, options.autoMark);
    this.hummingbird = new Hummingbird();
    // We can refactor our methods / properties to avoid these sort of scope issues
    this.writeToChannel = _bind(this.writeToChannel, this);
    this.postToChannel = _bind(this.postToChannel, this);
    this.evalStory = _bind(this.evalStory, this);
    this.checkStory = _bind(this.checkStory, this);
    this.open = _bind(this.open, this);
    this.message = _bind(this.message, this);

    this.slack.on('open', this.open);
    this.slack.on('message', this.message);

    return this.slack.login();
};

Senpai.prototype.writeToChannel = function (message) {
    // if connected, then send
    var channel = this.slack.getChannelByName('#anime');
    channel.send(message);
};

Senpai.prototype.postToChannel = function (data) {
    // if connected, then send
    var channel = this.slack.getChannelByName('#anime');
    channel.postMessage(data);
};

Senpai.prototype.checkUserData = function () {
    this.hummingbird.getFeed('', this.evalStory);
    this.storage.save();
};

Senpai.prototype.evalStory = function (username, data) {
    var feed = new Feed(JSON.parse(data));

    // Select the parent where the child story has a higher ID than the last seen for that user
    var lastSeen = this.storage.get(username);
    if (lastSeen === undefined) {
        lastSeen = 0;
    }

    var searchFunction = function (value, index, array) {
        val = (value["id"] > lastSeen) && (value.substory_type == 'watched_episode');
        return val;
    }.bind(lastSeen);

    var latestStory = feed.getAfter(lastSeen);
    if (latestStory !== null) {
        var recent_sub = latestStory.substories.filter(searchFunction)[0];
        var message = username + ' just watched *' + latestStory.media.title + '* Episode ' + recent_sub.episode_number;
        this.postToChannel({
            "attachments": [
                {
                    "thumb_url": latestStory.user.avatar_small,
                    "fallback": message,
                    "pretext": message,
                    "title": latestStory.media.title,
                    "title_link": latestStory.media.url,
                    "text": latestStory.media.synopsis,
                    "color": "#7CD197",
                    "mrkdwn_in": ["text", "pretext"]
                }
            ]
        });
        this.storage.set(username, recent_sub.id);
    }
};

Senpai.prototype.open = function () {
    console.log("Connection established!");
    var channel = this.slack.getChannelByName('#anime');
    var general = this.slack.getChannelByName('#general');
    setInterval(this.checkUserData.bind(this), 10000);
};

Senpai.prototype.message = function () {
    console.log('I got a message!');
};

module.exports = Senpai;
