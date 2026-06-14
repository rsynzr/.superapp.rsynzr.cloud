function validate(payload) {
    if (payload.action !== "trigger") {
        return { valid: false, message: "Action SOS hanya boleh 'trigger'" };
    }
    return { valid: true };
}

module.exports = {
    validate,
};
