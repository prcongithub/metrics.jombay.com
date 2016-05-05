var _ = require('underscore');

module.exports.localQuery = function(request,response,next){
  request.params = _.extend({}, request.query, request.body, request.params)
  if(!request.params['auth_token']){
    request.params['auth_token'] = "";
  }
  
  response.locals.request = request;
  response.locals.auth_token = request.params['auth_token'];
  next();
};

