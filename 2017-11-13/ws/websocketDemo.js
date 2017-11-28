const http = require('http');
const io = require('socket.io');

//1. http 服务
const server = http.createServer();
server.listen(8080);

//2. ws 服务
const wsServer = io.listen(server);
wsServer.on('connection',socket=>{
  socket.on('flag',function(n1,n2,n3){
      console.log(n1,n2,n3);
  });
});
