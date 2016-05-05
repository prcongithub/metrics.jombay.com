var Resource = require("node-vger").Resource;
var User = Resource.User;
var logger = require('./logger');

module.exports.authenticateUser = function(request, response, next) {
  request.scope = 'user';
  logger.debug("%%%%%%%%%%%%%%%% Authorize : Fetching User %%%%%%%%%%%%%%%%%%");
  request.params.auth_token = request.params.auth_token || request.signedCookies.auth_token;
  if(request.params.auth_token){
    User.currentUser(request, { methods: ['role_names'] }, function(user,error){
      if(!error){
        user.auth_token = response.locals.auth_token;
        response.locals.currentUser = user;
        logger.debug("################## Found User "+ user.email +" #####################");
        next();
      }else{
        response.redirect("/login");
      }
    });
  } else {
    response.redirect("/login");
  }  
};
