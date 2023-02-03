const express = require("express")
const app = express.Router();
const Users = require("../models/Users")
const encryptDecrypt = require("../server/encrypt")
const token = require("../server/token")

// home api message
app.get("/", (req, res) => {
    return res.status(200).json("Servering is working")
})

// fetch all data
app.get("/fetchAllData", async (req, res) => {
    try {
        const validateToken = token.verifyToken(req.headers.bearer)
        if (validateToken) {
            let data = await Users.find({})
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
        return res.status(500).json(error)
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
        return res.status(500).json(error)
    }
})

// save new user
app.post("/saveUser", async (req, res) => {
    try {
        const validateToken = token.verifyToken(req.headers.bearer)
        if (validateToken) {
            const checkUser = await Users.findOne({ "email": req.body.email })
            if (checkUser) {
                return res.status(200).json({ "message": "User Already Exists" })
            }
            const data = {
                name: req.body.name,
                email: req.body.email,
                password: await encryptDecrypt.encrypt(req.body.password)
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
        else {
            return res.status(200).json({ "message": "Authorization Failed" })
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

// url not found
app.get("/*", (req, res) => {
    res.status(404).json({ "message": "The URL you lookin is not found" })
})

module.exports = app;