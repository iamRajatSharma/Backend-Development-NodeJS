const JWT_TOKEN = "!@#$%^&*()_+1234567890-="
const jwt = require("jsonwebtoken")

const verifyToken = (data) => {
    return jwt.verify(data, JWT_TOKEN)
}

const generateToken = (data) =>{
    return jwt.sign(data, JWT_TOKEN)
}

module.exports = {
    verifyToken,
    generateToken
}