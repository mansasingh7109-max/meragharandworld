// =====================================================
// FIREBASE-CHAT.JS v1.0 - Real Chat + Friend Requests
// CONNECT: <script src="firebase-chat.js"></script>
// =====================================================
(function(){
"use strict";
function myUid(){
  try{ return localStorage.getItem("auth_uid") || null; }catch(e){ return null; }
}
function myName(){
  try{
    var p = JSON.parse(localStorage.getItem("customer_profile")||"{}");
    return p.profileName || p.name || "User";
  }catch(e){ return "User"; }
}
function getDb(){
  try{ return window._fbDb || (window.firebase ? firebase.database() : null); }catch(e){ return null; }
}

// ===== FRIEND REQUESTS =====
window.sendFriendRequest = function(toUid, toName){
  var db = getDb(), from = myUid();
  if(!db || !from){ alert("Pehle login karo!"); return; }
  var reqData = {
    fromUid: from, fromName: myName(),
    toUid: toUid, toName: toName || "",
    status: "pending", time: new Date().toLocaleString(),
    timestamp: Date.now()
  };
  db.ref("friend_requests/"+toUid+"/"+from).set(reqData);
  db.ref("friend_requests_sent/"+from+"/"+toUid).set(reqData);
  alert("✅ Friend request bhej di!");
};

window.acceptFriendRequest = function(fromUid){
  var db = getDb(), me = myUid();
  if(!db || !me) return;
  var t = Date.now();
  db.ref("friends/"+me+"/"+fromUid).set({uid: fromUid, since: t});
  db.ref("friends/"+fromUid+"/"+me).set({uid: me, since: t});
  db.ref("friend_requests/"+me+"/"+fromUid).remove();
  db.ref("friend_requests_sent/"+fromUid+"/"+me).remove();
  alert("✅ Dost ban gaye!");
  location.reload();
};

window.rejectFriendRequest = function(fromUid){
  var db = getDb(), me = myUid();
  if(!db || !me) return;
  db.ref("friend_requests/"+me+"/"+fromUid).remove();
  db.ref("friend_requests_sent/"+fromUid+"/"+me).remove();
  location.reload();
};

// ===== CHAT =====
function chatPath(userUid, friendUid){
  return "user_chats/"+userUid+"/"+friendUid+"/messages";
}

window.sendChatMessage = function(friendUid, text){
  var db = getDb(), me = myUid();
  if(!db || !me){ alert("Pehle login karo!"); return; }
  if(!text || !text.trim()) return;
  var msg = {
    text: text.trim(), sender: me,
    senderName: myName(),
    time: new Date().toLocaleString(),
    timestamp: Date.now()
  };
  db.ref(chatPath(me, friendUid)).push(msg);
  db.ref(chatPath(friendUid, me)).push(msg);
};

window.listenChatMessages = function(friendUid, onUpdate){
  var db = getDb(), me = myUid();
  if(!db || !me) return null;
  var ref = db.ref(chatPath(me, friendUid));
  var listener = ref.orderByChild("timestamp").on("value", function(snap){
    var msgs = [];
    snap.forEach(function(ch){
      var m = ch.val(); m._key = ch.key; msgs.push(m);
    });
    if(onUpdate) onUpdate(msgs);
  });
  return {ref: ref, listener: listener};
};

window.deleteMyMessage = function(friendUid, msgKey){
  var db = getDb(), me = myUid();
  if(!db || !me) return;
  if(!confirm("Sirf tumhare paas se delete hoga. Friend ke paas rahega. Pakka?")) return;
  db.ref(chatPath(me, friendUid)+"/"+msgKey).remove();
};

window.backupChatToGmail = function(friendUid, friendName){
  var db = getDb(), me = myUid();
  if(!db || !me){ alert("Pehle login karo!"); return; }
  db.ref(chatPath(me, friendUid)).orderByChild("timestamp").once("value", function(snap){
    var lines = [];
    lines.push("Chat Backup: " + myName() + " & " + (friendName||"Friend"));
    lines.push("Date: " + new Date().toLocaleString());
    lines.push("========================================");
    snap.forEach(function(ch){
      var m = ch.val();
      var who = (m.sender === me) ? "Me" : (m.senderName || "Friend");
      lines.push("["+(m.time||"")+"] "+who+": "+(m.text||""));
    });
    var body = encodeURIComponent(lines.join("\n"));
    var subject = encodeURIComponent("Chat Backup - " + (friendName||"Friend"));
    var gmail = "";
    try{ gmail = localStorage.getItem("auth_email") || ""; }catch(e){}
    var url = "https://mail.google.com/mail/?view=cm&fs=1&to="+encodeURIComponent(gmail)
      + "&su="+subject + "&body="+body;
    window.open(url, "_blank");
    alert("📧 Gmail khul gaya! Send dabao.");
  });
};

console.log("💬 firebase-chat.js loaded!");
})();