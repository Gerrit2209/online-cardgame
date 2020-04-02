Game = require("./game.js");

Array.prototype.remove = function (from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function Table(tableID) {
  this.id = tableID;
  this.name = "";
  this.status = "available";
  this.players = [];
  this.playersID = [];
  this.readyToPlayCounter = 0;
  this.playerLimit = 4;
  this.spectatorLimit = 1;
  this.pack = [];
  this.cardsOnTable = [];
  this.trickNo = 1;
  this.trickCards = {};
  this.trickTakenBy = {};
  this.seeLastTrickCounter = 0;
  this.roundNo = 1;
  this.maxHandCards = 10;
  this.cardUnicode = "";

  this.cardUnicode = {
    "1C": "A&#9827",
    "1S": "A&#9824",
    "1H": "<font color='red'>A&#9829</font>",
    "1D": "<font color='red'>A&#9830</font>",
    "2C": "10&#9827",
    "2S": "10&#9824",
    "2H": "<font color='red'>10&#9829</font>",
    "2D": "<font color='red'>10&#9830</font>",
    "3C": "B&#9827",
    "3S": "B&#9824",
    "3H": "<font color='red'>B&#9829</font>",
    "3D": "<font color='red'>B&#9830</font>",
    "4C": "D&#9827",
    "4S": "D&#9824",
    "4H": "<font color='red'>D&#9829</font>",
    "4D": "<font color='red'>D&#9830</font>",
    "5C": "K&#9827",
    "5S": "K&#9824",
    "5H": "<font color='red'>K&#9829</font>",
    "5D": "<font color='red'>K&#9830</font>",
  };

  // this.actionCard = false;
  // this.requestActionCard = false;
  // this.penalisingActionCard = false;
  // this.forcedDraw = 0;

  // this.suiteRequest = "";
  // this.numberRequest = "";

  this.gameObj = null;
}

// Table.prototype.progressRound = function (player) {
//   for (var i = 0; i < this.players.length; i++) {
//     this.players[i].turnFinished = false;
//     if (this.players[i].id == player.id) {
//       //when player is the same that plays, end their turn
//       player.turnFinished = true;
//     }
//   }
// };

Table.prototype.setName = function (name) {
  this.name = name;
};

Table.prototype.getName = function () {
  return this.name;
};

Table.prototype.setStatus = function (status) {
  this.status = status;
};

Table.prototype.isAvailable = function () {
  return this.status === "available";
};

Table.prototype.isFull = function () {
  return this.status === "full";
};

Table.prototype.isPlaying = function () {
  return this.status === "playing";
};

Table.prototype.addPlayer = function (player) {
  if (this.status === "available") {
    var found = false;
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].id == player.id) {
        found = true;
        break;
      }
    }
    if (!found) {
      this.players.push(player);
      if (this.players.length == this.playerLimit) {
        //this.status = "playing";
        for (var i = 0; i < this.players.length; i++) {
          this.players[i].status = "intable";
        }
      }
      return true;
    }
  }
  return false;
};

Table.prototype.removePlayer = function (player) {
  var index = -1;
  for (var i = 0; i < this.players.length; i++) {
    if (this.players[i].id === player.id) {
      index = i;
      break;
    }
  }
  if (index != -1) {
    this.players.remove(index);
  }
};

Table.prototype.isTableAvailable = function () {
  if (this.playerLimit >= this.players.length && this.status === "available") {
    return true;
  } else {
    return false;
  }
  //return (this.playerLimit > this.players.length);
};

/* Table.prototype.createMessageObject = function() {
	var table = this;
	var TableMessage = function(){
		this.id = table.id;
		this.name = table.name;
		this.status = table.status;
		this.players = table.players;
		this.playerLimit = table.playerLimit;
	};

	return new TableMessage();
}; */

module.exports = Table;
