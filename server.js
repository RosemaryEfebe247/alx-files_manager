const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { PORT=5000 } = process.env
const routes = require('./routes/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`)
})
