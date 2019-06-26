const http = require('http');
const multer = require('multer');
const mkdirp = require('mkdirp');
const express = require('express');
const dateUtil = require('date-utils');
const bodyParser = require('body-parser');

const PORT = 8000;
const app = express();

const Client = require("ssh2").Client;
const Socket = require("net").Socket;
const conn = new Client();
const config = {
  remoteHost: "ajoumaker",
  remotePort: 80,
  localHost: "localhost",
  localPort: PORT
};

conn
  .on("ready", () => {
    console.log(" SSH Connection ready.");
    conn.shell((err, stream) => {
      if (err) throw err;
      stream.on("data", data => {
        console.log(" SHELL : " + data);
      });
    });
    conn.forwardIn(config.remoteHost, config.remotePort, (err, port) => {
      if (err) throw err;
      conn.emit("forward-in", port);
    });
  })
  .on("tcp connection", (info, accept, reject) => {
    console.log(" Incoming TCP : ", JSON.stringify(info));
    let remote;
    const srcSocket = new Socket();
    srcSocket
      .on("error", err => {
        if (remote === undefined) reject();
        else remote.end();
      })
      .connect(config.localPort, config.localPort, () => {
        remote = accept()
          .on("close", () => {
            console.log(" TCP :: CLOSED\n");
          })
          .on("data", data => {
            if(data.includes('GET') || data.includes('POST'))
              console.log(" TCP :: DATA: " + data.toString().split(/\n/g).slice(0, 2).join("\n") + '\n');
          });
        console.log("\n Remote Connection Accept");
        srcSocket.pipe(remote).pipe(srcSocket);
      });
  })
  .connect({
    host: "serveo.net",
    username: "ajoumaker",
    tryKeyboard: true
  });

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var dest = __dirname + '/images/' + req.body.info1 + ' ' + req.body.info2;
    mkdirp.sync(dest);
    cb(null, dest);
  },
  filename: function(req, file, cb) { cb(null, file.originalname); }
});

app.use(express.static('report'));
app.listen(PORT, () => {
  console.log(' Serving HTTP on 0.0.0.0 port ' + PORT + ' (http://0.0.0.0:' + PORT + '/)');
});
app.post('/upload', multer({ storage: storage }).single('image'), (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") ip = ip.substr(7);
  console.log('\n [' + new Date() + ']');
  console.log(' IP / HTTP : ' + ip + ' / ' + req.method);
  console.log(' User      : ' + req.body.info1);
  console.log(' Machine   : ' + req.body.info2 + '\n');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<script>alert("정상 인증 되었습니다.");  window.location.href = "https://ajoumaker.serveo.net/";</script>');
});
app.use(function(err, req, res, next) {
  console.log(err.stack);
});
//ssh -R ajoumaker.serveo.net:80:localhost:8000 serveo.net
