<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <meta charset="UTF-8">
        <title></title>
        <script type="text/javascript" src="https://www.google.com/jsapi"></script>
        <script type="text/javascript">
          
          var options = {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            };

            function success(pos) {
              var crd = pos.coords;
              
              var a = 'Your current position is:\n';
              a += `Latitude : ${crd.latitude}`;
              a += `Longitude: ${crd.longitude}`;
              a += `More or less ${crd.accuracy} meters.`;
              document.getElementsByTagName('body')[0].innerText=a;
            }


            function error(err) {
              
              document.getElementsByTagName('body')[0].innerText=`ERROR(${err.code}): ${err.message}`;
            }

            navigator.geolocation.getCurrentPosition(success, error, options);

        </script>
        
    </head>
    <body>
        <?php
        // put your code here
        ?>
    </body>
</html>
