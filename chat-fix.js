// ===== chat-fix.js - friends.html ke liye alag file =====
// Kaam: index.html se bheja + friends.html se bheja - dono format padhega
// Chat Box ko hilayega nahi - sirf 3 function badalta hai, koi HTML/CSS nahi chhedta
// friends.html me sirf ye 1 line add karni hai, </body> ke just upar:
// <script src="chat-fix.js"></script>
(function(){
  "use strict";

  // Helper - dono format ka time/naam nikaalo
  function pickTs(v){
    return (v && (v.ts || v.timestamp)) || 0;
  }
  function pickFrom(v){
    return (v && (v.from || v.fromUid)) || "";
  }
  function pickMyUid(){
    try{ return (typeof myUid !== "undefined" && myUid) || localStorage.getItem("auth_uid") || ""; }catch(e){ return ""; }
  }
  function pickDb(){
    try{ return (typeof _fbDb !== "undefined" && _fbDb) || (window.firebase && window.firebase.database && window.firebase.database()) || null; }catch(e){ return null; }
  }
  function pickMyName(){
    try{ return localStorage.getItem("customer_name") || localStorage.getItem("customer_username") || "Me"; }catch(e){ return "Me"; }
  }

  // ===== 1. INBOX wala send - friends.html ke Inbox Me Bhejo ke liye =====
  window.sendChatMessage = function(fid, txt){
    if(!txt || !String(txt).trim()) return;
    var ts = Date.now();
    var id = "m_" + ts + "_" + Math.floor(Math.random()*1000);
    var uid = pickMyUid();
    var msg = {
      id: id, me: true, type: "text",
      text: txt, msg: txt,
      time: new Date(ts).toLocaleString(),
      ts: ts, timestamp: ts,
      from: uid, fromUid: uid, fromName: pickMyName(),
      to: fid, toUid: fid, toName: ""
    };
    var db = pickDb();
    if(db && uid && fid){
      try{
        db.ref("chats/" + uid + "/" + fid + "/" + id).set(msg);
        db.ref("chats/" + fid + "/" + uid + "/" + id).set(msg);
      }catch(e){}
    }
    try{
      var chats = getChats();
      if(!chats[fid]) chats[fid] = [];
      chats[fid].push({me:true, text:txt, time:msg.time, ts:ts});
      saveChats(chats);
    }catch(e){}
  };

  // ===== 2. CHAT BOX wala send - friends.html ke andar wale chat ke liye =====
  window.sendChatMsg = function(){
    var inp = document.getElementById('chatText');
    if(!inp) return;
    var txt = inp.value.trim();
    if(!txt) return;
    var ts = Date.now();
    var id = "m_" + ts + "_" + Math.floor(Math.random()*1000);
    var uid = pickMyUid();
    var fid = (typeof chatWithUid !== "undefined") ? chatWithUid : "";
    var fname = (typeof chatWithName !== "undefined") ? chatWithName : "";
    var msg = {
      id: id, me: true, type: "text",
      text: txt, msg: txt,
      time: new Date(ts).toLocaleString(),
      ts: ts, timestamp: ts,
      from: uid, fromUid: uid, fromName: pickMyName(),
      to: fid, toUid: fid, toName: fname
    };
    var db = pickDb();
    if(db && uid && fid){
      try{
        db.ref("chats/" + uid + "/" + fid + "/" + id).set(msg);
        db.ref("chats/" + fid + "/" + uid + "/" + id).set(msg);
      }catch(e){}
    }
    try{
      var chats = getChats();
      if(!chats[fid]) chats[fid] = [];
      chats[fid].push({me:true, text:txt, time:msg.time, ts:ts});
      chats[fname] = chats[fid];
      saveChats(chats);
    }catch(e){}
    inp.value = "";
    if(typeof loadChatMsgs === "function") loadChatMsgs();
  };

  // ===== 3. CHAT LOAD - index + friends, purana + naya, sab dikhega =====
  window.loadChatMsgs = function(){
    var box = document.getElementById('chatMsgs');
    if(!box) return;
    var uid = pickMyUid();
    var fid = (typeof chatWithUid !== "undefined") ? chatWithUid : "";
    var fname = (typeof chatWithName !== "undefined") ? chatWithName : "";
    var localChats = {};
    try{ localChats = getChats() || {}; }catch(e){}
    var localMsgs = localChats[fid] || localChats[fname] || [];
    if(localMsgs.length === 0){
      box.innerHTML = '<div class="empty">⏳ Chat load ho raha hai...<br>Local:0 Firebase check...</div>';
    } else if(typeof renderChat === "function"){
      renderChat(localMsgs);
    }
    var db = pickDb();
    if(!db || !uid || !fid){
      if(localMsgs.length === 0 && typeof renderChat === "function") renderChat([]);
      return;
    }
    db.ref("chats/" + uid + "/" + fid).once("value").then(function(snap){
      var fbMsgs = [];
      snap.forEach(function(ch){
        var v = ch.val() || {};
        var f = pickFrom(v);
        var isMe = f ? (f === uid) : true;
        fbMsgs.push({me:isMe, text:v.msg || v.text || "", time:v.time || "", ts:pickTs(v), fromFb:true, from:f});
      });
      return db.ref("chats/" + fid + "/" + uid).once("value").then(function(snap2){
        snap2.forEach(function(ch){
          var v = ch.val() || {};
          var f = pickFrom(v);
          var isMe2 = f ? (f === uid) : false;
          fbMsgs.push({me:isMe2, text:v.msg || v.text || "", time:v.time || "", ts:pickTs(v), fromFb:true, from:f});
        });
        var map = {};
        fbMsgs.forEach(function(m){
          var k = (m.text || "") + "|" + (m.ts || "") + "|" + (m.time || "");
          if(!map[k] || m.me) map[k] = m;
        });
        localMsgs.forEach(function(m){
          var k = (m.text || "") + "|" + (m.ts || "") + "|" + (m.time || "");
          if(!map[k]) map[k] = m;
        });
        var all = Object.keys(map).map(function(k){ return map[k]; });
        all.sort(function(a,b){ return (a.ts||0)-(b.ts||0); });
        if(typeof renderChat === "function") renderChat(all);
      });
    }).catch(function(err){
      try{ console.log(err); }catch(e){}
      if(typeof renderChat === "function") renderChat(localMsgs);
    });
  };

  // ===== 4. UPDATE - CLEAR FIX - Bahar wala Clear, Popup wala Clear alag-alag =====
  // Bahar wala Clear sirf bahar wali list saaf karega, popup wale ko rokega nahi
  function clearAllChecks(){
    var n = 0;
    document.querySelectorAll(".pfFrChk:checked, .inboxFrChk:checked, #pfFriendList input[type=checkbox]:checked, #inboxFriendList input[type=checkbox]:checked").forEach(function(c){
      c.checked = false; n++;
    });
    var s = document.getElementById("inboxSentMsg");
    if(s) s.textContent = "";
    return n;
  }
  document.addEventListener("click", function(e){
    var b = e.target && e.target.closest ? e.target.closest("button") : null;
    if(!b) return;
    // Popup ke andar wala Clear / All - usko mat roko, wo popup wala sambhalega
    if(b.closest && b.closest("#frPopup")) return;
    var id = b.id || "";
    var t = (b.textContent || "").trim();
    var isClear = (id === "clearAllFr" || id === "clearBtn" || id === "pfClear" || id === "pfClearBtn" || t.indexOf("Clear") !== -1);
    if(!isClear) return;
    e.preventDefault();
    e.stopPropagation();
    clearAllChecks();
    var old = b.textContent;
    b.textContent = "✅ Clear ho gaya";
    setTimeout(function(){ b.textContent = old; }, 1200);
  }, true);
})();