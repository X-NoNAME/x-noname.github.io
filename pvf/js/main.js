/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


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

function getFiles(folder) {
    $.ajax({
        url: 'https://cloud-api.yandex.net/v1/disk/resources',
        type: 'GET',
        contentType: 'application/json',
        dataType: "json",
        data: { path: folder, fields: 'total'},
        success: function (data) {
            console.log(data);
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
            getFiles(data.system_folders.photostream);
        },
        error: function (data) {
            console.log('ERROR', data);
        },
        beforeSend: setHeader
    });
}