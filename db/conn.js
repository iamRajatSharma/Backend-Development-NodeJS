const mongoose = require("mongoose")
const url = "mongodb://localhost:27017/test"

mongoose.connect(url, (err) => {
    if (err) {
        console.log(err.name)
    }
    else{
        console.log("DB Connected")
    }
})