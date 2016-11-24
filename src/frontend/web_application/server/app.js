const path = require('path');
const express = require('express');
const locale = require('locale');
const cookieParser = require('cookie-parser');

const supportedLocales = ['en', 'fr'];

const app = express();

app.set('port', (process.env.PORT || 3000));

//-------
// assets & eventual bundle.js
app.use(express.static(path.join(__dirname, '..', 'public')));

//-------
app.use(locale(supportedLocales));
app.use(cookieParser());
app.get('*', require('./middleware/ssr.js'));

module.exports = app;
