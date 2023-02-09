const mongoose = require("mongoose")
const OTPSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model("otp", OTPSchema)