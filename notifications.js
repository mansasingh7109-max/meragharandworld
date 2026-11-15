// notifications.js - ONLY ye popup + Highlight + List + Bell
// Meragharandworld Notification
// Allow kare? [ Allow ] [ Block ]
// Connect: <script src="notifications.js"></script> - bas 1 line, </body> se pehle
(function(){
  function showAllowPopup(){
    try{
      if(localStorage.getItem("myNotifyAllow")==="yes" || localStorage.getItem("myNotifyAllow")==="no") return;
      if(document.getElementById("myAllowPopup")) return;
      var p = document.createElement("div");
      p.id = "myAllowPopup";
      p.style.cssText = "position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);background:#fff;border-radius:16px;box-shadow:0 4px 20px rgba(0,0,0,.3);padding:20px;width:300px;z-index:10000;text-align:center;";
      p.innerHTML = '<div style="font-size:15px;color:#333;margin-bottom:6px;">Meragharandworld Notification</div><div style="font-size:15px;color:#333;font-weight:bold;margin-bottom:16px;">Allow kare?</div><button id="myAllowYes" style="display:block;width:100%;background:#4a90e2;color:#fff;border:none;padding:12px;border-radius:10px;font-size:15px;margin-bottom:10px;">Allow</button><button id="myAllowNo" style="display:block;width:100%;background:#4a90e2;color:#fff;border:none;padding:12px;border-radius:10px;font-size:15px;">Block</button>';
      document.body.appendChild(p);
      document.getElementById("myAllowYes").onclick = function(){ localStorage.setItem("myNotifyAllow","yes"); p.remove(); };
      document.getElementById("myAllowNo").onclick = function(){ localStorage.setItem("myNotifyAllow","no"); p.remove(); };
    }catch(e){}
  }
  function highlightBox(text, uid){
    try{
      var old = document.getElementById("myHighlightBox");
      if(old) old.remove();
      var h = document.createElement("div");
      h.id = "myHighlightBox";
      h.style.cssText = "position:fixed;top:0;left:0;right:0;background:#ff5722;color:#fff;padding:14px;text-align:center;font-weight:bold;font-size:15px;z-index:9999;cursor:pointer;box-shadow:0 0 0 3px #fff, 0 0 18px #ff5722;animation:blinkHL 1s infinite;";
      h.textContent = text;
      h.onclick = function(){ this.remove(); if(uid) location.href = "chat-box.html?uid=" + uid; };
      var st = document.createElement("style");
      st.textContent = "@keyframes blinkHL{0%{background:#ff5722}50%{background:#e65100}100%{background:#ff5722}}";
      document.head.appendChild(st);
      document.body.appendChild(h);
      try{ var a = new Audio("https://www.soundjay.com/buttons/sounds/button-09a.mp3"); a.play(); }catch(e){}
      setTimeout(function(){ if(h) h.remove(); }, 8000);
    }catch(e){}
  }
  var _lastMsg = 0, _lastReq = 0;
  function showFriendNotify(name, text, uid){
    try{
      if(localStorage.getItem("myNotifyAllow")!=="yes") return;
      if(uid) window._lastFromUid = uid;
      document.title = "(1) " + (name||"Friend") + " ka message";
      highlightBox("🔔 New Message - " + (name||"Friend") + " ne message bheja: " + (text||"").slice(0,40), uid);
    }catch(e){}
  }
  function showReqNotify(name, uid){
    try{
      if(localStorage.getItem("myNotifyAllow")!=="yes") return;
      document.title = "(1) New Friend Request";
      highlightBox("🔔 New Friend Request - " + (name||"Friend") + " ne Friend Request bheji hai", uid);
    }catch(e){}
  }
  window.showFriendNotify = showFriendNotify;
  window.notifyFriendMessage = showFriendNotify;
  window.showReqNotify = showReqNotify;

  /* ============ UPDATE START - Bell + Sab Notification ek jagah ============ */
  function getNotifs(){ try{ return JSON.parse(localStorage.getItem("fr_notifs")||"[]"); }catch(e){ return []; } }
  function saveNotifs(n){ try{ localStorage.setItem("fr_notifs", JSON.stringify(n)); }catch(e){} }
  // UPDATE: friends.html ke sendRequest / acceptReq / sendChatMsg se ye hi call hoga
  function addNotif(type, name, text, uid){
    var n = getNotifs();
    n.unshift({type:type||"message", name:name||"Friend", text:text||"", uid:uid||"", time:new Date().toLocaleString(), ts:Date.now(), read:false});
    saveNotifs(n.slice(0,30));
    renderBell();
  }
  window.addNotif = addNotif;

  function getMyUid2(){
    try{
      if(typeof myUid!=="undefined" && myUid) return myUid;
      if(typeof window.myUid!=="undefined" && window.myUid) return window.myUid;
    }catch(e){}
    try{ return localStorage.getItem("auth_uid")||localStorage.getItem("customer_uid")||localStorage.getItem("myUid")||localStorage.getItem("uid")||""; }catch(e){ return ""; }
  }
  function getDb(){
    try{
      if(typeof _fbDb!=="undefined" && _fbDb) return _fbDb;
      if(typeof window._fbDb!=="undefined" && window._fbDb) return window._fbDb;
      if(typeof firebase!=="undefined" && firebase.database) return firebase.database();
    }catch(e){}
    return null;
  }
  // UPDATE: Bell khud ban jayega - header me, footer me nahi. Isliye header me bell paste karne ki zaroorat nahi.
  function createBell(){
    try{
      if(document.getElementById("bellBtn")) return;
      var hdr = document.getElementById("hdr") || document.querySelector("header");
      var b = document.createElement("button");
      b.id = "bellBtn";
      b.style.cssText = "background:none;border:none;font-size:22px;cursor:pointer;position:relative;flex-shrink:0";
      b.innerHTML = '🔔<span id="bellCount" style="display:none;position:absolute;top:-6px;right:-8px;background:red;color:#fff;font-size:11px;padding:1px 5px;border-radius:10px">0</span>';
      var p = document.createElement("div");
      p.id = "bellPanel";
      p.style.cssText = "display:none;position:fixed;top:60px;right:10px;width:300px;max-height:400px;overflow:auto;background:#fff;box-shadow:0 4px 20px rgba(0,0,0,.3);border-radius:12px;z-index:9999;padding:10px";
      if(hdr) hdr.appendChild(b); else document.body.insertBefore(b, document.body.firstChild);
      document.body.appendChild(p);
      b.onclick = function(e){
        e.stopPropagation();
        p.style.display = p.style.display==="block" ? "none" : "block";
        var n = getNotifs(); n.forEach(function(x){ x.read = true; }); saveNotifs(n); renderBell();
      };
      document.addEventListener("click", function(e){ if(p && !p.contains(e.target) && e.target!==b) p.style.display="none"; });
    }catch(e){}
  }
  function renderBell(){
    try{
      createBell();
      var n = getNotifs(), unread = n.filter(function(x){ return !x.read; }).length;
      var c = document.getElementById("bellCount"); if(c){ c.style.display = unread>0 ? "block" : "none"; c.textContent = unread; }
      var p = document.getElementById("bellPanel"); if(!p) return;
      if(!n.length){ p.innerHTML = '<div style="text-align:center;color:#999;padding:12px">Koi naya notification nahi hai</div>'; return; }
      p.innerHTML = n.map(function(x){
        var icon = x.type==="request"||x.type==="friend_request" ? "👥" : x.type==="accepted"||x.type==="friend_accepted" ? "✅" : x.type==="sent"||x.type==="friend_request_sent" ? "📩" : x.type==="unfriend" ? "🚫" : "💬";
        var title = x.type==="request"||x.type==="friend_request" ? "New Friend Request" : x.type==="accepted"||x.type==="friend_accepted" ? "Request Accepted" : x.type==="sent"||x.type==="friend_request_sent" ? "Request Sent" : x.type==="unfriend" ? "Unfriend" : "Message Aaya";
        return '<div style="display:flex;gap:10px;padding:10px;border-bottom:1px solid #eee;background:'+(x.read?"#fff":"#fff3e0")+'" onclick="if(\''+(x.uid||"")+'\') location.href=\'chat-box.html?uid='+(x.uid||"")+'\'"><div style="font-size:20px">'+icon+'</div><div><b style="font-size:14px">'+title+' - '+x.name+'</b><div style="font-size:12px;color:#666">'+(x.text||"")+'</div><div style="font-size:11px;color:#999">'+(x.time||"")+'</div></div></div>';
      }).join("");
    }catch(e){}
  }
  window.renderBell = renderBell;

  // UPDATE: Firebase ke notifications/ + friend_requests/ + chats/ - teeno jagah se bell me layega
  // Pehle wala galat path tha - friendRequests/ , requests/ - isliye kabhi nahi aata tha
  function syncFirebase(){
    try{
      var uid = getMyUid2(), db = getDb();
      if(!db || !uid) return;
      db.ref("notifications/"+uid).on("value", function(s){
        var items = []; s.forEach(function(ch){ var v = ch.val()||{}; v._key = ch.key; items.push(v); });
        items.sort(function(a,b){ return (b.time||0)-(a.time||0); });
        var local = getNotifs();
        var changed = false;
        items.slice(0,20).forEach(function(v){
          var key = "fb_"+(v._key||"");
          if(local.some(function(x){ return x._fbkey===key; })) return;
          var t = "message";
          if(v.type==="friend_request") t = "request";
          else if(v.type==="friend_request_sent") t = "sent";
          else if(v.type==="friend_accepted"||v.type==="friend_accepted_by_me") t = "accepted";
          else if(v.type==="unfriend") t = "unfriend";
          local.unshift({type:t, name:v.fromName||v.toName||"Friend", text:v.text||"", uid:v.fromUid||v.toUid||"", time:new Date(v.time||Date.now()).toLocaleString(), ts:v.time||Date.now(), read:false, _fbkey:key});
          changed = true;
          if(v.type==="friend_request") showReqNotify(v.fromName||"Friend", v.fromUid);
          if(v.type==="friend_accepted") highlightBox("🔔 "+(v.fromName||"Friend")+" ne Request Accept ki ✅", v.fromUid);
        });
        if(changed){ saveNotifs(local.slice(0,30)); renderBell(); }
        // List wala hissa bhi yahi se bharega
        renderNotifList(items.map(function(v){ return {type:(v.type==="friend_request"?"request":"message"), name:v.fromName||v.toName||"Friend", text:v.text||"", uid:v.fromUid||v.toUid||"", ts:v.time||Date.now()}; }));
      });
      // Pending request jiska notification bana hi nahi - usko bhi bell me dikhao
      db.ref("friend_requests/"+uid).on("value", function(s){
        var local = getNotifs(); var changed = false;
        s.forEach(function(ch){ var v = ch.val()||{}; var key = "req_"+ch.key;
          if(v.fromUid && !local.some(function(x){ return x._fbkey===key; })){
            local.unshift({type:"request", name:v.fromName||"Friend", text:(v.fromName||"Friend")+" ne Friend Request bheji hai", uid:v.fromUid, time:new Date(v.time||Date.now()).toLocaleString(), ts:v.time||Date.now(), read:false, _fbkey:key});
            changed = true;
          }
        });
        if(changed){ saveNotifs(local.slice(0,30)); renderBell(); }
      });
    }catch(e){}
  }
  function findNotifList(){
    return document.getElementById("notifList")||document.getElementById("notifBox")||document.getElementById("notificationsList")||document.getElementById("notifContainer");
  }
  function renderNotifList(items){
    try{
      var list = findNotifList();
      var countEl = document.getElementById("notifCount");
      if(countEl) countEl.textContent = String(items.length);
      if(!list) return;
      if(!items.length){ list.innerHTML = '<div style="text-align:center;color:#999;padding:12px;font-size:13px;">Koi naya notification nahi hai</div>'; return; }
      var h = "";
      items.forEach(function(it){
        var icon = it.type==="request" ? "👥" : "💬";
        var title = it.type==="request" ? ("New Friend Request - " + it.name) : ("Message aaya - " + it.name);
        var sub = it.type==="request" ? (it.name + " ne Friend Request bheji hai") : (it.name + ": " + (it.text||"").slice(0,60));
        h += '<div style="display:flex;gap:10px;align-items:center;background:#fff3e0;border:1px solid #ffcc80;border-radius:10px;padding:10px;margin:6px 0;cursor:pointer;" onclick="location.href=\'chat-box.html?uid=' + (it.uid||"") + '\'"><div style="font-size:20px;">'+icon+'</div><div style="flex:1;"><div style="font-weight:bold;font-size:14px;color:#e65100;">'+title+'</div><div style="font-size:12px;color:#666;">'+sub+'</div></div></div>';
      });
      list.innerHTML = h;
    }catch(e){}
  }
  function autoCheck(){ syncFirebase(); }
  /* ============ UPDATE END ============ */

  setTimeout(function(){
    var list = findNotifList();
    if(list && (list.textContent||"").indexOf("load ho rahi")!==-1){ renderNotifList([]); }
  }, 3000);
  document.addEventListener("DOMContentLoaded", function(){
    setTimeout(showAllowPopup, 1000);
    createBell(); renderBell(); syncFirebase();
    setInterval(syncFirebase, 5000);
  });
  createBell(); renderBell();
  setTimeout(syncFirebase, 1500);
})();