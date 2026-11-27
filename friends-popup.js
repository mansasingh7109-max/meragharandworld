// ===== friends-popup.js - All Friends Popup, alag file =====
// Kaam: Search + Live List - purana/naya/future sab dost Firebase se apne aap aayenge
// friends.html me sirf ye 1 line add karni hai, </body> ke just upar:
// <script src="friends-popup.js"></script>
// Is file me HTML + CSS + Function sab hai - friends.html me kuch aur mat chhedo
(function(){
  "use strict";

  var frPopupAll = [];
  var frPopupSel = {};

  function myUid(){
    try{ return (typeof window.myUid !== "undefined" && window.myUid) || localStorage.getItem("auth_uid") || ""; }catch(e){ return ""; }
  }
  function myDb(){
    try{ return window._fbDb || (window.firebase && window.firebase.database && window.firebase.database()) || null; }catch(e){ return null; }
  }
  function esc(t){ return String(t||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  // ===== 1. Popup ka HTML + CSS - JS se hi ban jayega =====
  function buildPopup(){
    if(document.getElementById("frPopup")) return;
    var css = document.createElement("style");
    css.textContent =
      "#frPopup{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;align-items:center;justify-content:center;padding:16px;}" +
      "#frPopupBox{background:#fff;width:100%;max-width:420px;max-height:85vh;border-radius:20px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 50px rgba(0,0,0,.35);}" +
      "#frPopupList{overflow-y:auto;padding:0 12px 12px;flex:1;}" +
      ".frPopupItem{display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid #f0f0f0;cursor:pointer;}" +
      ".frPopupItem img{width:38px;height:38px;border-radius:50%;object-fit:cover;}" +
      ".frPopupItem b{flex:1;font-size:14px;}";
    document.head.appendChild(css);

    var wrap = document.createElement("div");
    wrap.id = "frPopup";
    wrap.innerHTML =
      '<div id="frPopupBox">' +
        '<div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#00c853,#00b0ff);color:#fff;">' +
          '<b>👥 All Friends - <span id="frPopupCount">0</span></b>' +
          '<button id="frPopupClose" type="button" style="background:rgba(255,255,255,.25);color:#fff;border:none;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="padding:12px;">' +
          '<input id="frPopupSearch" placeholder="🔍 Dost ka naam search karo..." style="width:100%;padding:12px;border:1px solid #ddd;border-radius:999px;outline:none;font-size:14px;">' +
          '<div style="display:flex;gap:10px;margin-top:10px;">' +
            '<button id="frPopupAll" type="button" style="flex:1;background:linear-gradient(135deg,#00c853,#00b0ff);color:#fff;border:none;padding:11px;border-radius:999px;font-weight:800;cursor:pointer;">✓ All Friends</button>' +
            '<button id="frPopupClear" type="button" style="flex:1;background:linear-gradient(135deg,#ff5f6d,#ffc371);color:#fff;border:none;padding:11px;border-radius:999px;font-weight:800;cursor:pointer;">✕ Clear All Friends</button>' +
          '</div>' +
        '</div>' +
        '<div id="frPopupList"><div style="text-align:center;color:#999;padding:20px;">⏳ Dost load ho rahe hain...</div></div>' +
        '<button id="frPopupDone" type="button" style="margin:0 12px 12px;background:#25D366;color:#fff;border:none;padding:13px;border-radius:999px;font-weight:800;font-size:15px;cursor:pointer;">✅ Done</button>' +
      '</div>';
    document.body.appendChild(wrap);

    document.getElementById("frPopupClose").onclick = closeFrPopup;
    document.getElementById("frPopupDone").onclick = closeFrPopup;
    document.getElementById("frPopupSearch").oninput = function(){ renderFrPopup(this.value || ""); };
    document.getElementById("frPopupAll").onclick = function(){ tickAllFrPopup(true); };
    document.getElementById("frPopupClear").onclick = function(){ tickAllFrPopup(false); };
    wrap.addEventListener("click", function(e){ if(e.target === wrap) closeFrPopup(); });
  }

  // ===== 2. Open / Close =====
  window.openFrPopup = function(){
    buildPopup();
    document.getElementById("frPopup").style.display = "flex";
    loadFrPopup();
  };
  window.closeFrPopup = function(){
    var p = document.getElementById("frPopup");
    if(p) p.style.display = "none";
    try{
      document.querySelectorAll(".pfFrChk, .inboxFrChk").forEach(function(c){
        if(frPopupSel[c.value]) c.checked = true;
      });
    }catch(e){}
  };
  window.filterFrPopup = function(){ var s = document.getElementById("frPopupSearch"); renderFrPopup(s ? s.value : ""); };
  window.tickAllFrPopup = function(on){
    var s = document.getElementById("frPopupSearch");
    var q = (s ? s.value : "") || "";
    frPopupAll.forEach(function(f){
      if(!q || (f.name||"").toLowerCase().indexOf(q.toLowerCase()) !== -1) frPopupSel[f.uid] = on;
    });
    renderFrPopup(q);
  };

  // ===== 3. Live Load - Firebase se, future wale naye dost apne aap =====
  window.loadFrPopup = function(){
    var uid = myUid();
    var db = myDb();
    var fromArr = [];
    try{
      if(typeof FRIENDS !== "undefined" && FRIENDS.length){
        FRIENDS.forEach(function(f){
          fromArr.push({uid: f._uid || f.uid || "", name: f.name || "", photo: f.photoUrl || f.photo || ""});
        });
      }
    }catch(e){}
    if(db){
      db.ref("customer_profiles").once("value").then(function(snap){
        var all = snap.val() || {};
        var list = [];
        var seen = {};
        Object.keys(all).forEach(function(id){
          if(id === uid) return;
          var P = all[id] || {};
          var nm = P.profileName || P.name || P.customer_name || "Friend";
          list.push({uid:id, name:nm, photo:P.profilePhoto || P.photo || P.profileImage || ""});
          seen[id] = true;
        });
        fromArr.forEach(function(f){ if(f.uid && !seen[f.uid]) list.push(f); });
        list.sort(function(a,b){ return (a.name||"").localeCompare(b.name||""); });
        frPopupAll = list;
        renderFrPopup("");
      }).catch(function(){ frPopupAll = fromArr; renderFrPopup(""); });
    } else {
      frPopupAll = fromArr;
      renderFrPopup("");
    }
  };

  function renderFrPopup(q){
    var box = document.getElementById("frPopupList");
    var cnt = document.getElementById("frPopupCount");
    if(!box) return;
    q = (q || "").toLowerCase();
    var show = frPopupAll.filter(function(f){
      return !q || (f.name || "").toLowerCase().indexOf(q) !== -1;
    });
    if(cnt) cnt.textContent = show.length;
    if(!show.length){
      box.innerHTML = '<div style="text-align:center;color:#999;padding:20px;">Koi dost nahi mila<br>Naya dost add karte hi yahan aa jayega</div>';
      return;
    }
    var h = "";
    show.forEach(function(f){
      var pic = f.photo ? '<img src="' + f.photo.replace(/"/g,"&quot;") + '">' : '<span style="font-size:22px;">👤</span>';
      var chk = frPopupSel[f.uid] ? "checked" : "";
      h += '<label class="frPopupItem"><input type="checkbox" class="frPopupChk" value="' + f.uid + '" ' + chk + ' onchange="window.frPopupSelToggle(this)" style="width:20px;height:20px;">' + pic + '<b>' + esc(f.name || "Friend") + '</b></label>';
    });
    box.innerHTML = h;
  }
  window.frPopupSelToggle = function(el){ frPopupSel[el.value] = el.checked; };

  // ===== 4. All Friends button ko popup se jodo - purana onclick mat chhedo =====
  document.addEventListener("click", function(e){
    var b = e.target && e.target.closest ? e.target.closest("button") : null;
    if(!b) return;
    var id = b.id || "";
    var t = (b.textContent || "").trim();
    var isMainAll = (id === "selAllFr" || id === "allBtn" || id === "pfAllBtn" || id === "allFriendsBtn");
    var isMainAllText = (t === "✅ All Friends" || t === "All Friends" || t === "✓ All Friends");
    if(!isMainAll && !isMainAllText) return;
    if(b.closest && b.closest("#frPopup")) return;
    e.preventDefault();
    e.stopPropagation();
    window.openFrPopup();
  }, true);

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", buildPopup);
  } else {
    buildPopup();
  }
})();