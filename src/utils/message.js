const generateMessage = (username, message) => {
    return {
        "username": username,
        "text": message,
        "createdAt": new Date().getTime(),
    }
};

const generateLocation = (username, lat, lon) => {
    return {
        "username": username,
        "latitude": lat,
        "longitude": lon,
        "createdAt": new Date().getTime(),
    }
}

module.exports = {
    generateMessage,
    generateLocation,
};