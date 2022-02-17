const mongoose = require('mongoose');
require('dotenv').config();

const URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/SO_Practica1?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`;

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch((error) => {
    console.log("Connection error: ",error);
});

const connection = mongoose.connection;

connection.once('open', () => {
    console.log("MongoDB is Connected");
});