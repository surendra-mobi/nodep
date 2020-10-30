var socket = io("/")

const video = document.createElement("video");
video.pause =true;
navigator.mediaDevices.getUserMedia({video:true, audio:true}).then(stream=>{
    peer.on('call',call=>{
        call.answer(stream);
    })
    addVideoStream(video, stream)
    socket.on('user-connected',(userId)=>{
        connectToNewUser(userId, stream)
    })
   
})

var peer = new Peer(undefined,{
    host:'/',
    port:'9000'
});

peer.on('open', function(id) {
    socket.emit("join-room",room_id,id);
    socket.on('user-disconnect', (userId)=>{
       if(peer[userId]) peer[userId].close();
    })
});

 
function connectToNewUser(userId, stream){
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on('stream', function(videoStream){
        addVideoStream(video, videoStream);       
    });
    peer[userId] = call;
    call.on('close',()=>{
        video.remove();
    })
}

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", ()=>{
        video.play();
    })
    document.getElementById("video-grid").append(video);
}