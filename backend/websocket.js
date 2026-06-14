const WebSocket = require("ws");

const clients = new Map();
let nextClientId = 1;

function log(level, message) {
    const time = new Date().toISOString();
    console.log(`[${level}] ${time} - ${message}`);
}

function createClientId(clientType, deviceName) {
    const base = clientType ? clientType.toLowerCase() : "client";
    return `${base}-${nextClientId++}`;
}

function getClientList() {
    return Array.from(clients.values()).map(({ id, clientType, deviceName, status }) => ({
        id,
        type: clientType,
        name: deviceName,
        status,
    }));
}

function broadcast(message, filterFn = () => true) {
    const payload = JSON.stringify(message);
    for (const client of clients.values()) {
        if (client.ws.readyState === WebSocket.OPEN && filterFn(client)) {
            client.ws.send(payload);
        }
    }
}

function sendToTarget(message, target) {
    if (!target || target === "all") {
        broadcast(message);
        return;
    }

    if (typeof target === "string") {
        // exact client id match
        if (clients.has(target)) {
            const client = clients.get(target);
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(message));
            }
            return;
        }

        // broadcast to clientType group if target matches a type
        const normalized = target.toLowerCase();
        broadcast(message, (client) => client.clientType === normalized);
    }
}

function registerClient(ws, payload) {
    const clientType = typeof payload.clientType === "string" ? payload.clientType.toLowerCase() : "unknown";
    const deviceName = payload.deviceName || "Unknown Device";
    const id = payload.clientId || createClientId(clientType, deviceName);

    const client = {
        id,
        ws,
        clientType,
        deviceName,
        status: "online",
    };

    clients.set(id, client);
    ws.clientId = id;

    log("INFO", `Client terdaftar: ${id} (${clientType}) - ${deviceName}`);
    ws.send(JSON.stringify({ type: "registered", clientId: id, clients: getClientList() }));
    broadcast({ type: "registry", clients: getClientList() });
}

function handleEvent(ws, payload) {
    if (!payload.module || !payload.action) {
        log("WARNING", "Event tidak valid diterima");
        ws.send(JSON.stringify({ type: "error", message: "Payload harus berisi module dan action" }));
        return;
    }

    const senderId = ws.clientId || "unknown";
    const event = {
        type: "event",
        module: payload.module,
        action: payload.action,
        target: payload.target || "all",
        data: payload.data || null,
        from: senderId,
        timestamp: new Date().toISOString(),
    };

    log("INFO", `Event diterima dari ${senderId}: ${payload.module}/${payload.action} target=${event.target}`);

    sendToTarget(event, event.target);
}

function cleanupClient(ws) {
    const clientId = ws.clientId;
    if (clientId && clients.has(clientId)) {
        clients.delete(clientId);
        log("INFO", `Client terputus: ${clientId}`);
        broadcast({ type: "registry", clients: getClientList() });
    }
}

function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        log("INFO", "Client terhubung");

        ws.send(JSON.stringify({ type: "hello", message: "Terhubung ke SuperApp WebSocket" }));

        ws.on("message", (message) => {
            let payload;

            try {
                payload = JSON.parse(message.toString());
            } catch (error) {
                log("WARNING", `Pesan non-JSON diterima: ${message.toString()}`);
                ws.send(JSON.stringify({ type: "error", message: "Harap kirim payload JSON" }));
                return;
            }

            if (payload.type === "register") {
                registerClient(ws, payload);
                return;
            }

            if (payload.type === "getRegistry") {
                ws.send(JSON.stringify({ type: "registry", clients: getClientList() }));
                return;
            }

            handleEvent(ws, payload);
        });

        ws.on("close", () => {
            cleanupClient(ws);
        });

        ws.on("error", (error) => {
            log("ERROR", `WebSocket error: ${error.message}`);
        });
    });

    return wss;
}

module.exports = setupWebSocket;