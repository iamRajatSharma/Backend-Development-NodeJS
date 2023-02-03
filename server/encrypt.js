const bcrypt = require("bcrypt")
const SECRET_KEY = "hello"

const encrypt = async (password) => {
    return await bcrypt.hash(password, 10)
}

const decrypt = async (userPassword, enterPassword) => {
    return await bcrypt.compare(userPassword, enterPassword)
}


module.exports = {
    encrypt,
    decrypt
}