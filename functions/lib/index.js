"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors0 = require("cors");
const twitter_node_client_1 = require("twitter-node-client");
const Sentiment = require("sentiment");
const Filter = require("bad-words");
const _ = require("lodash");
const cors = cors0({
    origin: true
});
const filter = new Filter();
const sentiment = new Sentiment;
admin.initializeApp(functions.config().firebase);
let config = {
    "consumerKey": functions.config().twitter.key,
    "consumerSecret": functions.config().twitter.secret,
    "accessToken": functions.config().twitter.token,
    "accessTokenSecret": functions.config().twitter.tokensecret,
    "callBackUrl": functions.config().twitter.callback
};
let twitter = new twitter_node_client_1.Twitter(config);
const getRank = function (num) {
    let rank = 0;
    if (num > 1000000) {
        rank = 1;
    }
    else if (num > 200000) {
        rank = 0.8;
    }
    else if (num > 40000) {
        rank = 0.6;
    }
    else if (num > 8000) {
        rank = 0.4;
    }
    else if (num > 1600) {
        rank = 0.2;
    }
    else {
        rank = 0;
    }
    return rank;
};
let today = new Date();
let dateToday = today.getFullYear() + '-' + ((today.getMonth() + 1) < 10 ? ('0' + (today.getMonth() + 1)) : (today.getMonth() + 1)) + '-' + ((today.getDate() - 1) < 10 ? '0' + (today.getDate() - 1) : (today.getDate() - 1));
//
// http cloud functions
//
exports.checkRecentSentiment = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        const data = JSON.parse(req.body);
        console.log('data', data);
        if (data && data.trend) {
            if (data.getTweets) {
                checkRecentSentiment(data.trend, true, (totalScore, tweets) => res.send({ totalScore, tweets }));
            }
            else {
                checkRecentSentiment(data.trend, false, (totalScore) => res.send({ totalScore }));
            }
        }
        else {
            console.log('missing data');
            res.send(200);
        }
    });
});
exports.recordSentiment = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        admin.firestore().collection('trends').get().then(companies => {
            let len = companies.size;
            companies.forEach((comp) => checkRecentSentiment(comp.data(), false, (totalScore) => {
                len--;
                admin.firestore().collection('trends').doc(comp.data().$id).update({
                    sentiment: totalScore,
                });
                admin.firestore().collection('trends').doc(comp.data().$id).collection('sentiments').add({
                    sentiment: totalScore,
                    createdAt: Date.now()
                });
                if (len === 0) {
                    res.send(totalScore);
                }
            }));
        });
    });
});
//
// general functions
//
const checkRecentSentiment = (trend, getTweets, callback) => {
    console.log('trend', trend);
    twitter.getSearch({
        'q': trend,
        'count': 150,
        'result_type': 'recent'
    }, (error) => { console.log('sentimentError', error); }, (data) => {
        console.log('data', data);
        console.log('parsed data', JSON.parse(data));
        console.log('JSON.parse(data).statuses', JSON.parse(data).statuses);
        let searches = [];
        let totalScore = 0;
        let tweetList = [];
        let shortList = [];
        _.forEach(JSON.parse(data).statuses, (search) => {
            let tempSearch = {
                score: getRank(parseInt(search.favorite_count + search.retweet_count + search.user.followers_count)),
                date: search.created_at,
                text: search.text,
            };
            tempSearch.sentiment = sentiment.analyze(search.text);
            tempSearch.score *= tempSearch.sentiment.score;
            totalScore += tempSearch.score;
            if (getTweets) {
                tweetList.push({ name: search.user.name,
                    userName: search.user.screen_name,
                    text: search.text,
                    id_str: search.id_str,
                    created_at: search.created_at,
                    sentiment: tempSearch.score,
                });
            }
            searches.push(tempSearch);
        });
        console.log('searches', searches);
        console.log('totalScore', totalScore);
        if (getTweets) {
            console.log('tweetList', tweetList);
            if (totalScore < 0)
                tweetList.sort((a, b) => a.sentiment - b.sentiment);
            if (totalScore > 0)
                tweetList.sort((a, b) => b.sentiment - a.sentiment);
            // let shortList = tweetList.slice(0, 5);
            console.log('tweetList.length', tweetList.length);
            // console.log('shortList.length', shortList.length);
            for (let i = 0; shortList.length < 5; i++) {
                // console.log('i', i);
                if (i >= tweetList.length) {
                    break;
                }
                if (tweetList[i]
                    && !_.find(shortList, (item) => item.text == tweetList[i].text)
                    && !filter.isProfane(tweetList[i].text)) {
                    // console.log('adding tweet to list', tweetList[i]);
                    shortList.push(tweetList[i]);
                }
            }
            console.log('shortList', shortList);
            _.forEach(shortList, (tweet, i) => {
                let text = tweet.text;
                let truncIndex = text.indexOf('…');
                if (truncIndex > 0)
                    text = text.slice(0, truncIndex + 1);
                truncIndex = text.indexOf('https://t.co');
                if (truncIndex > 0)
                    text = text.slice(0, truncIndex - 1);
                shortList[i].text = text;
            });
            console.log('shortList', shortList);
        }
        console.log('sentScore', (totalScore / JSON.parse(data).statuses.length).toFixed(1));
        if (callback && getTweets) {
            callback(totalScore.toFixed(2), shortList);
        }
        else
            callback(totalScore.toFixed(2));
    });
};
//# sourceMappingURL=index.js.map