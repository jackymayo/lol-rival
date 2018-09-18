var express = require('express');
var router = express.Router();
const util = require('util')
var request = require('request');
var fs = require('fs');

// TODO: check for realm 
// if (!fs.existsSync('/public/data/champion.json')){

// }

const api_key = fs.readFileSync('public/data/api.txt', "utf-8");
const api_key_query = '?api_key=' +  api_key;
const patch_version = "8.14.1";
const ddragon_host = 'http://ddragon.leagueoflegends.com/cdn/' + patch_version + '/img/';
const champion_image_url = ddragon_host + 'champion/';
const summomer_spell_url = ddragon_host + 'spell/';
const championsJSON = JSON.parse(fs.readFileSync( 'public/data/champion.json', "utf-8"))['data'];
var temp = Object.keys(JSON.parse(fs.readFileSync( 'public/data/summoner.json', "utf-8"))['data']);
var summonersJSON = temp;
console.warn(temp);
var account_id_host = 'https://na1.api.riotgames.com/lol/summoner/v3/summoners/by-name/';
var match_list_host = 'https://na1.api.riotgames.com/lol/match/v3/matchlists/by-account/';
var match_detail_host = 'https://na1.api.riotgames.com/lol/match/v3/matches/';
var match_history_url = 'https://matchhistory.na.leagueoflegends.com/en/#match-details/NA1/';
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

function getSummonerSpellById(id){
  return summonersJSON[id];
}

function accountFileExists(accountId, path){  
  if(fs.existsSync(path)){
    return true; 
  }
  return false;
}

function retrieveAccountMatches(accountId, path){  
  return JSON.parse(fs.readFileSync(path, "utf-8"));
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

/**
* Search for information and store it into the list passed as parameter
* @param{string} user_id - Rival's account ID
* @param{string} rival_id - Rival's account ID
* @param{string} match_body - JSON's string from Riot API
* @param{array} champImages - array with image locations
* @param{Object} user_info - All information pertaining to the user.
*/
function search_rival_in_matches(user_id, rival_id, match_body, champImages, misc_info, user_info, rival_info){
  var response = JSON.parse(match_body);
  // fs.writeFileSync("public/data/matchid.json", JSON.stringify(response));
  var match_id = response['gameId'];  
  var participants = response['participantIdentities'];

	var left = [];
	var right = [];
  for (var i = 0; i < participants.length; i++){
    var details = response['participants'][i];
    if (participants[i]['player']['currentAccountId'] == user_id){
      misc_info.won = details['stats']['win'];
      
      // TODO: Remove misc_info once refactored.
      misc_info.user_loc = i;
      user_info.index = i;
      user_info.details = details;    
      user_info.summ1 = summomer_spell_url + getSummonerSpellById(details['spell1Id']) + ".png";
      user_info.summ2 = summomer_spell_url + getSummonerSpellById(details['spell2Id']) + ".png";
      console.warn(user_info.summ1);
      console.warn(user_info.summ2);
    }
    if (participants[i]['player']['currentAccountId'] == rival_id){     
      misc_info.rival_loc = i;
      rival_info.index = i;
      rival_info.details = details;
      for(var j = 0; j < 10; j++ ){  
        var champID = response['participants'][j]['championId'];        
        var champImage = champion_image_url + getChampionById(championsJSON, champID);
        if (rival_info.index === j){
          rival_info.champImage = champImage;
        }
        if (user_info.index === j){
          user_info.champImage = champImage;
        }
        var summoner =  participants[j]['player']['summonerName'];
        if (Math.floor(j/ 5)  === 0){ left.push(champImage); left.push(summoner);}
        else{ right.push(champImage); right.push(summoner);}
      }
      champImages.push(left);
      champImages.push(right);
    }

  }
  return match_id;
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

    // TODO: Rate limiting
    // TODO: Check for existing file
    const accountId = values[2];
    var path = 'public/data/user_data/' + accountId;
    
    
    if (accountFileExists(accountId, path)){      
      var cache = retrieveAccountMatches(accountId, path)
      path = '';
      list_of_promises.push(path);
      for(var i = 0; i < cache.length; i++){
        list_of_promises.push(cache[i]);
      }      
      
    }
    else{
      const rateLimit = 17;      
      list_of_promises.push(path);
      for (var i = 0; i < rateLimit; i++){ // Due to request restrictions 
        list_of_promises.push(retrieve_match(values[0][i]['gameId']));      
      }
    }
    
    return Promise.all(list_of_promises)
  })
  .then(function(values){
    const rival = values[0];  
    const user = values[1];
    const path = values[2];

    // Turn this into an object array
    var all_matches = [];    
    var match_results = [];
    var user_locations = [];
    var rival_locations = [];
    var match_ids = [];
    var cache = [];
    for(var i = 3; i < values.length; i++){
      var champImages = []
      cache.push(values[i]);
      var misc_info = { won: false, user_loc: 0, rival_loc: 0} ;
      // index: index in which player is located
      var user_info = { champImage: "", summ1: "", summ2: "", index: 0, details: null};
      var rival_info ={ champImage: "", summ1: "", summ2: "", index: 0, details: null};
      var match_id = match_history_url + search_rival_in_matches(user, rival, values[i] , champImages, misc_info, user_info, rival_info);
      
      if (champImages.length !== 0){
        match_results.push(misc_info.won);
        user_locations.push(user_info);
        rival_locations.push(rival_info);
                
        all_matches.push(champImages);        
        match_ids.push(match_id)
      }
      
    }
    if (path !== ''){ 
      fs.writeFile(path, JSON.stringify(cache), "utf-8", function (err) {
        if (err) throw err;
        console.log('Saved!');
      });
    }    

    var title = "lol-rival: " + username;
    res.render('info', { 
      title: title, username, rival: rival_username, 
      match: all_matches, number: all_matches.length,
      match_results: match_results, user_locations: user_locations,
      rival_locations: rival_locations, match_ids: match_ids
      }
    )    

  })
  .catch(console.warn);
  

})

module.exports = router;
