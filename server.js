//Dependencies
var socket = require("socket.io");
var Game = require("./game.js");
var Player = require("./player.js");
var Messaging = require("./messaging.js");
var Table = require("./table.js");
var Room = require("./room.js");
var Utils = require("./utils.js");

//setup an Express server to serve the content
var http = require("http");
var express = require("express");
var app = express();
app.use("/", express.static(__dirname + "/"));
app.use("/resources", express.static(__dirname + "/resources"));
var server = http.createServer(app);

// listen auf heroku env-Variable oder 5000
let port = process.env.PORT; //heroku
if (port == null || port == "") {
  port = 5000; //local
}
server.listen(port);

//???
var io = socket.listen(server);
app.get("/", function (req, res) {
  res.sendfile(__dirname + "/index.html");
});
// io.set("log level", 1); //test

//creating the messaging object & testroom with sample table
var utils = new Utils();
// var firstRound = 1; //aktuell nicht in Verwendung
var messaging = new Messaging();
var room = new Room("Doko Room");
room.tables = messaging.createSampleTables(room.tableLimit); //10 anstatt 1 Table

//
//starting the socket and awaiting connections.
//
io.sockets.on("connection", function (socket) {
  //connection=fix term
  /*
  When a player connects to the server,  we immediately create the player object.
    - the Player's name comes from frontend.
    - the player ID is the socket.ID
    - every player by default will be added to a room ("lounge")
  Message is shown in the logging board
  */
  socket.on("connectToServer", function (data) {
    //direkt nach "join"-Button
    console.log("connectToServer called by " + socket.id);
    socket.data = { tableID: 1 }; //Test auf Socket schreiben
    var player = new Player(socket.id);
    var name = data.name; //get the player's name
    player.setName(name);
    room.addPlayer(player); //add to room -- all players go to a room first
    io.sockets.emit("logging", { message: name + " has connected to server." });
    // io.sockets.emit("logging", "test");
  });

  /* 
  When someone connects to a table we need to do a few things:
  These include:
    - check if there's space at the table where they want to connect
    - assign the player to a table (if available)
    - change the player's status from 'available' to 'in table'
    - save the player's name, and ID (socket client ID) in the appropriate arrays at the table.

  If a table has 2 players, we need to do more:
    - set the table's status from 'available' to 'unavailable'
    - create a pack (instantiate the game object)
    - send a time counter of 3 seconds to both connected clients
    - after the 3 second delay, emit a 'PLAY' message
  */
  socket.on("connectToTable", function () {
    //direkt nach "join"-Button
    var player = room.getPlayer(socket.id);
    for (let i = 0; i < room.tableLimit; i++) {
      var table = room.getTable(i);
      if (table.status == "available") {
        socket.tableID = i;
        break;
      }
    }
    console.log(
      "connectToTable called. tableID:" +
        socket.tableID +
        " & table.status: " +
        table.status
    );
    if (table.addPlayer(player) && table.isTableAvailable()) {
      player.tableID = table.id;
      player.status = "intable";
      table.playersID.push(socket.id); //probably not needed
      messaging.sendEventToAllPlayers(
        "logging",
        {
          message: player.name + " has connected to table: " + table.name + ".",
        },
        io,
        table.players
      );
      if (table.players.length < table.playerLimitAct) {
        messaging.sendEventToAllPlayers(
          "logging",
          {
            message:
              "There is " +
              table.players.length +
              " player at this table. The table requires " +
              table.playerLimitAct +
              " active players to join.",
          },
          io,
          table.players
        );
        messaging.sendEventToAllPlayers(
          "waiting",
          {
            message: "Waiting for other player to join.",
          },
          io,
          table.players
        );
      } else {
        messaging.sendEventToAllPlayers(
          "logging",
          {
            message:
              "There are " +
              table.players.length +
              " players at this table. Play will commence shortly.",
          },
          io,
          table.players
        );
        //emit counter
        var countdown = 1; //3 seconds in reality...
        console.log("3 sec timer starting...");
        setInterval(function () {
          countdown--;
          messaging.sendEventToAllPlayers(
            "timer",
            { countdown: countdown },
            io,
            table.players
          );
        }, 1000);
      }
    } else {
      console.log("addPlayer: " + table.addPlayer(player));
      console.log("isTableAvailable: " + table.isTableAvailable());
      console.log("for whatever reason player can't be added to table."); //needs looking at
    }
  });

  socket.on("newRound", function (data) {
    console.log("newRound called");
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
  });
  /*
  Once the counter has finished both clients will emit a "readyToPlay" message
  Upon the receival of this message, we check against a local variable (never trust data from the client) and
  we setup the play environment:
    - change the table's state to "unavailable"
    - change the player's status to "playing"
    - assign 5 cards to each player
    - flip the first card
      - we are going to check if this card is an action card
      - if it is, we will call the appropriate action
    - otherwise we are going to assign the start priviledge to a random player at the table
  */

  socket.on("readyToPlay", function (data) {
    console.log("Ready to play called");
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
    //reset, nur in neuer Runde, nicht initial
    player.turnFinished = "";
    player.trickCards = "";
    player.currPlayedCard = "";
    player.trickCardsNo = "";
    player.cardOrder = 1;
    table.trickNo = 1;
    table.trickCards = {};
    table.trickTakenBy = {};
    table.seeLastTrickCounter = 0;
    //Initial & jede neue Runde
    player.status = "playing";
    table.readyToPlayCounter++;
    var randomNumber = Math.floor(Math.random() * table.playerLimitAct);
    if (table.readyToPlayCounter === table.playerLimitAct) {
      table.cardsOnTable = table.gameObj.playFirstCardToTable(table.pack); //assign first card on table
      table.status = "unavailable"; //set the table status to unavailable
      for (var i = 0; i < table.players.length; i++) {
        //go through the players array (contains all players sitting at a table)
        table.players[i].hand = table.gameObj.drawCard(
          table.pack,
          table.maxHandCards,
          "",
          1
        ); //assign initial 5 cards to players
        // table.players[i].hand = table.gameObj.drawCard(table.pack, 8, "", 1); //assign initial 5 cards to players
        var startingPlayerID = table.playersID[randomNumber]; //get the ID of the randomly selected player who will start
        // if (table.players[i].id === startingPlayerID) { //this player will start the turn
        table.players[i].turnFinished = false;
        console.log(table.players[i].name + " starts the game.");
        io.sockets.sockets[table.players[i].id].emit("updateHand", {
          hand: table.players[i].hand,
        }); //send the cards in hands to player
        io.sockets.sockets[table.players[i].id].emit("turn", { myturn: true }); //send the turn-signal to player
        io.sockets.sockets[table.players[i].id].emit("ready", { ready: true }); //send the 'ready' signal
        io.sockets.sockets[table.players[i].id].emit("showTrickNo", {
          roundNo: table.roundNo,
        });
        // } else {
        //   table.players[i].turnFinished = true;
        //   console.log(table.players[i].name + " will not start the game.");
        //   io.sockets.sockets[table.players[i].id].emit("updateHand", { hand: table.players[i].hand }); //send the card in hands to player
        //   io.sockets.sockets[table.players[i].id].emit("turn", { myturn: false }); //send the turn-signal to player
        //   io.sockets.sockets[table.players[i].id].emit("ready", { ready: true }); //send the 'ready' signal
        //   io.sockets.sockets[table.players[i].id].emit("showTrickNo", {cardsInHand: table.players[i].hand.length});
        // }
      }
      //sends the cards to the table.
      messaging.sendEventToAllPlayers(
        "updateCardsOnTable",
        {
          cardsOnTable: table.cardsOnTable,
          lastCardOnTable: "",
          trickNo: table.trickNo,
        },
        io,
        table.players
      );
      console.log(
        "CardsOnTable at readyToPlay ===> " + JSON.stringify(table.cardsOnTable)
      );
      //messaging.sendEventToAllPlayers('updateCardsOnTable', {cardsOnTable: table.cardsOnTable, lastCardOnTable: table.cardsOnTable}, io, table.players);
      // io.sockets.emit("updatePackCount", { packCount: table.pack.length });
      messaging.sendEventToAllPlayers(
        "updateTischNr",
        { packCount: socket.tableID },
        io,
        table.players
      );
    }
  });

  socket.on("disconnect", function () {
    console.log("disconnect called");
    var player = room.getPlayer(socket.id);
    if (player && player.status === "intable") {
      console.log(
        "player was in table. player: " +
          player +
          ". player.status: " +
          player.status
      );
      //make sure that player either exists or if player was in table (we don't want to remove players)
      //Remove from table
      var table = room.getTable(player.tableID);
      table.removePlayer(player);
      table.status = "available";
      player.status = "available";
      console.log(player.name + " disconnected");
      io.sockets.emit("logging", {
        message: player.name + " has left the table.",
      });
    }
  });

  socket.on("takeTrick", function () {
    //Stich nehmen
    console.log("Stich nehmen called");
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
    console.log("Stich genommen - trickNo: " + table.trickNo);
    var trickTaken = table.gameObj.takeTrick(table, player);
    if (trickTaken) {
      if (table.trickNo == table.maxHandCards) {
        // messaging.sendEventToAllPlayers('updateTricksWonByPlayer', {cardsOnTable: player.trickCards}, io, table.players);
        table.readyToPlayCounter = 0; //reset readytoPlayCounter
        table.roundNo++; // hochzählen
        messaging.sendEventToAllPlayers(
          "updateTricksWonByPlayer",
          { table: table },
          io,
          table.players
        );
      }
      messaging.sendEventToAllPlayers(
        "logging",
        {
          message: player.name + " nimmt Stich " + table.trickNo + "",
        },
        io,
        table.players
        // player
      );
      // table.trickNo = Math.min(table.trickNo, table.maxHandCards);
      player.turnFinished = false;
      messaging.sendEventToAllPlayers(
        "turn",
        { myturn: true },
        io,
        table.players
        // player
      );
      table.trickNo++;
      // table.trickNo = Math.min(table.trickNo, table.playerLimitAct);
      if (table.trickNo != table.maxHandCards + 1) {
        var stich = Math.min(table.trickNo, table.maxHandCards); //obergrenze Stichanzahls-Anzeige
        messaging.sendEventToAllPlayers(
          "updateCardsOnTable",
          {
            cardsOnTable: table.cardsOnTable,
            trickNo: stich,
          },
          io,
          table.players
        );
        // messaging.sendEventToAllPlayers(
        //   "updateLastTrick",
        //   { table: table, name: player.name },
        //   io,
        //   table.players
        // );
      }
    } else {
      messaging.sendEventToAPlayer(
        "logging",
        {
          message:
            "Du kannst den Stich erst bei " +
            table.playerLimitAct +
            " Karten nehmen.",
        },
        io,
        table.players,
        player
      );
    }
  });

  socket.on("returnTrick", function () {
    //Stich nehmen
    console.log("Stich zurückgeben / returnTrick called");
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
    var trickReturned = table.gameObj.returnTrick(table, player);
    if (!trickReturned) {
      messaging.sendEventToAPlayer(
        "logging",
        { message: "Du kannst keinen Stich zurückgeben" },
        io,
        table.players,
        player
      );
    } else {
      // if (table.trickNo != table.maxHandCards + 1) {
      //Nur nicht in der letzten Runde
      table.trickNo--;
      if (table.trickNo == table.maxHandCards) {
        table.roundNo--; // hochzählen
      }
      // }
      player.turnFinished = true;
      messaging.sendEventToAllPlayers(
        "logging",
        {
          message:
            player.name + " hat den Stich " + table.trickNo + " zurückgegeben.",
        },
        io,
        table.players
        // player
      );
      messaging.sendEventToAllPlayers(
        "turn",
        { myturn: false },
        io,
        table.players
        // player
      );
      messaging.sendEventToAllPlayers(
        "updateCardsOnTable",
        { cardsOnTable: table.cardsOnTable, trickNo: table.trickNo },
        io,
        table.players
      );
    }
  });

  socket.on("returnCard", function () {
    //Stich nehmen
    console.log("Karte zurückgeben / returnCard called");
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
    var cardsReturned = table.gameObj.returnCard(table, player);
    if (!cardsReturned) {
      messaging.sendEventToAPlayer(
        "logging",
        { message: "Du kannst keine Karte zurücknehmen" },
        io,
        table.players,
        player
      );
    } else {
      player.turnFinished = false;
      messaging.sendEventToAllPlayers(
        "logging",
        { message: player.name + " hat seine Karte zurückgenommen." },
        io,
        table.players
        // player
      );
      messaging.sendEventToAPlayer(
        "turn",
        { myturn: true },
        io,
        table.players,
        player
      );
      messaging.sendEventToAllPlayers(
        "updateCardsOnTable",
        { cardsOnTable: table.cardsOnTable, trickNo: table.trickNo },
        io,
        table.players
      );
      // io.sockets.sockets[table.players[i].id].emit("updateHand", { hand: table.players[i].hand });
      messaging.sendEventToAPlayer(
        "updateHand",
        { hand: player.hand },
        io,
        table.players,
        player
      );
    }
  });

  socket.on("sortCards", function () {
    console.log("sortieren / sortCards called");
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
    var cardsReturned = table.gameObj.sortCards(table, player);
    messaging.sendEventToAPlayer(
      "updateHand",
      { hand: player.hand },
      io,
      table.players,
      player
    );
  });

  socket.on("seeLastTrick", function () {
    console.log("seeLastTrick called");
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
    table.seeLastTrickCounter++;
    if (table.trickNo > 1) {
      console.log("seeLastTrick called if-cond");
      // var cardsReturned = table.gameObj.sortCards(table, player);
      messaging.sendEventToAllPlayers(
        "updateLastTrick",
        { table: table, name: player.name },
        io,
        table.players
      );
    }
  });

  socket.on("playCard", function (data) {
    console.log("playCard called");
    /*
      server needs to check:
      - if it's the player's turn
      - if the played card is in the owner's hand
      - if the played card's index, matches the server side index value
      - if the played card is valid to play
      */
    var errorFlag = false;
    var player = room.getPlayer(socket.id);
    var table = room.getTable(socket.tableID);
    // var last = table.gameObj.lastCardOnTable(table.cardsOnTable); //last card on Table

    if (
      !player.turnFinished &&
      table.cardsOnTable.length != table.playerLimitAct
    ) {
      var playedCard = data.playedCard;
      var index = data.index; //from client
      var serverIndex = utils.indexOf(player.hand, data.playedCard);
      // console.log("Table  ===> " + JSON.stringify(table))

      console.log("index => " + index + " | serverindex ==> " + serverIndex);

      if (index == serverIndex) {
        errorFlag = false;
      } //else {
      //   errorFlag = true;
      //   playedCard = null;
      //   messaging.sendEventToAPlayer(
      //     "logging",
      //     { message: "Index mismatch - you have altered with the code." },
      //     io,
      //     table.players,
      //     player
      //   );
      //   socket.emit("updateHand", { hand: player.hand });
      // }

      if (utils.indexOf(player.hand, data.playedCard) > -1) {
        errorFlag = false;
        playedCard = data.playedCard; //overwrite playedCard
      } else {
        errorFlag = true;
        playedCard = null;
        messaging.sendEventToAPlayer(
          "logging",
          { message: "The card is not in your hand." },
          io,
          table.players,
          player
        );
        socket.emit("updateHand", { hand: player.hand });
      }
      console.log(playedCard);
      table.gameObj.playCard(index, player.hand, table);
      player.currPlayedCard = playedCard;
      console.log("player.currPlayedCard " + player.currPlayedCard);
      console.log(table.cardsOnTable);
      messaging.sendEventToAllPlayers(
        "updateCardsOnTable",
        {
          cardsOnTable: table.cardsOnTable,
          lastCardOnTable: playedCard,
          trickNo: table.trickNo,
        },
        io,
        table.players
      );
      messaging.sendEventToAllPlayers(
        "logging",
        {
          // message: player.name + " spielt: " + playedCard
          message: table.cardUnicode[playedCard] + " - " + player.name,
        },
        io,
        table.players
      );
      console.log("CardsOnTable ===> " + JSON.stringify(table.cardsOnTable));
      table.progressRound(player); //end of turn
      //notify frontend
      messaging.sendEventToAPlayer(
        "turn",
        { myturn: false },
        io,
        table.players,
        player
      );
      //messaging.sendEventToAllPlayersButPlayer("turn", {myturn: true}, io, table.players, player);
      // messaging.sendEventToAllPlayersButPlayer(
      messaging.sendEventToAllPlayers(
        "showTrickNo",
        { roundNo: table.roundNo },
        io,
        table.players
        // player
      );
      socket.emit("updateHand", { hand: player.hand });
    } else {
      //end of turn
      messaging.sendEventToAPlayer(
        "logging",
        {
          message:
            "Du hast bereits eine Karte gespielt. CardsOnTable = " +
            table.cardsOnTable.length,
        },
        io,
        table.players,
        player
      );
    }
  });
}); //end of socket.on
