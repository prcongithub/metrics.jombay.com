var vger = require('./config/vger');
var fs = require("fs");
var moment = require('moment');
var _ = require('underscore');
var Resource = require("node-vger").Resource;
var Role = Resource.Role;

module.exports.auth_token = function(currentUser){
  if(currentUser){
    return currentUser.auth_token;    
  }else{
    return "";
  }
}

module.exports.truncate = function(string,limit) {
  if(string.length > limit) {
    return string.substring(0,limit-3)+"...";
  } else {
    return string;
  }
};

module.exports.root_page_path = function() {
  return "/login";
};

module.exports.format_date_time = function (date,format) {
  if(format) {
    return moment(date).format(format);
  } else {
    return moment(date).format('DD/MM/YYYY hh:mm a');
  }
};

module.exports.format_date = function (date) {
  return moment(date).format('DD/MM/YYYY');
};

module.exports.isIdpCandidate = function(user) {
  return _.contains(user.role_names,Role.IDP_CANDIDATE);
}

module.exports.timeSince = function(previous){
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;
  var current = new Date();
  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    var seconds = Math.round(elapsed/1000);
    return seconds + ' seconds ago';   
  }
  else if (elapsed < msPerHour) {
    var minutes = Math.round(elapsed/msPerMinute);
    return minutes + ' minutes ago';   
  }
  else if (elapsed < msPerDay ) {
    var hours = Math.round(elapsed/msPerHour);
    return hours + " hour"+(hours > 1 ? 's':'')+" ago";   
  }
  else if (elapsed < msPerMonth) {
    var days = Math.round(elapsed/msPerDay);
    return 'approximately ' + days + " day"+(days > 1 ? 's':'')+" ago";   
  }
  else if (elapsed < msPerYear) {
    var months = Math.round(elapsed/msPerMonth);
    return 'approximately ' + months + " month"+(months > 1 ? 's':'')+" ago";   
  }
  else {
    var years = Math.round(elapsed/msPerYear );
    return 'approximately ' + years + " year"+(years > 1 ? 's':'')+" ago";   
  }
}
