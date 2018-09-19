# lol-rival
Used to track players you've recently played with

<img src="https://github.com/jackymayo/lol-rival/blob/master/public/images/lol-rival.png?raw=true" width="150px" height="150px">

Track your past match history with a certain player.
Enter your IDs to pulling up the stats including link to the official match history.

Clicking the block leads you to the official match history page from Riot Games of that particular game:
<img src="https://lh3.googleusercontent.com/8udjLW0sv2unCx9Nfeh7G6NMy_RmHnHkFjVGE2TxYLugN5d7HV6LAliRJ9lsySywjVefWeGVJ1s8Gs-OazB4=w3246-h1564-rw">

Right now due to API limitations, the request will cache the match history and remain unchanged.
Future implementation will create a renewal button to renew the cached match history.

# In the case you need a skeleton

1. `git clone https://github.com/jackymayo/lol-rival.git`
2. `cd lol-rival`
3. `npm install`
4. save your own api key at `public/data/api.txt`
