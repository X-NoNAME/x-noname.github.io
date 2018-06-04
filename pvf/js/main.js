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

function setHeader(xhr) {
        xhr.setRequestHeader('Authorization', 'OAuth '+get_cookie('yat'));
    }

function go(){
     $.ajax({
          url: 'https://cloud-api.yandex.net/v1/disk/resources/last-uploaded&limit=10&media_type=image',
          type: 'GET',
          dataType: 'application/json',
          success: function(data) { 
                console.log(data);
            },
          error: function(data) { console.log('ERROR', data); },
          beforeSend: setHeader
        });
    
}