/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function mmax(){
    
    window.document.body.webkitRequestFullscreen();
}


function get_cookie(cookie_name)
{
    var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');

    if (results)
        return (unescape(results[2]));
    else
        return null;
}

function setHeader(xhr) {
    xhr.setRequestHeader('Authorization', 'OAuth ' + get_cookie('yat'));
}

function go() {
    getFolders();
}

function showRandom(folder,total) {
    
    var pos = Math.floor(Math.random() * total+1); 
    
    $.ajax({
        url: 'https://cloud-api.yandex.net/v1/disk/resources',
        type: 'GET',
        contentType: 'application/json',
        dataType: "json",
        data: { path: folder, limit:1, offset:pos, fields:'_embedded.items.media_type,_embedded.items.file,_embedded.items.name' },
        success: function (data) {
            console.log('File',data);
            if(data._embedded.items[0]){
                var name = data._embedded.items[0].name;
                var path = data._embedded.items[0].file;
                var media_type = data._embedded.items[0].media_type;
                var content = $("#content");
                content.html('');
                if(media_type=="image"){
                    var img = $("<img/>",{src:path, title:name});
                    img.appendTo(content);
                }else if(media_type=="video"){
                    $("<video/>",{src:path, title:name, autoplay:"autoplay"}).appendTo(content);
                }
                setTimeout(showRandom, 30000, folder, total);
            }
            
        },
        error: function (data) {
            console.log('ERROR', data);
        },
        beforeSend: setHeader
    });
}

function getFiles(folder) {
    $.ajax({
        url: 'https://cloud-api.yandex.net/v1/disk/resources',
        type: 'GET',
        contentType: 'application/json',
        dataType: "json",
        data: { path: folder, fields: '_embedded.total'},
        success: function (data) {
            console.log(data);
            var total = data._embedded.total;
            mmax();
            showRandom(folder,total);
            
        },
        error: function (data) {
            console.log('ERROR', data);
        },
        beforeSend: setHeader
    });

}

function getFolders() {
    $.ajax({
        url: 'https://cloud-api.yandex.net/v1/disk/',
        type: 'GET',
        contentType: 'application/json',
        dataType: "json",
        data: {},
        success: function (data) {
            console.log(data.system_folders.photostream);
            if(data.system_folders.photostream){
                getFiles(data.system_folders.photostream);
            }else {
                console.log('Can\'t find data.system_folders.photostream');
            }
            
        },
        error: function (data) {
            console.log('ERROR', data);
        },
        beforeSend: setHeader
    });
}