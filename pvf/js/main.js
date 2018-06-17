/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var isPaused = false;
var folder;
var total;
var timerId;

var imgstyle='contain';

function performClick(){
    if(!document.webkitIsFullScreen){
        window.document.body.webkitRequestFullscreen();
    }else {
        window.document.webkitCancelFullScreen();
    }
}

function maximize() {
    if(imgstyle==="contain"){
        imgstyle="cover"
        $("#imgstyle").html('<img src="img/horizontal.png" alt="Horizontal crop"/>');
    }else {
        imgstyle="contain"
        $("#imgstyle").html('<img src="img/vertical.png" alt="Vertical crop"/>');
    }
    $("div.img").css("background-size",imgstyle);
}

function hideMenu(){
    $("#menu").hide();
}

function showMenu(){
    $("#menu").show();
}

function showMenuContent(){
    $("#menuitems").toggle();
}

function hideMenuContent(){
    $("#menuitems").hide();
}

function del(){
    var currentPath = $('#content').data('path');
    q('DELETE','/disk/resources',{path: currentPath})
        .done(play);
}

function playPause(){
    if(isPaused){
        play();
    }else {
        stop();
    }
}

function play(){
    $("#plpa").html('<img src="img/play.png" alt="Stop"/>');
    isPaused = false;
    clearTimeout(timerId);
    timerId = setTimeout(showRandom, 10);
}

function stop(){
    $("#plpa").html('<img src="img/pause.png" alt="Play"/>');
    isPaused = true;
    clearTimeout(timerId);
}

function go() {
    getFolders();
}

var usedPos=[];
function showRandom() {
    
    var pos = Math.floor(Math.random() * total+1); 
    var attempt = 0;
    while(usedPos.indexOf(pos)>=0 && attempt++ < 100){
        pos = Math.floor(Math.random() * total+1); 
        console.log(total,pos);
    }
    usedPos.push(pos);
    q('GET','/disk/resources',{ path: folder, limit:1, offset:pos, fields:'_embedded.items.exif,_embedded.items.preview,_embedded.items.size,_embedded.items.media_type,_embedded.items.file,_embedded.items.name,_embedded.items.path' })
        .done(function (data) {
            console.log('File',data);
            if(data._embedded.items[0]){
                var name = data._embedded.items[0].name;
                var file = data._embedded.items[0].file;
                var path = data._embedded.items[0].path;
                var size = data._embedded.items[0].size;
                var date_time = data._embedded.items[0].exif.date_time;
                var preview = data._embedded.items[0].preview;
                var media_type = data._embedded.items[0].media_type;
                var content = $("#content");

                content.data('path',path);
                content.data('preview',preview);
                console.log('EXIF:',date_time);
                if(date_time){
                    var d = new Date(date_time);
                    date_time=d.toLocaleDateString();
                }
                if(media_type==="video" || media_type==="image" ){
                    showPhotoOrVideo({name:name, path:path, file:file, media_type:media_type, size:size, preview:preview, date_time:date_time},content);
                    if(!isPaused){
                        timerId = setTimeout(showRandom, 30000);
                    }
                }else {
                    showRandom();
                }
            }
        });

}

function getFiles() {
    q('GET','/disk/resources',{ path: folder, fields: '_embedded.total'})
        .done(function (data) {
            console.log(data);
            var t = data._embedded.total;
            total = t;
            showRandom();
        });
}

function getFolders() {
    q('GET','/disk/',{})
        .done(function (data) {
            console.log(data.system_folders.photostream);
            if(data.system_folders.photostream){
                folder = data.system_folders.photostream;
                getFiles();
            }else {
                console.log('Can\'t find data.system_folders.photostream');
            }
        });
}

function updateContainer(content,newNode) {
    content.fadeOut(1000,function (){
        content.html('');
        newNode.appendTo(content);
        content.fadeIn(2000);
    });
}


function showPhotoOrVideo(mediaObject,content){
    
    if(mediaObject.media_type==="image" && mediaObject.size>2*1024*1024){
        console.log(2);
        var xhr = new XMLHttpRequest();
        xhr.open('GET', mediaObject.file, true);
        console.log(3);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
          if (this.status == 206 || this.status == 200) {
            var byteArray = new Uint8Array(this.response);
            console.log("start search index");
            var index = findIndex(byteArray);
            console.log(index);
            if(index>=0){
                var videoArray = byteArray.slice(index);
                //var photoArray = byteArray.slice(0,index);
                var blobVideo = new Blob([videoArray], {type: 'video/h264'});
                //var blobPhoto = new Blob([photoArray], {type: 'image/jpg'});
                var video = $("<video/>",{title:mediaObject.name}); //loop:true
                video.trigger('load',function(e) {
                  window.URL.revokeObjectURL(video[0].src); // Clean up after yourself.
                });
                video[0].src = window.URL.createObjectURL(blobVideo);

                if(mediaObject.date_time){
                    var meta = $("<div/>",{class:'date', text:mediaObject.date_time});
                    meta.appendTo(video);
                }
                updateContainer(content,video);


                video[0].loop=true;
                video[0].defaultPlaybackRate=0.4;
                video[0].playbackRate=0.4;
                video[0].play();

            }else {
                var img = $("<div/>",{class:'img',title:mediaObject.name, style:'background-size:'+imgstyle+';background-image:url('+mediaObject.file+')'});
                if(mediaObject.date_time){
                    var meta = $("<div/>",{class:'date', text:mediaObject.date_time});
                    meta.appendTo(img);
                }
                updateContainer(content,img);


            }
          }else {
              console.log(this.status, this);
          }
        };
        xhr.send();
    }else if(mediaObject.media_type==="image"){
        console.log(4);
        var img = $("<div/>",{class:'img',title:mediaObject.name, style:'background-size:'+imgstyle+';background-image:url('+mediaObject.file+')'});
        if(mediaObject.date_time){
            var meta = $("<div/>",{class:'date', text:mediaObject.date_time});
            meta.appendTo(img);
        }
        updateContainer(content,img);


    }else {
        var vid = $("<video/>",{src:mediaObject.file, title:mediaObject.name, autoplay:"autoplay"});
        if(mediaObject.date_time){
            var meta = $("<div/>",{class:'date', text:mediaObject.date_time});
            meta.appendTo(vid);
        }
        updateContainer(content,vid);


    }
}

function findIndex(arr){
    var search = [116, 111, 95, 68, 97, 116, 97];
    var index = 0;
    top:
    while (index<arr.length){
	var prevGood = arr.indexOf(97,index);
	if(prevGood<0) return -1;
	for(var i =1;i<=5;i++){
	    if(arr[prevGood-i]!=search[6-i]) {
		index = prevGood+1;
		continue top;
	    }
	}
	console.log(prevGood+1);
	return prevGood+1;
    }
    return -1;
}

