const path = require("path");
const http = require("http");
const express = require("express");

const socketio = require("socket.io");

const Filter = require("bad-words");
const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

// Express static middleware
app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New ws connection");

  // // send to this socket only
  // socket.emit("message", generateMessage("Welcome")); //socket.send("Welcome");

  // //Send to all except this socket
  // socket.broadcast.emit("message", generateMessage("A new user has joined"));

  socket.on("join", ({ username, room }, callback) => {
    // adduser to array return user OR error
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      // let the client know
      return callback(error); // can use an else statment
    }

    // use socket.io feature to join room
    socket.join(user.room);
    // variation of io.emit in room : io.to.emit()

    // send to this socket only
    socket.emit("message", generateMessage("Admin", "Welcome")); //socket.send("Welcome");

    //Send to all in room except this socket
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback(); // if no error
  });

  socket.on("sendMessage", (
    msg,
    /*call this func to acknowledge the event*/ callback
  ) => {
    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("Profanity not allowed");
    }

    // emit to all in the room
    const user = getUser(socket.id);

    io.to(user.room).emit("message", generateMessage(user.username, msg));
    callback(); // Can stay empty or send back a message
  });

  socket.on("disconnect", () => {
    // remove user
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage("Admin", `${user.username} has left!`)
      );

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });

  socket.on("sendLocation", (obj, callback) => {
    // emit to all in the room
    const user = getUser(socket.id);

    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${obj.latitude},${obj.longitude}`
      )
    );
    callback();
  });
});

server.listen(port, () => {
  console.log(`Example running on port ${port}`);
});
