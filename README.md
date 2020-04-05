Online cardgame

More info soon, for the time being, please read the articles at <a href="http://tamaspiros.co.uk/category/online-card-game/">http://tamaspiros.co.uk/category/online-card-game/</a>

1. Edit <code>server.js</code> and update the port/IP address/hostname that you would like to use
2. Edit <code>client.js</code> and update it with the same information as per above
3. <code>npm install && bower install</code>
4. <code>node server.js</code>

Play the game:
Login to the URL defined in point 1, add your name and wait for another player to join. In a second browser, navigate to the same URL, enter your name and you'll be all set to play. Basic rules are: number to number / colour to colour. If player plays #2 card, next player either has to play another #2 or is forced to draw 2 cards.

More updates coming soon.

table.cardsOnTable
table.pack
table.stiche
player.hand

Stich 1-10

git add .
git commit -m "text"
git push
git push heroku master
heroku ps:scale web=1
heroku local

testing with mocha (npm install --save-dev mocha)
npm install --save-dev live-server

ssh ec2-user@3.122.252.172 -i Doko.pem

++++++++++++++++++++++++++++++++++++++++

socket.io Reihenfolge

++++++++++++++++++++++++++++++++++++++++

socket.on(connection)
----------socket.emit(connectToServer)
socket.on(connectToServer):logging
----------socket.emit(connectToTable) 4x
socket.on(connectToTable)
evToAllPlay(timer)
----------socket.on(timer)
----------socket.emit(readyToPlay)
socket.on(readyToPlay)
player[i]emit(updateHand)
player[i]emit(isMyTurn): Noch keine Karte gespielt/bereits Karte ges.
player[i]emit(ready): waiting.hide, playArea.show
player[i]emit(updateTischNr): #TischNR
player[i]emit(updateTrickNo): #round
evToAllPlay(updateCardsonTable)

socket.on(sortCards)
socket.on(playCard)
socket.on(returnCard)
socket.on(takeTrick)
socket.on(returnTrick)
socket.on(seeLastTrick)
socket.on(disconnect)

Neue Runde
----------click newRound
----------socket.emit(readyToPlay)
socket.on(readyToPlay)...
