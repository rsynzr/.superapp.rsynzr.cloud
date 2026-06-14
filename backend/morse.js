const validActions = new Set(["send"]);

function validate(payload) {
    if (!validActions.has(payload.action)) {
        return { valid: false, message: "Action Morse tidak valid. Gunakan 'send'" };
    }

    if (!payload.data || typeof payload.data.text !== "string" || payload.data.text.trim().length === 0) {
        return { valid: false, message: "Payload Morse harus berisi data.text" };
    }

    return { valid: true };
}

module.exports = {
    validate,
};
