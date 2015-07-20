
var Feed = function(feedData) {
    this.data = feedData;
};

Feed.prototype.getAfter = function(lastSeen) {
    // Iterate over the parent stories where type = media_story
    var stories = this.data.filter(function(story) {
        return story["story_type"] == "media_story";
    });

    var searchFunction = function(value, index, array) {
        val = (value["id"] > lastSeen) && (value.substory_type == 'watched_episode');
        return val;
    }.bind(lastSeen);

    // Check all the stories to see if there is a substory with one with a higher value?
    stories = stories.filter(function(story) {
        if (story["substories"].length === 0) {
            return false;
        }

        return story["substories"].some(searchFunction);
    }.bind(lastSeen));

    if (stories.length > 0) {
        return stories[0];
    } else {
        return null;
    }
};

module.exports = Feed;
