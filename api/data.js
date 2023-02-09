const express = require("express")
const app = express.Router();
const Users = require("../models/Users")
const encryptDecrypt = require("../server/encrypt")
const token = require("../server/token")
const mailer = require("../server/mailer")
const nodemailer = require("nodemailer")
const sendTo = "sharmarajat687@gmail.com"
const OTPModel = require("../models/Otp")

// home api message
app.get("/", (req, res) => {
    return res.status(200).json("Servering is working")
})

// fetch all data
app.get("/fetchAllData", async (req, res) => {
    try {
        const validateToken = token.verifyToken(req.headers.bearer)
        if (validateToken) {
            let data = await Users.find({}).select({ name: 1, email: 1, mobile: 1, _id: 1 }).sort({ _id: -1 })
            if (data.length > 0) {
                return res.send({ "message": "Record Fetched Successfully", "count": data.length, "data": data })
            }
            else {
                return res.status(400).json({ "message": "No Data Found" })
            }
        }
        else {
            return res.status(200).json({ "message": "Authorization Failed" })
        }
    }
    catch (error) {
        return res.status(500).json(error)
    }
})

// fetch single data
app.get("/fetchSingleData/:id", async (req, res) => {
    try {
        const validateToken = token.verifyToken(req.headers.bearer)
        if (validateToken) {
            let data = await Users.findOne({ _id: req.params.id })
            if (data) {
                return res.status(200).json({ "message": "Record Fetched Successfully", data })
            }
            else {
                return res.status(200).json({ "message": "No Data Found" })
            }
        }
        else {
            return res.status(200).json({ "message": "Authorization Failed" })
        }
    }
    catch (error) {
        return res.status(500).json({ error, "message": "Data Not Found" })
    }
})

// delete single data
app.get("/deleteSingleData/:id", async (req, res) => {
    try {
        const validateToken = token.verifyToken(req.headers.bearer)
        if (validateToken) {
            let data = await Users.deleteOne({ _id: req.params.id })
            return res.send({ "message": "Record Deleted Successfully", data })
        }
        else {
            return res.status(200).json({ "message": "Authorization Failed" })
        }
    }
    catch (error) {
        return res.status(500).json({ error, "message": "Data Not Found" })
    }
})

// save new user
app.post("/saveUser", async (req, res) => {
    try {
        const checkUser = await Users.findOne({ "email": req.body.email })
        if (checkUser) {
            return res.status(200).json({ "message": "User Already Exists" })
        }
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: await encryptDecrypt.encrypt(req.body.password),
            mobile: req.body.mobile
        }
        let result = await new Users(data)
        result = await result.save()
        if (result) {
            return res.status(200).json({ "message": "User Saved Successfully", result })
        }
        else {
            return res.status(401).json({ "message": "Something Wrong" })
        }
    }
    catch (error) {
        return res.status(500).json(error)
    }
})


// login user
app.post("/login", async (req, res) => {
    try {
        let checkUser = await Users.findOne({ "email": req.body.email })
        if (!checkUser) {
            return res.status(200).json({ "message": "User Not Exists" })
        }

        const checkpassword = await encryptDecrypt.decrypt(req.body.password, checkUser.password)
        if (checkpassword) {
            const userToken = token.generateToken(checkUser.email)
            return res.status(200).json({ "message": "Logged in Successfully", userToken, checkUser })
        }
        else {
            return res.status(404).json({ "message": "Password Not Matched" })
        }
    }
    catch (error) {
        return res.status(500).json(error)
    }
})


// display dashboard route
app.post("/dashboard", async (req, res) => {
    try {
        const validateToken = token.verifyToken(req.headers.bearer)
        if (validateToken) {
            return res.status(200).json({ "message": "Authorization Successfull", "data": "Data Fetched" })
        }
        else {
            return res.status(200).json({ "message": "Authorization Failed" })
        }
    }
    catch (error) {
        return res.status(500).json(error)
    }
})

// forget password
app.post("/forget-password", async (req, res) => {
    let checkUser = await Users.findOne({ "email": req.body.email, "mobile": req.body.mobile })
    if (!checkUser) {
        return res.status(200).json({ "message": "User Not Exists" })
    }

    const OTP = Math.round(Math.random(10) * 1000000)
    const d = new Date();

    const saveOTPDetails = {
        email: checkUser.email,
        otp: OTP,
        time: d.getDate() + ":" + parseInt(d.getMonth() + 1) + ":" + d.getFullYear()
    }

    let result = await new OTPModel(saveOTPDetails)
    result = await result.save()

    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "your email id",
            pass: "your email password (Created New App)"
        }
    })

    var mailOptions = {
        from: "your email id",
        to: checkUser.email,
        subject: "Forget Password - Project NodeJS",
        text: `Your OTP for forget password is ${OTP}`
    }

    transporter.sendMail(mailOptions, (err, resp) => {
        if (err) {
            return res.status(200).json({ "message": "Error occured", err })
        }
        else {
            if (result) {
                return res.status(404).json({ "message": "Mailed Sended Successfully" })
            }
            else {
                return res.status(404).json({ "message": "Error Found" })
            }
        }
    })

})


// verfiy-otp
app.post("/verify-otp", async (req, res) => {
    try {
        const d = new Date();
        const time = d.getDate() + ":" + parseInt(d.getMonth() + 1) + ":" + d.getFullYear();

        let checkUser = await OTPModel.findOne({ "email": req.body.email, "time": time }).sort({ _id: -1 })

        if (!checkUser) {
            return res.status(404).json({ "message": "Email not exists" })
        }

        const userOTP = req.body.otp

        if (userOTP == checkUser.otp) {
            return res.status(200).json({ "message": "OTP Matched" })
        }
        else {
            return res.status(404).json({ "message": "OTP Not Matched" })
        }
    }
    catch (err) {
        return res.status(500).json({ "message": err })
    }
})


// set password
app.post("/set-password", async (req, res) => {
    try {
        let checkUser = await OTPModel.findOne({ email: req.body.email, otp: req.body.otp })

        if (!checkUser) {
            return res.status(404).json({ "message": "Email not exists" })
        }
        const pass1 = req.body.pass1
        const pass2 = req.body.pass2

        if (pass1 == pass2) {
            const new_pass = await encryptDecrypt.encrypt(pass1)
            let result = await Users.updateOne({ email: req.body.email }, { $set: { password: new_pass } })
            if (result.modifiedCount == 1) {
                return res.status(200).json({ "message": "Password Changed Successfully" })
            }
            else {
                return res.status(200).json({ "message": "Something Went Wrong" })
            }
        }
        else {
            return res.status(404).json({ "message": "Password && Confirm Password Not Matched" })
        }
    }
    catch (err) {
        return res.status(500).json(err)
    }
})


// url not found
app.get("/*", (req, res) => {
    res.status(404).json({ "message": "The URL you looking is not found" })
})

module.exports = app;