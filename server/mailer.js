const nodemailer = require("nodemailer")

const sendTo = "sharmarajat687@gmail.com"
const sendMailer = (sendTo) => {

    const OTP = Math.round(Math.random(10) * 1000000)

    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "sharmarajat687@gmail.com",
            pass: "wdieombwdygdbiez"
        }
    })

    var mailOptions = {
        from: "sharmarajat687@gmail.com",
        to: sendTo,
        subject: "Forget Password - Project NodeJS",
        text: `Your OTP for forget password is ${OTP}`
    }

    transporter.sendMail(mailOptions, (err, resp) => {
        if (err) {
            console.log("err : ".err)
            return err
        }
        else {
            console.log("resp : ".resp)
            return resp
        }
    })
}

module.exports = {
    sendMailer
}