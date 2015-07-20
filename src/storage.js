var fs = require('fs');

var Storage = function() {
    this.dictionary = {};
};

Storage.prototype.get = function(key) {
    return this.dictionary[key];
};

Storage.prototype.set = function(key, value) {
    this.dictionary[key] = value;
};

Storage.prototype.save = function() {
    fs.writeFile('data.json', JSON.stringify(this.dictionary), function (err) {
        if (err) throw err;
    });
};

Storage.prototype.load = function() {
    fs.readFile('data.json', function (err, data) {
        if (err) throw err;
        this.dictionary = JSON.parse(data);
    }.bind(this));
};

module.exports = Storage;
