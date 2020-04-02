var expect = require("chai").expect;
var io = require("socket.io-client");

// var app = require("../testServer/index");
var app = require("../server.js");

var SocketTester = require("../index");

var socketUrl = "http://localhost:5000";

var options = {
  transports: ["websocket"],
  "force new connection": true,
};

var socketTester = new SocketTester(io, socketUrl, options);
var room = "Dokotisch 1";

describe("Sockets", function () {
  // test.js

  it("should send and receive a message", function (done) {
    var client1 = {
      emit: {
        connectToServer: { name: "Hans1" },
        // connectToTable: ""
      },
      on: {
        // logging: socketTester.shouldBeCalledNTimes(4)
        // logging: socketTester.shouldBeCalledNTimesWith(["2", { message: "Hans1 has connected to server." }]),
        logging: socketTester.shouldBeCalledWith({
          message: "Hans1 has connected to server.",
        }),
      },
    };

    // var client2 = {
    //   emit: {
    //     // connectToServer: { name: "Hans2" },
    //     connectToTable: ""
    //     // "join room": room,
    //     // message: "test"
    //   }//,
    //   // on: {
    //   // logging: socketTester.shouldBeCalledWith({ message: "Hans2 has connected to server." })
    //   // logging: socketTester.shouldBeCalledNTimes(2),
    //   // logging: socketTester.shouldBeCalledNTimes(2)
    //   // }
    // };

    // var client3 = {
    //   emit: {
    //     // connectToServer: { name: "Hans3" },
    //     connectToTable: ""
    //   }
    // };

    // var client4 = {
    //   emit: {
    //     // connectToServer: { name: "Hans4" },
    //     connectToTable: ""
    //   }
    // }

    // socketTester.run([client1, client2], done);
    socketTester.run([client1], done);
  });

  /* it("should send and recieve a message only to users in the same room", function (done) {
    var client1 = {
      on: {
        message: socketTester.shouldBeCalledNTimes(1)
      },
      emit: {
        "join room": room
      }
    };

    var client2 = {
      emit: {
        "join room": room,
        message: "test"
      }
    };

    var client3 = {
      on: {
        message: socketTester.shouldNotBeCalled()
      },
      emit: {
        "join room": "room"
      }
    };

    socketTester.run([client1, client2, client3], done);
  }); */
});
