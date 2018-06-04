/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function get_cookie ( cookie_name )
{
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}

function go(){
    $.getJSON("https://cloud-api.yandex.net/v1/disk/resources/last-uploaded&limit=10&media_type=image")
            .done(function(data){
                console.log(data);
    });
    
}