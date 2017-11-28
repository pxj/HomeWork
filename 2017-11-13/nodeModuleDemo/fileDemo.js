const http = require('http');
const fs = require('fs');

let server = http.createServer((req, res) => {
  console.log("req=" + req.url);
  // localhost:8080/one.txt
  fs.readFile(`source${req.url}`, (err, data) => {
    if (err) {
      fs.readFile(`error/404.html`, (err, data) => {
        if (err) {
          res.writeHeader(404);
          res.write('Not Found');
        } else {
          res.writeHeader(404);
          res.write(data);
        }
        res.end();
      });
    } else {
      res.write(data);
      res.end();
    }
  });
});

server.listen(8080);
