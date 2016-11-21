const path = require('path');
const express = require('express');

const app = express();

app.set('port', (process.env.PORT || 3000));

//-------
// assets & eventual bundle.js
app.use(express.static(path.join(__dirname, '..', 'public')));

//-------
app.get('*', require('./middleware/ssr.js'));

module.exports = app;
