const validActions = new Set(["command"]);

function validate(payload) {
    if (!validActions.has(payload.action)) {
        return { valid: false, message: "Action Devices tidak valid. Gunakan 'command'" };
    }

    if (!payload.target || typeof payload.target !== "string") {
        return { valid: false, message: "Devices membutuhkan target" };
    }

    if (!payload.data || typeof payload.data.command !== "string" || payload.data.command.trim().length === 0) {
        return { valid: false, message: "Payload Devices harus berisi data.command" };
    }

    return { valid: true };
}

module.exports = {
    validate,
};
