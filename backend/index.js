const express = require("express");
const http = require("http");
const path = require("path");

const setupWebSocket = require("./websocket");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../website")));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../website/pages/home.html"));
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.0" });
});

const server = http.createServer(app);

setupWebSocket(server);

server.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});