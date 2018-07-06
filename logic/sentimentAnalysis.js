var Sentiment = require('sentiment');

module.exports = function(text) {
  var sentiment = new Sentiment();
  return sentiment.analyze(text);
};
