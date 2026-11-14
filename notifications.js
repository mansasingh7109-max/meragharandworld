// notifications.js - Friend message aaye to website me Notification
// Connect: <script src="notifications.js"></script> - bas 1 line, </body> se pehle
(function(){
  var _lastCount = 0;
  var _lastUid = "";
  function askNotify(){
    try{ if("Notification" in window && Notification.permission==="default"){ Notification.requestPermission(); } }catch(e){}
  }
  function showFriendNotify(name, text, uid){
    try{
      if(uid) window._lastFromUid = uid;
      document.title = "(1) " + (name||"Friend") + " ka message";
      var b = document.getElementById("msgNotifyBanner");
      if(!b){
        b = document.createElement("div"); b.id = "msgNotifyBanner";
        b.style.cssText = "position:fixed;top:0;left:0;right:0;background:#e65100;color:#fff;padding:12px;text-align:center;font-weight:bold;z-index:9999;cursor:pointer;";
        b.onclick = function(){ this.remove(); document.title = "Mera Ghar"; if(window._lastFromUid) location.href = "chat-box.html?uid=" + window._lastFromUid; };
        document.body.appendChild(b);
      }
      b.textContent = "Friend Message 1 - " + (name||"Friend") + " ne message bheja: " + (text||"").slice(0,40);
      try{ if("Notification" in window && Notification.permission==="granted"){ new Notification((name||"Friend") + " ka message", { body: text || "Naya message aaya hai" }); } }catch(e){}
      try{ var a = new Audio("https://www.soundjay.com/buttons/sounds/button-09a.mp3"); a.play(); }catch(e){}
      setTimeout(function(){ if(b) b.remove(); }, 6000);
    }catch(e){}
  }
  window.showFriendNotify = showFriendNotify;
  window.notifyFriendMessage = showFriendNotify;
  function autoCheck(){
    try{
      if(typeof _fbDb !== "undefined" && _fbDb && typeof myUid !== "undefined" && myUid){
        _fbDb.ref("chats").once("value").then(function(s){
          var v = s.val() || {};
          var count = 0; var last = null;
          Object.keys(v).forEach(function(k){
            var arr = v[k]; if(!Array.isArray(arr)) arr = Object.values(arr||{});
            arr.forEach(function(m){
              if(m && m.fromUid && m.fromUid !== myUid && !m.seen){ count++; last = m; }
            });
          });
          if(count > _lastCount && last){
            var nm = "Friend";
            try{ nm = last.fromName || friendName || "Friend"; }catch(e){}
            showFriendNotify(nm, last.text, last.fromUid);
          }
          _lastCount = count;
        }).catch(function(){});
      }
    }catch(e){}
  }
  document.addEventListener("DOMContentLoaded", function(){ askNotify(); setInterval(autoCheck, 5000); });
  setInterval(autoCheck, 5000);
})();
