// let port = process.env.PORT;
// if (port == null || port == "") {//local vs. heroku
var socket = io.connect("https://stark-taiga-51826.herokuapp.com");
// } else {
// var socket = io.connect("localhost:5000");
// socket.data = { tableID: 1 };
// var ID = 1; //$("#tableID").val();
// }

$(document).ready(function () {
  $("#tableFull").hide();
  $("#playArea").hide();
  $("#waiting").hide();
  $("#error").hide();
  $("#name").focus();
  $("#progressUpdate").hide();
  $("#newRound").hide();
  $("#numberRequest").hide();
  $("#suiteRequest").hide();
  $("#tableID").hide();
  $("form").submit(function (event) {
    event.preventDefault();
  });
  //suiteRequest - nicht mehr notwendig
  $("#suiteRequestBtn").click(function () {
    var request = $("#suiteRequestTxt").val();
    socket.emit("suiteRequest", { tableID: 1, request: request });
    console.log("called with request ==> " + request);
  });
  //join Button
  $("#join").click(function () {
    var name = $("#name").val();
    // var ID = $("#tableID").val();
    if (name.length > 0) {
      socket.emit("connectToServer", { name: name });
      // socket.emit("connectToTable", { tableID: ID });
      socket.emit("connectToTable");
      $("#loginForm").hide();
      $("#tableFull").hide();
      $("#waiting").show();
      socket.on("ready", function (data) {
        $("#waiting").hide();
        $("#playArea").show();
        $("#progressUpdate").show();
      });
    } else {
      $("#error").show();
      $("#error").append('<p class="text-error">Please enter a name.</p>');
    }
  });
  //Stich nehmen
  $("#takeTrick").click(function () {
    socket.emit("takeTrick");
    // socket.emit("takeTrick", { tableID: socket.tableID });
  });
  //Stich zurückgeben
  $("#returnTrick").click(function () {
    socket.emit("returnTrick");
    // socket.emit("returnTrick", { tableID: socket.tableID });
  });
  //Karte zurücknehmen
  $("#returnCard").click(function () {
    socket.emit("returnCard");
    // socket.emit("returnCard", { tableID: socket.tableID });
  });
  //sortieren
  $("#sortCards").click(function () {
    socket.emit("sortCards");
    // socket.emit("sortCards", { tableID: socket.tableID });
  });
  //seeLastTrick
  $("#seeLastTrick").click(function () {
    socket.emit("seeLastTrick");
    // socket.emit("sortCards", { tableID: socket.tableID });
  });
  //newRound
  $("#newRound").click(function () {
    // socket.emit("penalisingTaken", { tableID: 1 });
    socket.emit("readyToPlay");
    $("#newRound").hide();
    $("#playArea").hide();
  });
});

//
//*** $-Funktionen beendet ***
//

//var socket = io.connect("http://ec2-54-229-63-210.eu-west-1.compute.amazonaws.com:8080");
socket.on("logging", function (data) {
  $("#updates").append("<li>" + data.message + "</li>");
  var log = document.getElementById("footer");
  log.scrollTop = log.scrollHeight;
});

socket.on("timer", function (data) {
  $("#counter").html(data.countdown);
  if (data.countdown === 0) {
    // socket.emit("readyToPlay");
    socket.emit("readyToPlay", { tableID: socket.tableID });
    $("#counter").hide();
  }
});

socket.on("playOption", function (data) {
  $("#playOption").html(data.message);
  if (data.value) {
    $("#penalising").show();
  } else {
    $("#penalising").hide();
    $("#playOption").hide();
  }
});

socket.on("showRequestCardDialog", function (data) {
  if (data.option == "suite") {
    $("#suiteRequest").show();
  }
});

function playCard(key, value) {
  index = key;
  playedCard = value;
  /*if (parseInt(value) === 1) {
    console.log("request card");
    $("#suiteRequest").show();
    $("#suiteRequestBtn").click(function() {
      var request = $("#suiteRequestTxt").val();
      socket.emit("suiteRequest", {tableID: 1, request: request});
      socket.emit("playCard", {tableID: 1, playedCard: playedCard, index: index});
      console.log("called with request ==> " + request);
    });
  } else {*/
  socket.emit("playCard", {
    // tableID: socket.tableID,
    playedCard: playedCard,
    index: index,
  });
  //}
}

socket.on("updatePackCount", function (data) {
  $("#tischNr").text("");
  $("#tischNr").html(
    "Tisch Nr.: <span class='label label-info'>" +
      (data.packCount + 1) +
      "</span>"
  );
});

