function Player(playerID) {
  this.id = playerID;
  this.name = "";
  this.tableID = "";
  this.hand = [];
  this.status = ""; //?
  this.turnFinished = ""; //true or false
  this.trickCards = ""; // Alle gewonnen Stiche
  this.trickCardsNo = ""; // Nr der Stiche
  this.currPlayedCard = ""; // Zuletzt gespielte Karte
  this.cardOrder = 1; //Init sortCards
}

Player.prototype.setName = function (name) {
  this.name = name;
};

Player.prototype.getName = function () {
  return this.name;
};

Player.prototype.setTableID = function (tableID) {
  this.tableID = tableID;
};

Player.prototype.getTableID = function () {
  return this.tableID;
};

Player.prototype.setCards = function (cards) {
  this.cards = cards;
};

Player.prototype.getCard = function () {
  return this.cards;
};

Player.prototype.setStatus = function (status) {
  this.status = status;
};

Player.prototype.isAvailable = function () {
  return this.status === "available";
};

Player.prototype.isInTable = function () {
  return this.status === "intable";
};

Player.prototype.isPlaying = function () {
  return this.status === "playing";
};

module.exports = Player;
