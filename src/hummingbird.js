var https = require('https');

var Hummingbird = function () {
};

Hummingbird.prototype.getFeed = function (username, callback) {
    console.log("Checking " + username);
    var options = {
        host: 'hummingbird.me',
        port: 443,
        path: '/api/v1/users/' + username + '/feed/',
        method: 'GET'
    };

    https.request(options,function (res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function () {
            callback(username, body);
        });
    }).end();
};

module.exports = Hummingbird;
