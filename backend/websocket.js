const WebSocket = require("ws");

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log("Client terhubung");

        ws.send("Terhubung ke server!");

        ws.on("message", (message) => {
            console.log("Pesan:", message.toString());

            // Kirim balik ke client
            ws.send(`Server menerima: ${message}`);
        });

        ws.on("close", () => {
            console.log("Client terputus");
        });
    });

    return wss;
}

module.exports = setupWebSocket;