socket.on("updateCardsOnTable", function (data) {
  //console.log("lastCardOnTable" + data.lastCardOnTable);
  $("#table").text("");
  $("#stich").text("");
  // var stich = Math.min(data.trickNo, data.table.maxHandCards);
  $("#stich").html(
    "Stich: <span class='label label-info'>" + data.trickNo + "</span>"
  );
  // if (data.lastCardOnTable == "") {
  // $("#table").append("<div style='margin-top:2px; margin-left:0px; float: left; z-index:1''><img class='card0' width=100 src=resources/2D.png>");
  if (data.cardsOnTable == "") {
    $("#table").text("");
  } else {
    pixel = 0;
    $.each(data.cardsOnTable, function (k, v) {
      index = k + 1;
      $("#table").append(
        "<div style='margin-top:2px; margin-left:" +
          pixel +
          "px; float: left; z-index:" +
          index +
          "''><img class='card" +
          k +
          "' width=100 src=resources/" +
          v +
          ".png /></div>"
      );
      // $(".card"+k).click(function() { playCard(k, v); return false; });
      if (pixel >= 0) {
        pixel = (pixel + 40) * -1;
      } else {
        if (pixel <= -40) pixel = pixel - 1;
      }
    });
  }
});

socket.on("updateLastTrick", function (data) {
  if (data.table.seeLastTrickCounter % 2 == 0) {
    $("#lastTrick").hide();
    $("#lastTrickName").hide();
  } else {
    $("#lastTrick").show();
    $("#lastTrickName").show();
    $("#lastTrickName").text(
      data.name +
        " deckt den letzten Stich um (wurde gewonnen von " +
        data.table.trickTakenBy[data.table.trickNo - 1].name +
        "):"
      // " nahm den letzten Stich:"
      // data.table.trickTakenBy[data.table.trickNo-1] + " nahm den letzten Stich:"
    );
    $("#lastTrick").text("");
    // JSON.stringify(data.table.lastTrick[data.table.trickNo])
    // );
    // $("#stich").html(
    //   "Stich: <span class='label label-info'>" + data.trickNo + "</span>"
    // );
    // if (data.lastCardOnTable == "") {
    // $("#table").append("<div style='margin-top:2px; margin-left:0px; float: left; z-index:1''><img class='card0' width=100 src=resources/2D.png>");
    if (data.table.trickCards[data.table.trickNo - 1] == "") {
      $("#lastTrick").text("Leer");
    } else {
      pixel = 0;
      $.each(data.table.trickCards[data.table.trickNo - 1], function (k, v) {
        index = k + 1;
        $("#lastTrick").append(
          "<div style='margin-top:2px; margin-left:" +
            pixel +
            "px; float: left; z-index:" +
            index +
            "''><img class='card" +
            k +
            "' width=100 src=resources/" +
            v +
            ".png /></div>"
        );
        // $(".card"+k).click(function() { playCard(k, v); return false; });
        if (pixel >= 0) {
          pixel = (pixel + 40) * -1;
        } else {
          if (pixel <= -40) pixel = pixel - 1;
        }
      });
    }
  }
});

socket.on("updateTricksWonByPlayer", function (data) {
  //XXXXXXXXXXXXXX
  // data.table.trickNo++;
  $("#lastTrick").hide();
  $("#lastTrickName").hide();
  $("#newRound").show();
  $("#table").text("");
  // $("#table").append(
  //   "<div style='margin-top:2px; margin-left:0px; float: left; z-index:1' '=''><img class='card0' width='100' src='resources/4C.png'></div>"
  // );
  // $("#table").text("<p> Test </p>");
  for (let i = 0; i < data.table.playerLimitAct; i++) {
    var a = 0;
    var b = 0;
    var c = 0;
    var d = 0;
    var e = 0;
    var res = "";
    if (data.table.players[i].trickCards == "") {
    } else {
      pixel = 0;
      $.each(data.table.players[i].trickCards, function (k, v) {
        index = k + 1;
        $("#table").append(
          "<div style='margin-top:2px; margin-left:" +
            pixel +
            "px; float: left; z-index:" +
            index +
            "''><img class='card" +
            k +
            "' width=80 src=resources/" +
            v +
            ".png /></div>"
        );
        if (index % data.table.playerLimitAct == 1) {
          pixel = pixel - 45;
        }
        if (pixel >= 0) {
          pixel = (pixel + 40) * -1;
        } else {
          if (pixel <= -40) pixel = pixel - 1;
          if (index % data.table.playerLimitAct == 0) {
            pixel = pixel + 45;
          }
        }
      });
    }
    var cardString = data.table.players[i].trickCards.toString();
    res = cardString.match(/1/g);
    if (res != null) {
      a = res.length;
    }
    res = cardString.match(/2/g);
    if (res != null) {
      b = res.length;
    }
    res = cardString.match(/3/g);
    if (res != null) {
      c = res.length;
    }
    res = cardString.match(/4/g);
    if (res != null) {
      d = res.length;
    }
    res = cardString.match(/5/g);
    if (res != null) {
      e = res.length;
    }
    var punkte = 11 * a + 10 * b + 2 * c + 3 * d + 4 * e;
    // var punkte = 10;
    $("#table").append(
      "<p> " +
        punkte +
        " Punkte hat Spieler: " +
        data.table.players[i].name +
        "</p><br><br><br><br>"
    );
  }
});

