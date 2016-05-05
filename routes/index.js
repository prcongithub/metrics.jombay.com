var Resource = require("node-vger").Resource;
var User = Resource.User;
var UserAssessmentReport = Resource.Suitability.UserAssessmentReport;
var _ = require('underscore');
var logger = require(__dirname+"/../logger");

var express = require('express');
var router = express.Router({mergeParams: true});

var localQuery = require("../localquery").localQuery;
var authenticateUser = require("../authenticate").authenticateUser;

var fs = require("fs")

var host = (JSON.parse(fs.readFileSync(__dirname + "/../config/hosts.json", "utf8")))[(process.env.NODE_ENV || 'development')];

router.get('/', localQuery, authenticateUser, function(request, response){
  if(response.locals.currentUser){
    getCount(request, response, function(count, error){
      if(error) { 
        response.render("index/home",{
          count: "error"
        });
      } else{
        response.render("index/home",{
          count: count.count
        });
      }
    });
  } else {
    signIn(request, response);
  }
});

router.get('/count', localQuery, authenticateUser, function(request, response){
  if(response.locals.currentUser){
    getCount(request, response, function(count, error){
      if(error){
        response.send({
          count: count.count,
          error: error
        });
      } else {
        response.send({
          count: count.count,
          error: null
        });
      }
    });
  } else {
    signIn(request, response);
  }
});

router.post('/login', localQuery, function(request, response){
  signIn(request, response);
});

router.get('/login', localQuery, function(request, response){
  if(response.locals.currentUser){
    response.render("index/home");
  } else {
    response.render("index/login");
  }
});

function getCount(request, response, callback){
  UserAssessmentReport.count(request, {
    joins: ['user_assessment'],
    query_options: {
      "suitability_user_assessments.trial": false
    }
  }, function(count, error){
    callback(count, error);
  });
}

function signIn(request, response) {
  User.signIn(request,{
    methods: ["role_names"]
  }, {
    user: {
      email: request.params.email,
      password: request.params.password,
      remember_password: 0
    }
  },function(user, error){
    if(error){
      request.flash('error',"Invalid username or password.");
      response.render("index/login");
    }else{
      response.cookie('auth_token', user.authentication_token, { signed: true, maxAge: 90000000, httpOnly: true });      
      response.redirect("/");
    }
  });
}

module.exports = router;

