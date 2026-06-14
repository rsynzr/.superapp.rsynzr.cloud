function formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `[${level}] ${timestamp} - ${message}`;
}

function info(message) {
    console.log(formatMessage("INFO", message));
}

function warning(message) {
    console.warn(formatMessage("WARNING", message));
}

function error(message) {
    console.error(formatMessage("ERROR", message));
}

module.exports = {
    info,
    warning,
    error,
};
