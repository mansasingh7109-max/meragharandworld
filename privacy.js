// =====================================================
// PRIVACY.JS v3 - 7 alag Private/Public buttons
// Har page par APNA button!
//
// v2 se UPDATE: 2 naye button (Profile, Timeline) +
// har page par button lagane wale functions
//
// CONNECT: har page me </body> se PEHLE:
// <script src="privacy.js"></script>
//
// Phir us page ka button:
// album.html:        PRIV_placeBtn("albumPublic","hdr")
// timedatalist.html: PRIV_placeBtn("timelinePublic","hdr")
// friends.html:      PRIV_placeBtn("friendsPublic","hdr");PRIV_placeBtn("showInSearch","hdr")
// profile.html:      PRIV_bar("hdr",["profilePublic","detailPublic","msgPublic"])
//
// RULE: OFF wali cheez sirf FRIEND ko dikhegi
// =====================================================
(function(){
"use strict";

/* ===== v3 NEW: 7 SETTINGS (2 naye: profilePublic, timelinePublic) ===== */
var DEFS = {
  profilePublic: "on",   // v3 NEW
  detailPublic: "on",
  albumPublic: "on",
  timelinePublic: "on",  // v3 NEW
  msgPublic: "on",
  friendsPublic: "on",
  showInSearch: "on"
};
var LABELS = [
  {k:"profilePublic",  t:"👤 Profile",         d:"OFF = profile sirf friend ko dikhega"},  // v3 NEW
  {k:"detailPublic",   t:"📝 Personal Detail",  d:"OFF = detail sirf friend ko dikhega"},
  {k:"albumPublic",    t:"📸 Album",            d:"OFF = photos sirf friend ko dikhengi"},
  {k:"timelinePublic", t:"🕐 Timeline",         d:"OFF = timeline sirf friend ko dikhega"}, // v3 NEW
  {k:"msgPublic",      t:"💬 Message",          d:"OFF = message sirf friend ko dikhega"},
  {k:"friendsPublic",  t:"👥 Friends List",     d:"OFF = dost list sirf friend ko dikhegi"},
  {k:"showInSearch",   t:"🔍 Search me ID",      d:"OFF = koi search me nahi dhoondh payega"}
];
function labelOf(k){
  for(var i=0;i<LABELS.length;i++){ if(LABELS[i].k===k) return LABELS[i]; }
  return {k:k, t:k, d:""};
}

/* ---------- MERI SETTINGS (v2 jaisa + auto-migrate) ---------- */
function myPrivacy(){
  var out = {}, k;
  for(k in DEFS) out[k] = DEFS[k];
  try{
    var s = JSON.parse(localStorage.getItem("my_privacy") || "null");
    if(s) for(k in out){ if(s[k]==="on"||s[k]==="off") out[k]=s[k]; }
  }catch(e){}
  try{
    var lp = JSON.parse(localStorage.getItem("customer_profile") || "{}");
    if(lp.privacy) for(k in out){ if(lp.privacy[k]==="on"||lp.privacy[k]==="off") out[k]=lp.privacy[k]; }
    else if(lp.profilePublic === "off"){ for(k in out) out[k]="off"; } // v1 migrate
  }catch(e){}
  return out;
}
function savePrivacy(p){
  try{ localStorage.setItem("my_privacy", JSON.stringify(p)); }catch(e){}
  try{
    var lp = JSON.parse(localStorage.getItem("customer_profile") || "{}");
    lp.privacy = p;
    lp.profilePublic = p.profilePublic; // v3: ab asli profile setting
    try{ localStorage.setItem("customer_profile", JSON.stringify(lp)); }catch(e){}
  }catch(e){}
  setTimeout(function(){
    try{
      if(window._fbDb){
        var cid = (window.OPT && window.OPT.customerId) || "customer1";
        window._fbDb.ref("customer_profiles/" + cid + "/privacy").set(p);
        window._fbDb.ref("customer_profiles/" + cid + "/profilePublic").set(p.profilePublic);
      }
    }catch(e){}
  }, 1000);
}
function effCid(){
  try{ return (window.OPT && window.OPT.customerId) || "customer1"; }
  catch(e){ return "customer1"; }
}

/* ---------- GLOBAL HELPERS ---------- */
window.PRIV_get = function(u){
  var out = {}, k;
  for(k in DEFS) out[k] = DEFS[k];
  try{
    var p = (u && u.privacy) || {};
    for(k in out){ if(p[k]==="on"||p[k]==="off") out[k]=p[k]; }
    if(u && !u.privacy && u.profilePublic === "off"){ for(k in out) out[k]="off"; } // v1 migrate
  }catch(e){}
  return out;
};
window.PRIV_isFriend = function(name){
  try{
    var mf = JSON.parse(localStorage.getItem("fr_myfriends") || "[]");
    return mf.indexOf(name) !== -1;
  }catch(e){ return false; }
};
window.PRIV_my = myPrivacy;
/* ===== v3 NEW: kya me is user ka ye section dekh sakta hoon? ===== */
window.PRIV_canSee = function(u, key){
  try{
    var priv = window.PRIV_get(u);
    if(priv[key] === "on") return true;
    var nm = u.profileName || u.name || "";
    return window.PRIV_isFriend(nm);
  }catch(e){ return true; }
};

/* ===== v3 NEW: halka toast message (alert ki jagah) ===== */
function toast(msg){
  try{
    var t = document.getElementById("privToast");
    if(!t){
      t = document.createElement("div");
      t.id = "privToast";
      t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:12px 20px;border-radius:24px;font-size:14px;font-weight:bold;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,.3);";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(t._tm);
    t._tm = setTimeout(function(){ t.style.display = "none"; }, 2200);
  }catch(e){}
}

/* ===== v3 NEW: PAGE PAR BUTTON LAGAO ===== */
function paintBtn(b, key){
  var cur = myPrivacy();
  var on = cur[key] === "on";
  var L = labelOf(key);
  b.innerHTML = (on ? "🌍 " : "🔒 ") + L.t;
  b.style.background = on ? "#25D366" : "#999";
  b.title = L.d + " (dabao badalne ke liye)";
}
/* Ek page par ek button: PRIV_placeBtn("albumPublic","hdr") */
window.PRIV_placeBtn = function(key, hostId){
  var tries = 0;
  function go(){
    tries++;
    var host = document.getElementById(hostId);
    if(!host){ if(tries < 20) setTimeout(go, 300); return; }
    if(document.getElementById("privBtn_" + key)) return;
    var L = labelOf(key);
    var b = document.createElement("button");
    b.id = "privBtn_" + key;
    b.type = "button";
    b.style.cssText = "border:none;border-radius:20px;padding:8px 14px;font-weight:bold;font-size:13px;cursor:pointer;color:#fff;margin-left:8px;flex-shrink:0;white-space:nowrap;";
    b.onclick = function(){
      var cur = myPrivacy();
      cur[key] = (cur[key] === "on") ? "off" : "on";
      savePrivacy(cur);
      paintBtn(b, key);
      toast(L.t + ": " + (cur[key]==="on" ? "Public 🌍" : "Private 🔒"));
    };
    paintBtn(b, key);
    host.appendChild(b);
  }
  go();
};
/* Ek saath kai buttons: PRIV_bar("hdr",["profilePublic","detailPublic","msgPublic"]) */
window.PRIV_bar = function(hostId, keys){
  var tries = 0;
  function go(){
    tries++;
    var host = document.getElementById(hostId);
    if(!host){ if(tries < 20) setTimeout(go, 300); return; }
    if(document.getElementById("privBar")) return;
    var bar = document.createElement("div");
    bar.id = "privBar";
    bar.style.cssText = "display:flex;gap:8px;overflow-x:auto;padding:10px 16px;background:#f3e5f5;border-bottom:2px solid #7b1fa2;";
    keys.forEach(function(key){
      var L = labelOf(key);
      var b = document.createElement("button");
      b.type = "button";
      b.id = "privBtn_" + key;
      b.style.cssText = "border:none;border-radius:20px;padding:8px 14px;font-weight:bold;font-size:13px;cursor:pointer;color:#fff;flex-shrink:0;white-space:nowrap;";
      b.onclick = function(){
        var cur = myPrivacy();
        cur[key] = (cur[key] === "on") ? "off" : "on";
        savePrivacy(cur);
        paintBtn(b, key);
        toast(L.t + ": " + (cur[key]==="on" ? "Public 🌍" : "Private 🔒"));
      };
      paintBtn(b, key);
      bar.appendChild(b);
    });
    host.parentNode.insertBefore(bar, host.nextSibling);
  }
  go();
};

/* ---------- 1. SEARCH ME PRIVATE ID CHHUPAO (v2 jaisa) ---------- */
if(window.searchFbFriends && !window.searchFbFriends._privDone){
  (function(){
    var orig = window.searchFbFriends;
    window.searchFbFriends = function(q){
      try{
        if(window._fbUsers && window._fbUsers.length){
          var mine = effCid();
          window._fbUsers = window._fbUsers.filter(function(u){
            if(!u) return false;
            if(window.PRIV_get(u).showInSearch !== "off") return true;
            return u._key === mine;
          });
        }
      }catch(e){}
      return orig(q);
    };
    window.searchFbFriends._privDone = true;
  })();
}

/* ---------- 2. renderFriends CRASH FIX (v2 jaisa) ---------- */
if(!window.renderFriends){
  window.renderFriends = function(){};
}

/* ---------- 3. FRIENDS GRID ME PRIVATE ID CHHUPAO (v2 jaisa) ---------- */
setTimeout(function(){
  try{
    if(!window._fbDb || !window.FRIENDS) return;
    window._fbDb.ref("customer_profiles").once("value", function(snap){
      var hideNames = {};
      snap.forEach(function(ch){
        var u = ch.val();
        if(u && window.PRIV_get(u).showInSearch === "off"){
          var nm = u.profileName || u.name || "";
          if(nm) hideNames[String(nm).toLowerCase()] = true;
        }
      });
      var demos = {};
      (window.DEMO_FRIENDS || []).forEach(function(d){
        demos[String(d.name).toLowerCase()] = true;
      });
      var myLogin = null;
      try{ myLogin = JSON.parse(localStorage.getItem("customer_login") || "null"); }catch(e){}
      var myName = (myLogin && myLogin.name || "").toLowerCase();
      window.FRIENDS = (window.FRIENDS || []).filter(function(f){
        var n = String(f.name).toLowerCase();
        if(demos[n]) return true;
        if(n && n === myName) return false;
        return !hideNames[n];
      });
      if(window.renderMyFriends) window.renderMyFriends();
    });
  }catch(e){}
}, 3500);

/* ---------- 4. PROFILE DETAIL PAGE - PRIVACY KE SAATH (v3: profile+timeline lock jude) ---------- */
window.openFbProfile = function(userKey){
  var u = null, i;
  try{
    for(i=0; i<window._fbUsers.length; i++){
      if(window._fbUsers[i]._key === userKey){ u = window._fbUsers[i]; break; }
    }
  }catch(e){}
  if(!u) return;
  var priv = window.PRIV_get(u);
  var nm = u.profileName || u.name || "Naam nahi";
  var isFr = window.PRIV_isFriend(nm);
  var esc = function(s){ return String(s == null ? "" : s).replace(/</g,"&lt;"); };
  var lockBox = function(t){
    return '<div style="background:#f5f5f5;border:1px dashed #bbb;border-radius:10px;padding:12px;margin:12px 0;color:#999;font-size:13px;">🔒 ' + t + '<br>Friend bano, phir dikhega!</div>';
  };

  var photo = u.profilePhoto || "";
  var pHtml = (photo.indexOf("http")===0 || photo.indexOf("data:")===0)
    ? '<img src="'+photo+'" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin:0 auto;display:block;">'
    : '<div style="width:100px;height:100px;border-radius:50%;background:#ffe0b2;display:flex;align-items:center;justify-content:center;font-size:56px;margin:0 auto;">'+esc(photo || "👤")+'</div>';

  var h = "";
  /* ===== v3 NEW: poora profile private ho to lock ===== */
  if(priv.profilePublic === "off" && !isFr){
    h = pHtml
      + '<h2 style="font-size:22px;margin:12px 0 4px;">'+esc(nm)+'</h2>'
      + lockBox("Ye profile private hai")
      + '<button onclick="sendFbRequest(\''+String(userKey).replace(/'/g,"")+'\',this)" style="background:#25D366;color:#fff;border:none;padding:12px 24px;border-radius:24px;font-weight:bold;font-size:15px;">➕ Friend Request Bhejo</button>';
    document.getElementById("detailCard").innerHTML = h;
    document.getElementById("detailPage").style.display = "block";
    window.scrollTo(0,0);
    return;
  }

  h = pHtml
    + '<h2 style="font-size:22px;margin:12px 0 4px;">'+esc(nm)+'</h2>'
    + ((u.profilePhone||u.phone) ? '<div style="color:#e65100;font-weight:bold;margin-bottom:10px;">📞 '+esc(u.profilePhone||u.phone)+'</div>' : '');

  if(priv.detailPublic === "on" || isFr){
    if(u.profileDetail) h += '<div style="font-size:14px;color:#666;margin:12px 0;text-align:left;line-height:1.6;">'+esc(u.profileDetail)+'</div>';
    if(u.profileThinking) h += '<div style="font-size:14px;color:#666;margin:12px 0;text-align:left;line-height:1.6;background:#fffbe6;border-left:4px solid #ffc107;padding:10px;border-radius:0 10px 10px 0;">💭 '+esc(u.profileThinking)+'</div>';
  } else {
    h += lockBox("Detail private hai");
  }

  var xp = [], q;
  for(q=2; q<=15; q++){ var v = u["profilePhoto"+q]; if(v) xp.push(v); }
  if(u.profilePhoto && xp.indexOf(u.profilePhoto) < 0) xp.unshift(u.profilePhoto);
  if(xp.length > 0){
    if(priv.albumPublic === "on" || isFr){
      h += '<div style="text-align:left;margin:12px 0;"><b style="color:#e65100;">📸 Photos ('+xp.length+')</b><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;">';
      for(q=0; q<Math.min(xp.length,9); q++){
        var p = xp[q];
        if(p.indexOf("http")===0 || p.indexOf("data:")===0)
          h += '<img src="'+p+'" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;">';
        else
          h += '<div style="width:100%;aspect-ratio:1;background:#ffe0b2;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;">'+esc(p)+'</div>';
      }
      h += '</div></div>';
    } else {
      h += lockBox("Photos private hain (" + xp.length + ")");
    }
  }

  /* ===== v3 NEW: timeline lock ===== */
  h += '<div id="privTlBox" style="margin:12px 0;"></div>';
  h += '<div id="privMsgBox" style="margin:12px 0;"></div>';

  h += '<button onclick="sendFbRequest(\''+String(userKey).replace(/'/g,"")+'\',this)" style="background:#25D366;color:#fff;border:none;padding:12px 24px;border-radius:24px;font-weight:bold;font-size:15px;">➕ Friend Request Bhejo</button>';

  document.getElementById("detailCard").innerHTML = h;
  document.getElementById("detailPage").style.display = "block";
  window.scrollTo(0,0);

  (function(){
    var tlb = document.getElementById("privTlBox");
    if(tlb){
      if(priv.timelinePublic === "on" || isFr){
        tlb.innerHTML = '<div style="font-size:13px;color:#1565c0;background:#e3f2fd;border-radius:10px;padding:10px;">🕐 <a href="timedatalist.html" style="color:#1565c0;font-weight:bold;">Timeline dekho</a></div>';
      } else {
        tlb.innerHTML = lockBox("Timeline private hai");
      }
    }
    var box = document.getElementById("privMsgBox");
    if(!box) return;
    if(priv.msgPublic === "on" || isFr){
      if(window._fbDb){
        window._fbDb.ref("profile_messages/" + userKey).once("value", function(snap){
          var n = 0; snap.forEach(function(){ n++; });
          var b2 = document.getElementById("privMsgBox");
          if(b2) b2.innerHTML = n > 0
            ? '<div style="font-size:13px;color:#7b1fa2;background:#f3e5f5;border-radius:10px;padding:10px;">💬 ' + n + ' messages hain</div>'
            : '';
        });
      }
    } else {
      box.innerHTML = lockBox("Messages private hain");
    }
  })();
};

/* ---------- 5. EDIT PANEL ME 7 PRIVACY BUTTONS (v2 me 5 the) ---------- */
setTimeout(function(){
  var b = document.getElementById("custEditBtn");
  if(b){
    b.addEventListener("click", function(){
      setTimeout(function(){
        if(document.getElementById("cePrivSec")) return;
        var nameInput = document.getElementById("ceName");
        if(!nameInput || !nameInput.parentNode) return;
        var cur = myPrivacy();
        var sec = document.createElement("div");
        sec.id = "cePrivSec";
        sec.style.cssText = "background:#f3e5f5;border:2px solid #7b1fa2;border-radius:12px;padding:12px;margin:6px 0 12px;";
        var h = '<b style="color:#7b1fa2;font-size:15px;">🔒 Privacy Settings</b>'
          + '<div style="font-size:12px;color:#666;margin:4px 0 10px;">Har cheez ka alag button — OFF wali cheez sirf <b>friend</b> banne par dikhegi</div>';
        LABELS.forEach(function(L){
          var on = cur[L.k] === "on";
          h += '<label style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer;">'
            + '<input type="checkbox" class="cePrivCk" data-k="'+L.k+'"' + (on ? " checked" : "") + ' style="width:22px;height:22px;flex-shrink:0;">'
            + '<div><b style="font-size:14px;color:#333;">'+L.t+'</b>'
            + '<div style="font-size:12px;color:#888;">'+L.d+'</div></div></label>';
        });
        sec.innerHTML = h;
        nameInput.parentNode.insertBefore(sec, nameInput);
      }, 400);
    });
  }
  var sv = document.getElementById("ceSave");
  if(sv){
    sv.addEventListener("click", function(){
      var p = {}, k;
      for(k in DEFS) p[k] = "on";
      var cks = document.querySelectorAll(".cePrivCk");
      for(var i=0; i<cks.length; i++){
        p[cks[i].getAttribute("data-k")] = cks[i].checked ? "on" : "off";
      }
      savePrivacy(p);
    });
  }
}, 1200);

console.log("🔒 privacy.js v3 loaded (7 buttons)");
})();