const socket = io();
const peer = new RTCPeerConnection();
var dc;
var initer;
var room;
function SendRoom() {
  room = document.getElementById("room").value;
  socket.emit("room", room);
  document.getElementById("connectbutton").disabled = true;
}
function SendLocalDescription() {
  sdp = peer.localDescription;
  socket.emit("sdp", { sdp, room });
}
socket.on("initiator", (initiator) => {
  peer.onicecandidate = (e) => {
    SendLocalDescription();
  };
  if (initiator[0] === true) {
    initer = true;
    dc = peer.createDataChannel("channel");
    dc.onopen = (e) => console.log("connection opend");
    rsdata();
    peer.createOffer().then((offer) => peer.setLocalDescription(offer));
    socket.on("answer", (answer) => {
      peer.setRemoteDescription(answer);
    });
  } else if (initiator[0] === false) {
    initer = false;
    peer.ondatachannel = (e) => {
      console.log("connection opened");
      dc = e.channel;
      rsdata();
    };
    offer = initiator[1];
    peer.setRemoteDescription(offer);
    peer.createAnswer().then((answer) => peer.setLocalDescription(answer));
  }
});
