const http = require('http');
const multer = require('multer');
const mkdirp = require('mkdirp');
const express = require('express');
const dateUtil = require('date-utils');
const bodyParser = require('body-parser');

const PORT = 80;
const app = express();
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    req.body.info2 = req.body.info2.replace('*', 'x').replace('/', '&').replace(':', '');
    var dest = __dirname + '/images/' + req.body.info1 + ' ' + req.body.info2;
    mkdirp.sync(dest);
    cb(null, dest);
  },
  filename: function(req, file, cb) { cb(null, file.originalname); }
});

app.use(express.static('report'));
app.listen(PORT, () => { console.log(' Serving HTTP on 0.0.0.0 port ' + PORT + ' (http://0.0.0.0:' + PORT + '/)'); });
app.post('/upload', multer({ storage: storage }).single('image'), (req, res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") ip = ip.substr(7);
  console.log('\n [' + new Date() + ']');
  console.log(' IP / HTTP : ' + ip + ' / ' + req.method);
  console.log(' User      : ' + req.body.info1);
  console.log(' Machine   : ' + req.body.info2);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<script>alert("정상 인증 되었습니다.");  window.location.href = "/";</script>');
});
app.use(function(err, req, res, next) { console.log(err.stack); });
app.use(function(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") ip = ip.substr(7);
  console.log('\n [' + new Date() + ']');
  console.log(' IP / HTTP : ' + ip + ' / ' + req.method);
});
