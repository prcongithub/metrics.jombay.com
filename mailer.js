var fs = require("fs");
var _ = require('underscore');
var logger = require("./logger");
var nodemailer = require("nodemailer");
var options = JSON.parse(fs.readFileSync(__dirname + "/config/mailer.json", "utf8"));
// create reusable transport method (opens pool of SMTP connections)
smtpTransport = nodemailer.createTransport("SES",{
  "AWSAccessKeyID": options.ses.access_key_id,
  "AWSSecretKey": options.ses.secret_key
});
// send mail with defined transport object
// Override receiver of emails to test.user@jombay.com for staging/staging_internal and development environment
module.exports.send_email = function(mailOptions) {
  if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === "staging_internal" || process.env.NODE_ENV === "staging") {
    mailOptions.to = "test.user@jombay.com"
  }
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      logger.err(error);
    }else{
      logger.debug("Message sent: " + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });
}  

module.exports.report_error = function(req,err){
  var html = "<b>Url : </b>"+req.url;
  html += " <br/><br/><br/><b>Parameters : </b><br/><br/><br/>{ <br/>";
  _.each(req.params, function(value,key){
    html += key + " : '" + value+"',<br/>";
  });
  html += " }<br/><br/><br/><b>Headers : </b><br/><br/><br/>{ <br/>";
  _.each(req.headers, function(value,key){
    html += key + " : '" + value+"',<br/>";
  });
  err.stack = err.stack || "";
  html += " }<br/><br/><br/><b>Stacktrace : </b><br/><br/>"+err.stack.replace(/\n/g,"<br/>");
  html += " <br/><br/><b> Error Body : </b>" + err.body;
  mailOptions = {
    from: options.sender,
    to: options.recipients,
    subject: "[IDP "+ process.env.NODE_ENV +"] " + err.message,
    html: html
  }
  module.exports.send_email(mailOptions);
}
