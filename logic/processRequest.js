//includes
var util = require('util'),
    twitter = require('twitter'),
    sentimentAnalysis = require('./sentimentAnalysis'),
    db = require('diskdb'),
    fs = require('fs'),
    csv = require('csv'),
    parse = require('csv-parse/lib/sync');

    db = db.connect('db', ['sentiments','totalSentiments']);

    //Twitter keys
    var twitterConfig = {
      consumer_key: 'apj13k5zzbgaQu62ityltLakT',
      consumer_secret: 'D5omFlgAVeNl7pOB9HvjK1DIPTz58d1AOJYFCLVxUQgXxaqrwM',
      access_token_key: '268370813-8veGoDVdJZn10MGw49yhqdWgtWlt7WlPeHqirJsS',
      access_token_secret: 'Q6iE7iaw08gNaunvDxTnI8Vp8NKXgD6A8znYO63pNBJ87'
    };

    const doSearch = async (queryList) => {
        var results = [];
        await asyncForEach(queryList, async (element) => {
            let data = await twitterSearch(element);
            results.push(data);
        });
        return results;
    }

    async function asyncForEach(array, callback) {
        for(let index = 0; index < array.length; index++) {
            await callback(array[index], index, array)
        }
    }

module.exports = async() => {
    console.log('Going to start processing request');
    var queryList = [], finalRes = [];
    var contents = fs.readFileSync('LeadOrganizations.csv');
    var lines = parse(contents);
    for(var i=1;i<lines.length;i++) {
        queryList.push(lines[i][0]);
    }

    console.log('Number of orgs to query for: ', queryList.length);
    console.log('Will only query for 50 for now');
    queryList = queryList.slice(0,50)

    var results =[];
    results = await doSearch(queryList);

    results.forEach(function(element) {
        try {
            db.totalSentiments.save(element.totalSentimentDbData);
        } catch(error) {
            console.log('Error saving in db', error);
        }
    });
    console.log('Saved total sentiment results in db');
    finalRes = results.map( x => x.totalSentimentDbData);
    return finalRes;
}

async function twitterSearch(text) {

  var twitterClient = new twitter(twitterConfig);
  var result = {}, dbData = [], totalSentimentDbData = [];

  console.log('Going to start twitter client with text: ', text);
  queryText = '"' + text + '"';

  try {
    let tweets = await twitterClient.get('search/tweets', {q: queryText, count:50});
    result = processTweets(tweets, text);
    return result;
  } catch (error) {
      console.log('Error while getting tweets: ', error);
      return result;
  };
}

function processTweets(tweets, text) {
        console.log('Number of tweets matched: ', tweets.statuses.length);
        var totalSentiment = 0, totalComparative = 0;
        var tweetData = [];
        for (var i = 0; i < tweets.statuses.length; i++) {
          var resp = {};
          resp.tweet = tweets.statuses[i];
          resp.sentiment = sentimentAnalysis(tweets.statuses[i].text);
          tweetData.push({
            tweet: resp.tweet.text,
            score: resp.sentiment.score
          });
          totalSentiment += resp.sentiment.score;
          totalComparative += resp.sentiment.comparative;
        };

        console.log('Total Sentiment: ', totalSentiment);

        var totalSentimentDbData = {
            searchText: text,
            totalSentiment: totalSentiment,
            totalComparative: totalComparative,
            numTweets: tweets.statuses.length
        };
        console.log('before: ', totalSentimentDbData);

        return {
            searchText: text,
            tweetDbData: tweetData,
            totalSentimentDbData: totalSentimentDbData
        };
}
