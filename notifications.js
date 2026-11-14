// notifications.js - ONLY ye popup + Highlight
// Meragharandworld Notification
// Allow kare?
// [ Allow ] [ Block ]
// + Message / Friend Request aaye to Highlight hoga
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
      try{
        var btns = document.querySelectorAll("button, .tab, .inbox, #inboxBtn, #reqBtn, #friendReqBtn");
        for(var i=0;i<btns.length;i++){
          var t = (btns[i].textContent||"").toLowerCase();
          if(t.indexOf("inbox")!==-1 || t.indexOf("request")!==-1 || t.indexOf("friend")!==-1){
            btns[i].style.cssText += ";background:#ff5722!important;color:#fff!important;box-shadow:0 0 12px #ff5722!important;border:2px solid #fff!important;";
          }
        }
      }catch(e){}
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
  function autoCheck(){
    try{
      if(typeof _fbDb === "undefined" || !_fbDb || typeof myUid === "undefined" || !myUid) return;
      _fbDb.ref("chats").once("value").then(function(s){
        var v = s.val() || {};
        var count = 0; var last = null;
        Object.keys(v).forEach(function(k){
          var arr = v[k]; if(!Array.isArray(arr)) arr = Object.values(arr||{});
          arr.forEach(function(m){
            if(m && m.fromUid && m.fromUid !== myUid && !m.seen){ count++; last = m; }
          });
        });
        if(count > _lastMsg && last){
          var nm = "Friend";
          try{ nm = last.fromName || friendName || "Friend"; }catch(e){}
          showFriendNotify(nm, last.text, last.fromUid);
        }
        _lastMsg = count;
      }).catch(function(){});
      var reqPaths = ["friendRequests/" + myUid, "requests/" + myUid, "friendReq/" + myUid];
      reqPaths.forEach(function(path){
        _fbDb.ref(path).once("value").then(function(s){
          var v = s.val() || {};
          var arr = Array.isArray(v) ? v : Object.values(v);
          var pending = arr.filter(function(r){ return r && (r.status==="pending" || !r.status || r.status==="sent"); });
          if(pending.length > _lastReq){
            var lastR = pending[pending.length-1];
            var nm2 = "Friend";
            try{ nm2 = lastR.fromName || lastR.name || "Friend"; }catch(e){}
            showReqNotify(nm2, lastR.fromUid || lastR.uid);
          }
          if(pending.length > 0) _lastReq = pending.length;
        }).catch(function(){});
      });
    }catch(e){}
  }
  document.addEventListener("DOMContentLoaded", function(){ setTimeout(showAllowPopup, 1000); setInterval(autoCheck, 5000); });
  setInterval(autoCheck, 5000);
})();
