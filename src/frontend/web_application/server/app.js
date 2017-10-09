const express = require('express');
const path = require('path');
const applyAPI = require('./api');
const applySecurity = require('./security');
const applyAssets = require('./assets');
const applyAuth = require('./auth');
const applyConfig = require('./config');
const applyError = require('./error');

const app = express();

app.set('port', (process.env.PORT || 4000));

//-------
applyConfig(app);
applySecurity(app);
applyAuth(app);
applyAssets(app);
applyAPI(app);

if (HAS_SSR) {
  // eslint-disable-next-line global-require
  const applySSR = require('./ssr');
  applySSR(app);
} else {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/server/template.html'));
  });
}
applyError(app);

module.exports = app;
