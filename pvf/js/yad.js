/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
//$(function() {
    function setHeader(xhr) {
        xhr.setRequestHeader('Authorization', 'OAuth ' + get_cookie('yat'));
    }

    function get_cookie(cookie_name)
    {
        var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
        if (results)
            return (unescape(results[2]));
        else
            return null;
    }
    
    function q(type="GET", path="", data={}){
        return $.ajax({
            url: 'https://cloud-api.yandex.net/v1/disk'+path,
            type: type,
            
            contentType: 'application/json',
            dataType: "json",
            data: data,
            beforeSend: setHeader
        });
    }
    
    function getAllFolders(path="disk:/",callback){
        var folders = [];
        q("GET",'/resources',{path:path,limit:100, fields:'_embedded.items.name,_embedded.items.path,_embedded.items.type'})
                .done(function (data) {
                    data._embedded.items.forEach(function (item) {
                        if(item.type==="dir"){
                            folders.push({name:item.name,path:item.path});
                        }
                    });
                    callback(folders);
        });
    }
    
    var num = 1;
    function showFolders(pnum=0,path="disk:/"){
        console.log(pnum,path);
        getAllFolders(path,function(folders){
           folders.forEach(function (folder){
               var tr = null;
               if(pnum==0){
                    tr = $("<tr/>",{class:'treegrid-'+num, 'data-num':num});
                }else {
                    tr = $("<tr/>",{class:'treegrid-'+num+' treegrid-parent-'+pnum, 'data-num':num, 'data-pnum':pnum});
                }
               $("<td/>",{text:folder.name, data:folder.path}).appendTo(tr);
               if(pnum===0){
                    tr.appendTo($("#filetree"));
                }else {
                    tr.insertAfter($('tr.treegrid-'+pnum));
                }
               
               num++;
           });
        });
        $('#filetree').treegrid({
            click: function() {
                alert("Expanded "+$(this).attr("class"));
                //function(){showFolders($(this).parent().data('num'),folder.path);}
            }
        });
    }
    
    
    
//});
