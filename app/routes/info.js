var express = require('express');
var router = express.Router();
var request = require('request');
var fs = require('fs');
// TODO: check for realm 
// if (!fs.existsSync('/public/data/champion.json')){

// }
const api_key = 'RGAPI-d3ab0378-2e5d-495e-a4ec-a1797384849f'
const api_key_query = '?api_key=' +  api_key;
const patch_version = "8.9.1";
const ddragon_host = 'http://ddragon.leagueoflegends.com/cdn/' + patch_version;
const image_url = ddragon_host + '/img/champion/';
const championsJSON = JSON.parse(fs.readFileSync( 'public/data/champion.json', "utf8"))['data'];
var account_id_host = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/';
var match_list_host = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/';
var match_detail_host = 'https://na1.api.riotgames.com/lol/match/v3/matches/';
var username = 'BarelyOtaku';
var url_id = account_id_host + username + api_key_query;
var rival_username = 'Gyoza';

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

function getChampionById(map, id){
    for (champion in championsJSON){
        if(parseInt(championsJSON[champion]['key']) === parseInt(id)){
            return championsJSON[champion]['image']['full'];
        }
    }
    return "n/a";
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
        reject("Error at get_account_id " + response.statusCode )
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
        reject("Error at get_match_list " + respone.statusCode )
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
function search_rival_in_matches(user_id, rival_id, match_body, ret, misc_info){
  var response = JSON.parse(match_body);
  var match_id = response['gameId'];
  var userWins = false;
  console.warn(match_id);
  var participants = response['participantIdentities'];

	var left = [];
	var right = [];
  for (var i = 0; i < participants.length; i++){
    if (participants[i]['player']['currentAccountId'] == user_id){
      misc_info.won = response['participants'][i]['stats']['win'];
      misc_info.user_loc = i;
    }
    if (participants[i]['player']['currentAccountId'] == rival_id){     
      misc_info.rival_loc = i;
      for(var j = 0; j < 10; j++ ){  
        var champID = response['participants'][j]['championId'];        
        var champImage = image_url + getChampionById(championsJSON, champID);
        var summoner =  participants[j]['player']['summonerName'];
        if (Math.floor(j/ 5)  === 0){ left.push(champImage); left.push(summoner);}
        else{ right.push(champImage); right.push(summoner);}
      }
			ret.push(left);
			ret.push(right);
    }
  }

}


router.get('/', function(req,res,next){   
// for (champion in championsJSON){
//     console.warn(championsJSON[champion]['key'])
//     // if(championsJSON[champion]['key'] === id){
//     //     return champion;
//     // }
// }
  username = req.query.username;
  rival_username = req.query.rival_username;
  var promise1 = get_account_id(username, options);
  var promise2 = get_account_id(rival_username, options);
  var promise3 = promise1.then(get_match_list, console.warn);
  var list_of_promises = [promise2, promise1];
  Promise.all([promise3, promise2, promise1]).then(function(values) {
    for (var i = 0; i < 17; i++){ // Due to request restrictions
      list_of_promises.push(retrieve_match(values[0][i]['gameId']));
    }
    return Promise.all(list_of_promises)
  })
  .then(function(values){
    const rival = values[0];  
    const user = values[1];
    // Turn this into an object array
    var all_matches = [];    
    var match_results = [];
    var user_locations = [];
    var rival_locations = [];
    for(var i = 2; i < values.length; i++){
      var ret = []
      var misc_info = { won: false, user_loc: 0, rival_loc: 0} ;
      search_rival_in_matches(user, rival, values[i] , ret, misc_info, misc_info );
      if (ret.length !== 0){
        match_results.push(misc_info.won);
        user_locations.push(misc_info.user_loc);
        rival_locations.push(misc_info.rival_loc);
        all_matches.push(ret);
      }
		}
		console.warn(all_matches);
    console.warn(all_matches.length);
    console.warn(match_results);
    res.render('info', { username: username, rival: rival_username, 
        match: all_matches, number: all_matches.length,
      match_results: match_results, user_locations: user_locations,
    rival_locations: rival_locations})    
  })
  .catch(console.warn);
  

})

module.exports = router;
