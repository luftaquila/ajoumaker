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
  logger.info('Server Startup.', { ip: 'LOCALHOST', query: 'node index.js', result: 'Server listening on port 3130'});
  setInterval(async function() {
    try {
      let query = 'SHOW TABLES;';
      let result = await db.query(query);
      //logger.info('DB connection check.', { ip: 'LOCALHOST', url: 'SERVER', query: query ? query : 'Query String Not generated.', result: JSON.stringify(result) });
    }
    catch(e) {
      db = await pool.getConnection();
      logger.error('DB connection closed. Attempting reconnect.', { ip: 'LOCALHOST', query: 'pool.getConnection()', result: JSON.stringify(db) });
    }
  }, 300000);
});

app.post('/adminVerification', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  try {
    if(!req.body.code) {
      logger.info('Admin verification attempt.', { ip: ip, query: JSON.stringify(req.body), result: 'HTTP 499 NO_CODE' });
      return res.status(499).send();
    }
    let query = 'SELECT `name` FROM `admins` WHERE `code`=' + req.body.code + ';'
    let result = await db.query(query);
    if(result.length) res.send(result);
    else res.status(499).send();
    logger.info('Admin verification attempt.', { ip: ip, query: JSON.stringify(req.body), result: JSON.stringify(result) });
  }
  catch(e) {
    logger.error('Admin verification attempt failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});

app.post('/apply', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  try {
    let query = 'INSERT INTO `records`(`name`, `affiliation`, `phone`, `purpose`, `machine`, `usage`, `identity`, `cost`, `payment`, `responsibility`)' +
                " VALUES('" + req.body['name'] + "', '" + req.body['affiliation'] + "', '" + req.body['phone'] + "', '" + req.body['purpose'] + "', '" + req.body['machine'] + "', '" + req.body['usage'] + "', '" + req.body['identity'] + "', '" + req.body['cost'] + "', '" + req.body['payment'] + "', '" + req.body['responsibility'] + "');";
    let result = await db.query(query);
    logger.info('Record registration.', { ip: ip, query: JSON.stringify(req.body), result: JSON.stringify(result) });
    res.send(result);
  }
  catch(e) {
    logger.error('Record registration failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});

app.post('/requestHistory', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  try {
    let query = "SELECT * FROM `records`;";
    let result = await db.query(query);
    res.send(result);
  }
  catch(e) {
    logger.error('History request failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});

app.post('/requestAdmins', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  try {
    let query = "SELECT * FROM `admins`;";
    let result = await db.query(query);
    res.send(result);
  }
  catch(e) {
    logger.error('Admin list request failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});

app.post('/addAdmin', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  let query, result;
  try {
    query = 'INSERT INTO `admins`(`name`, `code`)' +
            " VALUES('" + req.body['name'] + "', '" + req.body['code'] + "');";
    result = await db.query(query);
    logger.info('Admin registration.', { ip: ip, query: JSON.stringify(req.body), result: JSON.stringify(result) });
    res.send(result);  
  }
  catch(e) {
    logger.error('Admin registration failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});

app.post('/deleteAdmin', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  try {
    if(req.body['code'] == 3691) return res.send({ result: 'fail', msg: '시스템 관리자니다.' });
    let query = 'DELETE FROM `admins` WHERE `code`=' + req.body['code'] + ";";
    let result = await db.query(query);
    logger.info('Admin elimination.', { ip: ip, query: JSON.stringify(req.body), result: JSON.stringify(result) });
    res.send(result);
  }
  catch(e) {
    logger.error('Admin elimination failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});

app.post('/updateNotice', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  let query, result;
  try {
    query = "UPDATE `settings` SET `value`='" + req.body['notice'] + "' WHERE `key`='notice';";
    result = await db.query(query);
    logger.info('Notice update.', { ip: ip, query: JSON.stringify(req.body), result: JSON.stringify(result) });
    res.send(result);  
  }
  catch(e) {
    logger.error('Notice update failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});

app.post('/requestSetting', async function(req, res) {
  const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;
  let query, result;
  try {
    query = "SELECT `value` FROM `settings` WHERE `key`='" + req.body['key'] + "';";
    result = await db.query(query);
    // logger.info('Settings request.', { ip: ip, query: JSON.stringify(req.body), result: JSON.stringify(result) });
    res.send(result);
  }
  catch(e) {
    logger.error('Settings request failure.', { ip: ip, query: JSON.stringify(req.body), result: e.toString() });
    res.status(400).send(); 
  }
});


