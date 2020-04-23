require("dotenv").config();
const path = require("path");
const express = require("express");
const http = require("http");
const app = express();

const socket = require("socket.io");
const io = socket(server);

const users = {};

io.on('connection', socket => {
    if (!users[socket.id]) {
        users[socket.id] = socket.id;
    }
    socket.emit("yourID", socket.id);
    io.sockets.emit("allUsers", users);
    socket.on('disconnect', () => {
        delete users[socket.id];
    })

    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('hey', {signal: data.signalData, from: data.from});
    })

    socket.on("acceptCall", (data) => {
        io.to(data.to).emit('callAccepted', data.signal);
    })
});

if (process.env.PROD) {
  app.use(express.static(path.join(__dirname, './client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`app is listening on port ${port}`));

const server = http.createServer(app);
server.listen(8000, () => console.log('server is running on port 8000'));


