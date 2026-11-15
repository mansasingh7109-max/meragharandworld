// ============================================
// friend-request.js - Ek hi file, sab jagah kaam karegi
// Send / Accept / Cancel / Unfriend / Accepted / Sent
// Sab kuch Firebase me User ki ID me save hoga
// ============================================

// Agar _fbDb / myUid pehle se nahi hai to yahan se le lo
if(typeof myUid==="undefined") var myUid="";
try{ if(!myUid) myUid=localStorage.getItem("auth_uid")||""; }catch(e){}
if(typeof FRIEND_STATUS==="undefined") var FRIEND_STATUS={};

// ---------- 1. REQUEST BHEJNA - SEND ----------
function FR_send(uid){
  if(!_fbDb || !myUid){ alert("Pehle login karo!"); return; }
  getMyRealName(function(myName){
    getFriendRealName(uid, function(frName){
      var now=Date.now();
      // Firebase me User ki ID me save:
      // friend_requests/{usko}/{push} = kisne bheji
      _fbDb.ref("friend_requests/"+uid).push({fromUid:myUid,fromName:myName,toUid:uid,toName:frName,time:now,status:"pending"});
      // friend_requests_sent/{meri ID}/{uski ID} = maine bheji
      _fbDb.ref("friend_requests_sent/"+myUid+"/"+uid).set({time:now,toName:frName});
      // Notification usko + mujhe
      _fbDb.ref("notifications/"+uid).push({type:"friend_request",fromUid:myUid,fromName:myName,toUid:uid,time:now,read:false,text:myName+" ne tumhe Friend Request bheji hai - Accept karo"});
      _fbDb.ref("notifications/"+myUid).push({type:"friend_request_sent",toUid:uid,toName:frName,fromUid:myUid,fromName:myName,time:now,read:false,text:"Tumne "+frName+" ko Friend Request bheji hai"});
      // History - dono ki ID me
      _fbDb.ref("friend_request_history/"+myUid+"/"+uid).set({type:"sent",toName:frName,time:now});
      _fbDb.ref("friend_request_history/"+uid+"/"+myUid).set({type:"incoming",fromName:myName,time:now});
      FRIEND_STATUS[uid]="sent";
      alert("✅ Request bhej di - "+frName+" ko Notification mil jayega");
      if(typeof renderAll==="function") renderAll("");
      if(typeof loadNotifications==="function") loadNotifications();
    });
  });
}

// ---------- 2. REQUEST ACCEPT KARNA ----------
function FR_accept(uid){
  if(!_fbDb || !myUid) return;
  getMyRealName(function(myName){
    getFriendRealName(uid, function(frName){
      var now=Date.now();
      // Dono taraf Friends me save - Accepted
      _fbDb.ref("friends/"+myUid+"/"+uid).set({time:now});
      _fbDb.ref("friends/"+uid+"/"+myUid).set({time:now});
      // Purani Request hatao
      _fbDb.ref("friend_requests_sent/"+uid+"/"+myUid).remove();
      _fbDb.ref("friend_requests/"+myUid).once("value").then(function(s){
        s.forEach(function(ch){ var v=ch.val(); if(v && v.fromUid===uid) ch.ref.remove(); });
      });
      _fbDb.ref("notifications/"+uid).push({type:"friend_accepted",fromUid:myUid,fromName:myName,toUid:uid,time:now,read:false,text:myName+" ne tumhari Request Accept kar li ✅"});
      _fbDb.ref("notifications/"+myUid).push({type:"friend_accepted_by_me",toUid:uid,toName:frName,fromUid:myUid,fromName:myName,time:now,read:false,text:"Tumne "+frName+" ki Request Accept ki ✅"});
      _fbDb.ref("friend_request_history/"+myUid+"/"+uid).set({type:"accepted_by_me",toName:frName,time:now});
      FRIEND_STATUS[uid]="accepted";
      alert("✅ Accepted - Ab tum dost ho");
      if(typeof renderAll==="function") renderAll("");
      if(typeof loadNotifications==="function") loadNotifications();
    });
  });
}

// ---------- 3. REQUEST WAPAS LENA - CANCEL / SENT ----------
function FR_cancel(uid, name){
  if(!_fbDb || !myUid) return;
  if(!confirm((name||"Friend")+" ko bheji Request wapas lein?")) return;
  getMyRealName(function(myName){
    _fbDb.ref("friend_requests_sent/"+myUid+"/"+uid).remove();
    _fbDb.ref("friend_requests/"+uid).once("value").then(function(s){
      s.forEach(function(ch){ var v=ch.val(); if(v && v.fromUid===myUid) ch.ref.remove(); });
    });
    _fbDb.ref("notifications/"+uid).push({type:"friend_request_cancelled",fromUid:myUid,fromName:myName,toUid:uid,time:Date.now(),read:false,text:myName+" ne Request wapas le li"});
    _fbDb.ref("friend_request_history/"+myUid+"/"+uid).set({type:"cancelled",time:Date.now()});
    FRIEND_STATUS[uid]="";
    alert("✅ Request wapas le li");
    if(typeof renderAll==="function") renderAll("");
  });
}

// ---------- 4. UNFRIEND ----------
function FR_unfriend(uid, name){
  if(!confirm((name||"Friend")+" ko Unfriend karein?")) return;
  getMyRealName(function(myName){
    if(_fbDb && myUid){
      _fbDb.ref("friends/"+myUid+"/"+uid).remove();
      _fbDb.ref("friends/"+uid+"/"+myUid).remove();
      _fbDb.ref("notifications/"+uid).push({type:"unfriend",fromUid:myUid,fromName:myName,toUid:uid,time:Date.now(),read:false,text:myName+" ne tumhe Unfriend kar diya"});
      _fbDb.ref("friend_request_history/"+myUid+"/"+uid).set({type:"unfriended",time:Date.now()});
    }
    FRIEND_STATUS[uid]="";
    alert("✅ Unfriend ho gaya");
    if(typeof renderAll==="function") renderAll("");
  });
}

// ---------- 5. STATUS LOAD KARNA - Accepted / Sent / Incoming ----------
// Ye batayega kaun Accepted hai, kaun Sent hai, kaun New hai
function FR_loadStatus(cb){
  if(!_fbDb || !myUid){ if(cb) cb(); return; }
  Promise.all([
    _fbDb.ref("friends/"+myUid).once("value"),
    _fbDb.ref("friend_requests_sent/"+myUid).once("value"),
    _fbDb.ref("friend_requests/"+myUid).once("value")
  ]).then(function(res){
    FRIEND_STATUS={};
    res[0].forEach(function(ch){ FRIEND_STATUS[ch.key]="accepted"; });
    res[1].forEach(function(ch){ if(!FRIEND_STATUS[ch.key]) FRIEND_STATUS[ch.key]="sent"; });
    res[2].forEach(function(ch){ var v=ch.val(); if(v && v.fromUid && !FRIEND_STATUS[v.fromUid]) FRIEND_STATUS[v.fromUid]="incoming"; });
    if(cb) cb();
  }).catch(function(){ if(cb) cb(); });
}

// ---------- BRIDGE - Purane naam bhi isi file se chalenge ----------
// Matlab purani file me sendRequest / acceptReq likha hai to bhi yehi chalega, dobara code nahi likhna
function sendRequest(uid){ return FR_send(uid); }
function acceptReq(uid){ return FR_accept(uid); }
function cancelRequest(uid, name){ return FR_cancel(uid, name); }
function unfriend(uid, name){ return FR_unfriend(uid, name); }
function loadStatuses(){ return FR_loadStatus(function(){ if(typeof renderAll==="function") renderAll(""); }); }