var express = require('express');
var router = express.Router();
var request = require('request');

const api_key = 'RGAPI-3f121284-ee92-4ff2-be31-43058e24aed7'
const api_key_query = '?api_key=' +  api_key;
const account_id_host = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/';
const match_list_host = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/';
const username = 'BarelyOtaku';
var url_id = account_id_host + username + api_key_query;
const rival = 'iSupportCarry';

var options = {
  url: url_id,
  headers: {
    "Origin": "https://developer.riotgames.com",
    "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Riot-Token": api_key,
    "Accept-Language": "en-US,en;q=0.9,fr;q=0.8,da;q=0.7,zh-CN;q=0.6,zh;q=0.5,zh-TW;q=0.4",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36"
  }
}

// Pass in options object with
function get_account_id(username, options, cb){    
  // set username
  options.url = account_id_host + username + api_key_query;
  request(options, function(error, response, body){
    if (!error & response.statusCode == 200){        
      var accountID = JSON.parse(body).accountId;
      cb(accountID, options);
    }
  })
  
}

function get_match_list(accountID, options){
  const url_matchlist = match_list_host + accountID + api_key_query;     
  options.url = url_matchlist;
  request(options, function(error, response, body){
    if (!error & response.statusCode == 200){     
      debug_view(body);
    }
  })
}

// res.render('info', { username: username, rival: rival, match: list_of_games, account_id: account_id })
/* GET home page. */
function debug_view(body){
  router.get('/', function(req, res, next) {    
    res.render('index', {title: JSON.stringify(JSON.parse(body)['matches'])});
  });
}
get_account_id(username, options, get_match_list);




module.exports = router;
