const express = require('express');
const app = express();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const domain = require('domain');

const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

process.env.TZ = 'Asia/Seoul';

const Logger = require(`${__dirname}/libs/logger`);
global.log = Logger({
  debugFile: `${__dirname}/logs/debug.log`,
  exceptionFile: `${__dirname}/logs/exception.log`,
});

// all environments
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.engine('html', ejs.renderFile);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride());

app.use(express.static(path.join(__dirname, '/public')));
app.enable('trust proxy');

const serverDomain = domain.create();

serverDomain.on('error', (err) => {
  let text = `:: domain error :: ${err.stack}`;

  log.error(text);
});

serverDomain.run(() => {
  const httpServer = http.createServer(app);

  // App 실행
  httpServer.listen(8080);

  log.notice('server start');

  require('./routes/scrapeRouter.js').route(app);
});

// API 에러 처리 미들웨어
app.use((err, req, res, next) => {
  log.error(err);

  let text = `상황 보고 \n`;
  text += 'API 에러가 발생했어!\n\n';
  text += `request : ${req.method} ${req.protocol}://${req.get('host')}${req.originalUrl}\n\n`;
  text += `에러 내용 : \n\n${err.stack}`;

  res.status(500).send('server error. please call for server developer');
});