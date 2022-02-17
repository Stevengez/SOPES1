const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
require('./db/database');
const api = require('./controller/controller');

app.use(express.json());
app.use(cors());
app.listen(port, () => {
    console.log("SOPES_P1 API is running in port: ",port);
});

app.post("/addOperation/", api.addOperation);
app.get("/getRecords/", api.getOperations);