/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var isPaused = false;
var folder;
var total;
var timerId;

function performClick(){
    if(!document.webkitIsFullScreen){
        window.document.body.webkitRequestFullscreen();
        hideMenu();
    }else {
        window.document.webkitCancelFullScreen();
        showMenu();
    }
    
}

function hideMenu(){
    $("#menu").hide();
}

function showMenu(){
    $("#menu").show();
}

var cerrentPath;
function showMenuContent(){
    $("#menuitems").show();
    cerrentPath = $('#content').data('path');
}

function hideMenuContent(){
    $("#menuitems").hide();
}

function del(){
    if (!isPaused)playPause();
    if(cerrentPath && confirm("Вы точно хотите переместить файл "+cerrentPath+"  в корзину?")){
        $.ajax({
            url: 'https://cloud-api.yandex.net/v1/disk/resources?path='+encodeURIComponent(cerrentPath),
            type: 'DELETE',
            contentType: 'application/json',
            dataType: "json",
            success: function (data) {
                hideMenuContent();
            },
            error: function(jqXHR, textStatus) {
                if(jqXHR.status==403){
                    window.location = '/pvf/autorize.html'; // redirect page
                }else {
                    alert("Unknown error: "+textStatus);
                }
            },
            always: function (){
                if (isPaused)playPause();
            },
            beforeSend: setHeader
        });
        
    }
    hideMenuContent();
}

function playPause(){
    if(isPaused){
        isPaused=!isPaused;
        timerId = setTimeout(showRandom, 1000, folder, total);
    }else {
        isPaused=!isPaused;
        clearTimeout(timerId);
    }
    hideMenuContent();    
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

function showRandom() {
    
    var pos = Math.floor(Math.random() * total+1); 
    
    $.ajax({
        url: 'https://cloud-api.yandex.net/v1/disk/resources',
        type: 'GET',
        contentType: 'application/json',
        dataType: "json",
        data: { path: folder, limit:1, offset:pos, fields:'_embedded.items.media_type,_embedded.items.file,_embedded.items.name,_embedded.items.path' },
        success: function (data) {
            console.log('File',data);
            if(data._embedded.items[0]){
                var name = data._embedded.items[0].name;
                var file = data._embedded.items[0].file;
                var path = data._embedded.items[0].path;
                var media_type = data._embedded.items[0].media_type;
                var content = $("#content");
                content.html('');
                content.data('path',path);
                if(media_type=="image"){
                    var img = $("<div/>",{class:'img',title:name, style:'background-image:url('+file+')'});
                    img.appendTo(content);
                }else if(media_type=="video"){
                    $("<video/>",{src:file, title:name, autoplay:"autoplay"}).appendTo(content);
                }
                if(!isPaused){
                    timerId = setTimeout(showRandom, 30000, folder, total);
                }                
            }
            
        },
        error: function(jqXHR, textStatus) {
                if(jqXHR.status==403){
                    window.location = '/pvf/autorize.html'; // redirect page
                }else {
                    alert("Unknown error: "+textStatus);
                }
        },
        beforeSend: setHeader
    });
}

function getFiles() {
    $.ajax({
        url: 'https://cloud-api.yandex.net/v1/disk/resources',
        type: 'GET',
        contentType: 'application/json',
        dataType: "json",
        data: { path: folder, fields: '_embedded.total'},
        success: function (data) {
            console.log(data);
            var t = data._embedded.total;
            total = t;
            showRandom();
            
        },
        error: function (jqXHR, textStatus) {
            if(jqXHR.status==403){
                    window.location = '/pvf/autorize.html'; // redirect page
                }else {
                    alert("Unknown error: "+textStatus);
                }
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
                folder = data.system_folders.photostream;
                getFiles();
            }else {
                console.log('Can\'t find data.system_folders.photostream');
            }
            
        },
        error: function (jqXHR, textStatus) {
            if(jqXHR.status==403){
                    window.location = '/pvf/autorize.html'; // redirect page
                }else {
                    alert("Unknown error: "+textStatus);
                }
        },
        beforeSend: setHeader
    });
}