socket.on("updateHand", function (data) {
  $("#hand").text("");
  $("#cards").find("option").remove().end();
  pixel = 0;
  $.each(data.hand, function (k, v) {
    index = k + 1;
    $("#hand").append(
      "<div style='margin-top:2px; margin-left:" +
        pixel +
        "px; float: left; z-index:" +
        index +
        "''><img class='card" +
        k +
        "' width=100 src=resources/" +
        v +
        ".png /></div>"
    );
    $(".card" + k).click(function () {
      playCard(k, v);
      return false;
    });
    if (pixel >= 0) {
      pixel = (pixel + 40) * -1;
    } else {
      if (pixel <= -40) pixel = pixel - 1;
    }
  });
});

socket.on("turn", function (data) {
  if (data.won) {
    $("#playArea").hide();
    if (data.won == "yes") {
      $("#progressUpdate").html(
        "<span class='label label-success'>You won - well done! Game over.</span>"
      );
    } else {
      $("#progressUpdate").html(
        "<span class='label label-info'>You lost - better luck next time. Game over.</span>"
      );
    }
  } else {
    if (data.myturn) {
      $("#progressUpdate").html(
        "<span class='label label-important'>Noch keine Karte gespielt.</span>"
      );
      socket.emit("preliminaryRoundCheck", { tableID: socket.tableID }); //When a player has a turn, we need to control a few items, this is what enables us to make it happen.
    } else {
      $("#progressUpdate").html(
        "<span class='label label-info'>Du hast bereits eine Karte gespielt.</span>"
      );
    }
  }
});

socket.on("showTrickNo", function (data) {
  // var spanClass = "badge-success";
  // var plural = "s";
  // if (data.cardsInHand <= 2) {
  //   spanClass = "badge-important";
  // }
  // if (data.cardsInHand <= 1) {
  //   plural = "";
  // }
  $("#runde").html(
    // "Runde (tbd) <span class='badge " +
    "Runde: <span class='label label-info'>" +
      // spanClass +
      // "''>" +
      data.roundNo +
      "</span>"
  );
  // $("#opponentCardCount").html(
  //   "Your opponent has <span class='badge " +
  //     spanClass +
  //     "''>" +
  //     data.cardsInHand +
  //     "</span> card" +
  //     plural +
  //     " in hand."
  // );
});

socket.on("tableFull", function () {
  $("#tableFull").fadeIn("slow");
});

// $-Funktionen & initial hide
// $(document).ready(function() {
//   $("#tableFull").hide();
//   $("#playArea").hide();
//   $("#waiting").hide();
//   $("#error").hide();
//   $("#name").focus();
//   $("#progressUpdate").hide();
//   $("#penalising").hide();
//   $("#numberRequest").hide();
//   $("#suiteRequest").hide();
//   $("form").submit(function(event) {
//     event.preventDefault();
//   });

//   $("#suiteRequestBtn").click(function() {
//     var request = $("#suiteRequestTxt").val();
//     socket.emit("suiteRequest", { tableID: 1, request: request });
//     console.log("called with request ==> " + request);
//   });

//   $("#join").click(function() {
//     var name = $("#name").val();
//     var ID = $("#tableID").val();
//     if (name.length > 0) {
//       socket.emit("connectToServer", { name: name });
//       socket.emit("connectToTable", { tableID: ID });
//       $("#loginForm").hide();
//       $("#tableFull").hide();
//       $("#waiting").show();
//       socket.on("ready", function(data) {
//         $("#waiting").hide();
//         $("#playArea").show();
//         $("#progressUpdate").show();
//       });
//     } else {
//       $("#error").show();
//       $("#error").append('<p class="text-error">Please enter a name.</p>');
//     }
//   });

//   //Stich nehmen
//   $("#takeTrick").click(function() {
//     socket.emit("takeTrick", { tableID: 1 });
//   });
//   //Stich zurückgeben
//   $("#returnTrick").click(function() {
//     socket.emit("returnTrick", { tableID: 1 });
//   });
//   //Karte zurücknehmen
//   $("#returnCard").click(function() {
//     socket.emit("returnCard", { tableID: 1 });
//   });
//   //sortieren
//   $("#sortCards").click(function() {
//     socket.emit("sortCards", { tableID: 1 });
//   });

//   /*penalising card taken button*/

//   $("#penalising").click(function() {
//     socket.emit("penalisingTaken", { tableID: 1 });
//     $("#penalising").hide();
//   });
// });
