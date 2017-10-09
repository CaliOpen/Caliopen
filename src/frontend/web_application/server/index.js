const http = require('http');
const app = require('./app');

const server = http.createServer(app);

server.listen(app.get('port'), () => {
  console.log(`Server started: http://localhost:${app.get('port')}/`);
});
