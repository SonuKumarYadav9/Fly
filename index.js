const express = require('express')
const route = require('./routes/route.js')
const mongoose = require('mongoose')
const app = express()
const multer = require("multer")

app.use(express.json())
app.use(multer().any())


mongoose.connect("mongodb+srv://dkumardb:abngf_1996@cluster0.g7ksvc2.mongodb.net/fly?", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err));
    

app.use('/', route)

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port: ' + (process.env.PORT || 3000))
}) 