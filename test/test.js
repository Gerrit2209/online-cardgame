// test/test.js

var expect = require("chai").expect;
var io = require("socket.io-client");

var app = require("../server.js");

var socketUrl = "http://localhost:5000";

var options = {
  transports: ["websocket"],
  "force new connection": true,
};

var room = "lobby";

describe("Sockets", function () {
  var client1, client2, client3;

  // testing goodness goes here

  // ... test.js

  it("should send and receive a message", function (done) {
    // Set up client1 connection
    client1 = io.connect(socketUrl, options);

    // Set up event listener.  This is the actual test we're running
    client1.on("logging", function (msg) {
      expect(msg.message).to.equal("Hans1 has connected to server.");

      // Disconnect both client connections
      client1.disconnect();
      // client2.disconnect();
      done();
    });

    client1.on("connect", function () {
      client1.emit("connectToServer", { name: "Hans1" });

      // Set up client2 connection
      // client2 = io.connect(socketUrl, options);

      // client2.on('connect', function(){

      //   // Emit event when all clients are connected.
      //   client2.emit('join room', room);
      //   client2.emit('message', 'test');
      // });
    });
  });
});
