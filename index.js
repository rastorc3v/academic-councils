const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

const routes = require('./routes')(app);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});