const http = require('http');
const multer = require('multer');
const mkdirp = require('mkdirp');
const express = require('express');
const localtunnel = require('localtunnel');

const PORT = 8000;
const app = express();

var tunnel = localtunnel(PORT, {subdomain: 'ajoumaker'}, function (err, tunnel) {
  console.log('Localhost set to ' + tunnel.url);
});

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    var dest =  __dirname + '/images/' + req.body.info1 + ' ' + req.body.info2;
    mkdirp.sync(dest);
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

app.use(express.static('report'));
app.post('/upload', multer({ storage: storage }).single('image'), (req, res) => {
  console.log(req.body.info1);
  console.log(req.body.info2);
  res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
  res.end('정상 인증 되었습니다.');
});

app.listen(PORT, () => {
  console.log('Serving HTTP on 0.0.0.0 port ' + PORT + ' (http://0.0.0.0:' + PORT + '/)');
});
