//= require jquery.js
//= require jquery-ui/jquery-ui.js
//= require jquery_ujs.min.js

$(document).on('ready', function(){
  var audioElement = document.getElementById('audio');
  $("#count-form").on("ajax:success", function(event, data, status){
    if(data.count) {
      if(parseInt($("#count").html()) != data.count) {
        $("#count").html(data.count);
        $("#count").effect( "bounce", { times: 3 }, "slow" );
        audioElement.play();
      }
    } else {
      alert(data.error.message);
    }
  });
  var interval = setInterval(function(){
    $("#count-form").submit();
  },5000);
});

