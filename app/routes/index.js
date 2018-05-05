var express = require('express');
var router = express.Router();
var request = require('request');

const api_key = '?api_key=RGAPI-138fc019-68b2-4d36-9a43-e20e146d2069';
const account_id = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/';
const match_list = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/';
const username = 'BarelyOtaku';
const url_id = account_id + username + api_key;


var options ={
  url: url_id,
  headers: {
    "Origin": "https://developer.riotgames.com",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Riot-Token": "RGAPI-704d26b5-c52d-400b-9fb0-204cabbb21c3",
    "Accept-Language": "en-US,en;q=0.9,fr;q=0.8,da;q=0.7,zh-CN;q=0.6,zh;q=0.5,zh-TW;q=0.4",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.117 Safari/537.36"
  }
}

function get_account_id(error,response,body, res){
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body);
      res.render('index', {title: info.accountId } ) 
    }
    else{
      res.render('index', {title: error});
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {    
  request(options, function(error, response, body){
    ge
  });
});

module.exports = router;
