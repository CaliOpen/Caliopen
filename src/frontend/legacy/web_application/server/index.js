const http = require('http');
let app = require('./app');

const server = http.createServer(app);

server.listen(app.get('port'), () => {
  console.log(`Server started: http://localhost: ${app.get('port')}/`);
});

if (module.hot) {
  // This will handle HMR and reload the server
  module.hot.accept('./app.js', () => {
    server.removeListener('request', app);
    // eslint-disable-next-line global-require
    app = require('./app.js');
    server.on('request', app);
    console.log('Server reloaded!');
  });
}
