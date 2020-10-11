const fs = require('fs');
const express = require('express');
const mariadb = require('mariadb');
const winston = require('winston');
const dateformat = require('dateformat');
const bodyParser = require('body-parser');

const DBOptions = {
  host: 'localhost', 
  user:'ajoumaker',
  //password: '',
  database: 'ajoumaker',
  idleTimeout: 0
};
const app = express();
const pool = mariadb.createPool(DBOptions);
let db;
(async function() { db = await pool.getConnection(); })();

let logger = new winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: '/home/luftaquila/HDD/ajoumaker/server/server.log',
      maxsize: 10485760, //10MB
      maxFiles: 1,
      showLevel: true,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
    })
  ],
  exitOnError: false,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(3130, async function() {
  db = await pool.getConnection();
  console.log('Server startup at ' + new Date() + '\nServer is listening on port 3130');
  logger.info('Server Startup.', { ip: 'LOCALHOST', url: 'SERVER', query: '-', result: 'Server listening on port 3130'});
  setInterval(async function() {
    try {
      let query = 'SHOW TABLES;';
      let result = await db.query(query);
      logger.info('DB connection check.', { ip: 'LOCALHOST', url: 'SERVER', query: query ? query : 'Query String Not generated.', result: JSON.stringify(result) });
    }
    catch(e) {
      db = await pool.getConnection();
      logger.error('DB connection closed. Attempting reconnect.', { ip: 'LOCALHOST', url: 'SERVER', query: 'pool.getConnection()', result: JSON.stringify(db) });
    }
  }, 300000);
});

app.post('/adminVerification', async function(req, res) {
  if(!req.body.code) return res.status(499).send();
  let query = 'SELECT `name` FROM `admins` WHERE `code`=' + req.body.code + ';'
  let result = await db.query(query);
  if(result.length) res.send(result);
  else res.status(499).send();
});

app.post('/apply', async function(req, res) {
  let query = 'INSERT INTO `records`(`name`, `affiliation`, `phone`, `purpose`, `machine`, `usage`, `identity`, `cost`, `payment`, `responsibility`)' +
              " VALUES('" + req.body['name'] + "', '" + req.body['affiliation'] + "', '" + req.body['phone'] + "', '" + req.body['purpose'] + "', '" + req.body['machine'] + "', '" + req.body['usage'] + "', '" + req.body['identity'] + "', '" + req.body['cost'] + "', '" + req.body['payment'] + "', '" + req.body['responsibility'] + "');";
  let result = await db.query(query);
  res.send(result);
});

app.post('/requestHistory', async function(req, res) {
  let query = "SELECT * FROM `records`;";
  let result = await db.query(query);
  res.send(result);
});

app.post('/requestAdmins', async function(req, res) {
  let query = "SELECT * FROM `admins`;";
  let result = await db.query(query);
  res.send(result);
});

app.post('/addAdmin', async function(req, res) {
  let query, result
  try {
    query = 'INSERT INTO `admins`(`name`, `code`)' +
            " VALUES('" + req.body['name'] + "', '" + req.body['code'] + "');";
    result = await db.query(query);
  }
  catch(e) { res.status(400).send(); }
  res.send(result);  
});

app.post('/deleteAdmin', async function(req, res) {
  if(req.body['code'] == 3691) return res.send({ result: 'fail', msg: '시스템 관리자는 삭제할 수 없습니다.' });
  let query = 'DELETE FROM `admins` WHERE `code`=' + req.body['code'] + ";";
  let result = await db.query(query);
  res.send(result);  
});

app.post('/updateNotice', async function(req, res) {
  let query, result;
  try {
    query = "UPDATE `settings` SET `value`='" + req.body['notice'] + "' WHERE `key`='notice';";
    result = await db.query(query);
  }
  catch(e) { res.status(400).send(); }
  res.send(result);  
});

app.post('/requestSetting', async function(req, res) {
  let query, result;
  try {
    query = "SELECT `value` FROM `settings` WHERE `key`='" + req.body['key'] + "';";
    result = await db.query(query);
  }
  catch(e) { res.status(400).send(); }
  res.send(result);
});


