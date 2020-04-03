//Cards: from 1-13, where 1: Ace, 11: Jack, 12: Queen, 13: King
//Symbols: hearts, dimonds, clubs, spades -> h, d, c, s
//Therefore 1S is the Ace of Spades, 11H is the Jack of Hearts, 7C is the Seven of Clubs --> remember: http://youtu.be/1iwC2QljLn4
var Utils = require("./utils.js");
var utils = new Utils();

function Game() {
  this.pack = this._shufflePack(this._createPack());
}

//sets up two times 20 cards as a pack
Game.prototype._createPack = function () {
  var suits = ["H", "C", "S", "D"];
  var pack = [];
  var n = 20;
  var index = n / suits.length;
  var packCount = 0;
  for (i = 0; i <= 3; i++)
    for (j = 1; j <= index; j++) {
      pack[packCount++] = j + suits[i];
    }
  finalPack = pack.concat(pack); //2 times
  return finalPack;
};

//shuffles the pack - based on the Fisher-Yates algorithm
Game.prototype._shufflePack = function (pack) {
  var i = pack.length,
    j,
    tempi,
    tempj;
  if (i === 0) return false;
  while (--i) {
    j = Math.floor(Math.random() * (i + 1));
    tempi = pack[i];
    tempj = pack[j];
    pack[i] = tempj;
    pack[j] = tempi;
  }
  return pack;
};

//initial dealing
//draw one card from the pack of cards, initial T|F appends cards in hand
Game.prototype.drawCard = function (pack, amount, hand, initial) {
  var cards = [];
  //return cards;
  cards = pack.slice(0, amount);
  pack.splice(0, amount);
  if (!initial) {
    hand.push.apply(hand, cards);
  }
  return cards;
};

Game.prototype.takeTrick = function (table, player) {
  var cards = [];
  //return cards;
  cards = table.cardsOnTable;
  if (cards.length == table.playerLimit) {
    table.trickCards[table.trickNo] = cards;
    table.trickTakenBy[table.trickNo] = player;
    // table.trickCards.push(cards);
    console.log("table.TrickCards: " + table.trickCards[table.trickNo]);
    table.cardsOnTable = ""; //.splice(0, 4);
    if (player.trickCards.length > 1) {
      player.trickCards.push.apply(player.trickCards, cards);
      player.trickCardsNo = player.trickCardsNo.concat(table.trickNo);
    } else {
      player.trickCards = cards;
      player.trickCardsNo = [table.trickNo];
    }
    // //Spielende
    // if(table.trickNo == 10){
    //   //send message
    //   messaging.sendEventToAllPlayers('updateTricksWonByPlayer', {cardsOnTable: table.cardsOnTable}, io, table.players);
    // }
    return true;
  } else {
    return false;
  }
  // return cards;
};

Game.prototype.returnTrick = function (table, player) {
  if (table.cardsOnTable.length == "") {
    table.cardsOnTable = player.trickCards.splice(-table.playerLimit);
    return true;
  } else {
    return false;
  }
};

Game.prototype.returnCard = function (table, player) {
  var i = [];
  //return cards;
  if (table.cardsOnTable.includes(player.currPlayedCard)) {
    console.log("1--- " + player.currPlayedCard);
    console.log("2--- " + JSON.stringify(player.hand));
    player.hand.push(player.currPlayedCard);
    console.log("gamobj" + player.hand);
    i = table.cardsOnTable.indexOf(player.currPlayedCard); //(player.currPlayedCard);
    table.cardsOnTable.splice(i, 1); //table.cardsOnTable.length-i,1);
    player.currPlayedCard = "";
    return true;
  } else {
    return false;
  }
};

Game.prototype.sortCards = function (table, player) {
  player.cardOrder++;
  var standard = [
    "2H",
    "4C",
    "4S",
    "4H",
    "4D",
    "3C",
    "3S",
    "3H",
    "3D",
    "1D",
    "2D",
    "5D",
    "1C",
    "2C",
    "5C",
    "1S",
    "2S",
    "5S",
    "1H",
    "5H",
  ];
  var solo = [
    "1C",
    "2C",
    "5C",
    "4C",
    "3C",
    "1S",
    "2S",
    "5S",
    "4S",
    "3S",
    "1H",
    "2H",
    "5H",
    "4H",
    "3H",
    "1D",
    "2D",
    "5D",
    "4D",
    "3D",
  ];
  var card = "";
  var newHand = "";
  if (player.cardOrder % 2 == 0) {
    for (let i = 0; i < standard.length; i++) {
      var searchCard = standard[i];
      card = player.hand.filter(sortFunction);
      if (card != "" && newHand.length == "") {
        newHand = card;
      } else if (card != "") {
        newHand = newHand.concat(card);
      }
    }
    player.hand = newHand;
  } else if (player.cardOrder % 2 == 1) {
    for (let i = 0; i < solo.length; i++) {
      var searchCard = solo[i];
      card = player.hand.filter(sortFunction);
      if (card != "" && newHand.length == "") {
        newHand = card;
      } else if (card != "") {
        newHand = newHand.concat(card);
      }
    }
    // console.log("playerHandBefore " + JSON.stringify(player.hand))
    player.hand = newHand;
    // console.log("playerHandAfter " + JSON.stringify(player.hand))
  }
  function sortFunction(cV) {
    return cV == searchCard;
  }
  // player.hand = newHand;
  // console.log("newHand = " + newHand);
};

//no card at start
//at the start of the game, we put one card to the table from the pack (top card of the deck)
// Game.prototype.playFirstCardToTable = function (pack) {
//   return "";
//   // return  pack.splice(0,1);//hier weitermachen
// };

//plays a card with specific index, from specific hand, and places the card on the table
Game.prototype.playCard = function (index, hand, table) {
  var playedCard = hand.splice(index, 1); //we can only play one card at a time at the moment
  if (table.cardsOnTable == "") {
    console.log("playCard empty");
    console.log("playedCard: " + playedCard);
    table.cardsOnTable = playedCard;
  } else {
    table.cardsOnTable.push.apply(table.cardsOnTable, playedCard);
    console.log("playCard: " + table);
  }
  return table;
};

//not yet tested but - it should return all the cards on the table - so we can reshuffle it and use it as a new pack
Game.prototype.cardsOnTable = function (table, card) {
  if (card) {
    return table.concat(card);
  } else {
    return table;
  }
};

module.exports = Game;
