//live  ssh://root@104.236.154.248/root/repo.git (fetch)

var app = require('./server-config.js');

var port = 4567;

app.listen(port);

console.log('Server now listening on port ' + port);
