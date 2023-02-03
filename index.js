const express = require("express")
const app = express();
const bodyParser = require("body-parser")
const PORT = 3000
require("./db/conn")


app.use(express.json())
app.use("/", require("./api/data"))

app.listen(PORT, (err)=>{
    if(err) console.log(err)
    console.log(`Server is running on port ${PORT}`)
})