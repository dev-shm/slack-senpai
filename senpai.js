var https = require('https');
var Slack = require('slack-client');

var token = process.env.SLACK_TOKEN;
var autoReconnect = true;
var autoMark = true;

var slack = new Slack(token, autoReconnect, autoMark);

var channel = slack.getChannelGroupOrDMByName('anime');

//channel.send('test');

slack.login();
