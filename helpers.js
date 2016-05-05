var functions = require('./functions');

exports.define_helpers = function(params) {
  locals = params.app.locals;
  locals.root_path = functions.root_path
  locals.truncate = functions.truncate
  locals.format_date_time = functions.format_date_time
  locals.format_date = functions.format_date
  locals.isIdpCandidate = functions.isIdpCandidate
  locals.timeSince = functions.timeSince
}
