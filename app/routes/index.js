var express = require('express');
var router = express.Router();
var request = require('request');

const api_key = 'RGAPI-ad88f98f-055b-41fa-a889-23a8952febf8'
const api_key_query = '?api_key=' +  api_key;
const account_id_host = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/';
const match_list_host = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/';
const match_detail_host = 'https://na1.api.riotgames.com/lol/match/v3/matches/';
const username = 'BarelyOtaku';
var url_id = account_id_host + username + api_key_query;
const rival_username = 'Gyoza';

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
function get_account_id(username, options){     
  
  return new Promise((resolve, reject) => {
    options.url = account_id_host + username + api_key_query;  
    request(options, function(error, response, body){
      if (!error & response.statusCode == 200){         
        var accountID = JSON.parse(body).accountId;          
        resolve(accountID);
      }
      else{
        reject("Error " + respone.statusCode )
      }
    })
  });
}

function get_match_list(accountID){  
  options.url = match_list_host + accountID + api_key_query;      
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body){
      if (!error & response.statusCode == 200){     
        var matches = JSON.parse(body)['matches'];
        resolve(matches);
      }
      else{
        reject("Error " + respone.statusCode )
      }
    })
  })
}

function retrieve_match(match_id){
  options.url = match_detail_host + match_id + api_key_query;
  return new Promise((resolve, reject) => {
    request(options, function(error, response, body){
      if (!error & response.statusCode == 200){
        resolve(body);
      }
      else{
        reject("Error " + response.statusCode);
      }
    })
  });
}
function search_rival_in_matches(rival_id, match_body, ret){
  var match_id = JSON.parse(match_body)['gameId'];
  var participants = JSON.parse(match_body)['participantIdentities'];

  for (var i = 0; i < participants.length; i++){
    if (participants[i]['player']['currentAccountId'] == rival_id){
      console.warn(match_id);
      ret.push(match_id);
    }
  }

}

// res.render('info', { username: username, rival: rival, match: list_of_games, account_id: account_id })
/* GET home page. */
function debug_view(accountID, body, res){
  res.render('info', { username: username, rival: rival, match: body, account_id: accountID});
}

// get_account_id(username, options, get_match_list);


router.get('/', function(req,res,next){
  var promise1 = get_account_id(username, options);
  var promise2 = get_account_id(rival_username, options);
  var promise3 = promise1.then(get_match_list, console.warn);
  var list_of_promises = [promise2];
  Promise.all([promise3, promise2]).then(function(values) {
    for (var i = 0; i < 10; i++){ // Due to request restrictions
      list_of_promises.push(retrieve_match(values[0][i]['gameId']));
    }
    return Promise.all(list_of_promises)
  })
  .then(function(values){
    const rival = values[0];  
    var ret = [];    
    for(var i = 1; i < values.length; i++){
      search_rival_in_matches(rival, values[i] , ret);
    }
    res.render('info', { username: username, rival: rival, match: ret })    
  }).catch(console.warn);
  

})

module.exports = router;
