
/**
 * Module dependencies.
 */
if(!process.env.NODE_ENV){
  process.env.NODE_ENV = "development"
}
process.env.TZ = 'Asia/Kolkata'

var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var morgan = require('morgan');
var favicon = require('serve-favicon');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorhandler = require('errorhandler');
var crypto = require('crypto');
var i18n = require('i18n');
var vger = require('./config/vger');
var nodeVger = require('node-vger')(vger);
var http = require('http');
var path = require('path');
var domain = require('domain');
var url = require("url");
var _ = require('underscore');
var app = express();
var logger = require('./logger');
var net = require('net');
var fs = require("fs");
var sesMailer = require("./mailer");
var asset_config = JSON.parse(fs.readFileSync(__dirname + "/config/assets.json", "utf8"));
var csswring = require("csso");
var uglifyjs = require("uglify-js");
var assets = require('connect-assets')(asset_config);
var extensions = require("./extensions");
var flash = require('connect-flash');


var index = require("./routes/index");

// i18n configuration
i18n.configure({
                locales: ['en'],
                defaultlocale: 'en',
                directory: __dirname + '/locales'
              });

//app.set('port', process.env.PORT || 3005);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(i18n.init);
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());
app.use(assets);
app.use(methodOverride('_method'));
app.use(cookieParser("secret"));
app.use(session({
  name: "metrics.jombay.com",
  genid: function(request) {
    return crypto.randomBytes(48).toString('hex');
  },
  secret: "weqweqwe7657657tgbwujasdsadasdqweqweqwewerasdadsa45tgbd876as87d68as5d76as5d675as67d5as7",
  cookie: {
    maxAge: 36000000,
    httpOnly: false // <- set httpOnly to false
  },
  resave: true,
  saveUninitialized: true
}));
//app.use(express.logger('dev'));
var helpers = require('./helpers').define_helpers({app: app});

app.use(flash());

app.use(function(request,response,next) {
  request.scope = 'user';
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', require('ejs').renderFile);

app.use('/', index);

// development only
if ('development' == app.get('env')) {
  app.use(errorhandler());
};

if ('development' != app.get('env')) {
  app.use(function(err,request,response,next) {
    if(response.statusCode >= 200 && response.statusCode < 400){
      response.status(500);
    }
    logger.err("Status Code : " + response.statusCode);
    switch(response.statusCode) {
      case 401:
        response.render(response.statusCode+".html");
        break;
      case 404:
        // Send error notification
        logger.err("Sending Error Email");
        sesMailer.report_error(request,err);
        response.render(response.statusCode+".html");
        break;
      case 500:
        // Send error notification
        logger.err("Sending Error Email");
        sesMailer.report_error(request,err);
        response.render(response.statusCode+".html");
        break;
      default:
        next(err);
        break;
    }
  });
}

var port = process.env.PORT || (__dirname+"/tmp/app.sock");
var server = http.createServer(app);
// port is a UNIX socket file
server.on('listening', function() {
  // set permissions
  return fs.chmod(port, 0777);
});

// double-check EADDRINUSE
server.on('error', function(e) {
  if (e.code !== 'EADDRINUSE') throw e;
  net.connect({ path: port }, function() {
    // really in use: re-throw
    //throw e;
    fs.unlinkSync(port);
    server.listen(port);
  }).on('error', function(e) {
    if (e.code !== 'ECONNREFUSED') throw e;
    // not in use: delete it and re-listen
    fs.unlinkSync(port);
    server.listen(port);
  });
});

server.listen(port, function() {
  require('util').log("Listening on " + port);
  
  // downgrade process user to owner of this file
  return fs.stat(__filename, function(err, stats) {
    if (err) throw err;
    return process.setuid(stats.uid);
  });
});

