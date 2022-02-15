const express = require('express');
const cors = require('cors');
const api = require('./api');
const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());
app.listen(port, () => {
    console.log("SOPES_P1 API is running in port: ",port);
})

app.get("/getRecords/", api.getRecords);