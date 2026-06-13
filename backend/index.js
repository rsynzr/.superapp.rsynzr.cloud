const express = require("express");
const http = require("http");

const setupWebSocket = require("./websocket");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send("SuperApp Backend Running");
});

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});