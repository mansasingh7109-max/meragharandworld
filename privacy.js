// =====================================================
// PRIVACY.JS v5 - FINAL FIX
// File naam: privacy.js - wahi rahega
// <script src="privacy.js"></script>
// 
// RULE: Friend ki Timeline me privacy button kabhi
// dabane wala nahi hoga - sirf badge dikhega.
// Koi bhi user kisi aur ki privacy change nahi kar sakta.
// =====================================================
(function(){
"use strict";
/* ========== 0. KAUN HAI? - Owner vs Visitor ========== */
function getMyOwnUid(){
  try{
    var q = new URLSearchParams(location.search);
    var lg = q.get("login") || q.get("me") || q.get("myUid") || "";
    if(lg){ try{ localStorage.setItem("MY_OWN_UID", lg); }catch(e){} return lg; }
    return localStorage.getItem("MY_OWN_UID") || localStorage.getItem("auth_uid") || "";
  }catch(e){ return ""; }
}
function getPageOwnerUid(){
  try{
    var q = new URLSearchParams(location.search);
    var u = q.get("uid") || q.get("cid") || q.get("owner") || q.get("id") || q.get("page") || "";
    if(u){ try{ sessionStorage.setItem("VIEW_OWNER_UID", u); }catch(e){} return u; }
    try{ return sessionStorage.getItem("VIEW_OWNER_UID") || ""; }catch(e){ return ""; }
  }catch(e){ return ""; }
}
function isVisitorNow(){
  var mine = getMyOwnUid(), owner = getPageOwnerUid();
  if(mine && owner && mine !== owner) return true;
  return false;
}
function isOwnerNow(){
  var mine = getMyOwnUid(), owner = getPageOwnerUid();
  if(!owner) return true;
  if(!mine) return false;
  return mine === owner;
}
window.getMyOwnUid = getMyOwnUid;
window.getMyUid = getMyOwnUid;
window._isVisitorMode = isVisitorNow;
window.isVisitorNow = isVisitorNow;
window.isOwnerNow = isOwnerNow;

/* ========== 1. Kaun dekhega? - Public / Friend / Private / Custom ========== */
function visKey(){ var o = getPageOwnerUid() || getMyOwnUid() || "me"; return "timeline_privacy_" + o; }
function customKey(){ var o = getPageOwnerUid() || getMyOwnUid() || "me"; return "timeline_privacy_custom_" + o; }
function getVis(){
  try{
    var v = localStorage.getItem(visKey());
    if(v) return v;
    return localStorage.getItem("timeline_privacy") || "Public";
  }catch(e){ return "Public"; }
}
function setVis(v){
  // *** SABSE BADA FIX - Visitor yahan se wapis jayega ***
  if(isVisitorNow()){ alert("🔒 Sirf dekh sakte ho - Friend ki privacy badal nahi sakte"); return; }
  try{ localStorage.setItem(visKey(), v); localStorage.setItem("timeline_privacy", v); }catch(e){}
  try{
    var h = document.getElementById("visHint"); if(h) h.textContent = "Abhi: " + v;
    var b = document.getElementById("pVisBadge"); if(b) b.textContent = (v==="Public"?"🌍 Public":v==="Friend"?"👥 Friend":v==="Private"?"🔒 Private":"⚙️ Custom");
    ["vPublic","vFriend","vPrivate","vCustom"].forEach(function(id){
      var el = document.getElementById(id); if(!el) return;
      var isOn = (id==="vPublic"&&v==="Public")||(id==="vFriend"&&v==="Friend")||(id==="vPrivate"&&v==="Private")||(id==="vCustom"&&v==="Custom");
      el.classList.toggle("on", isOn);
    });
  }catch(e){}
  if(v==="Custom") openCustomPicker();
  applyVisitor();
}
function getFriends(){
  var out = [];
  try{
    ["fr_myfriends","my_friends","friends_list","myFriends"].forEach(function(k){
      var arr = JSON.parse(localStorage.getItem(k)||"[]");
      arr.forEach(function(f){ var nm = typeof f==="string" ? f : (f.name||f.profileName||f.uid||""); if(nm && out.indexOf(nm)===-1) out.push(nm); });
    });
  }catch(e){}
  try{
    var profs = JSON.parse(localStorage.getItem("all_profiles")||"[]");
    profs.forEach(function(p){ var nm=p.profileName||p.name||""; if(nm && out.indexOf(nm)===-1) out.push(nm); });
  }catch(e){}
  try{
    var fb = JSON.parse(localStorage.getItem("my_profile")||"{}");
    if(fb.friendsList && fb.friendsList.length) fb.friendsList.forEach(function(n){ if(out.indexOf(n)===-1) out.push(n); });
  }catch(e){}
  return out;
}
function getCustom(){ try{ return JSON.parse(localStorage.getItem(customKey())||"[]"); }catch(e){ return []; } }
function saveCustom(list){ try{ localStorage.setItem(customKey(), JSON.stringify(list)); }catch(e){} }
function openCustomPicker(){
  if(isVisitorNow()){ alert("🔒 Sirf dekh sakte ho - Custom badal nahi sakte"); return; }
  var old = document.getElementById("customPicker");
  if(old){ old.style.display="flex"; renderCustomList(""); return; }
  var wrap = document.createElement("div"); wrap.id = "customPicker";
  wrap.style.cssText = "display:flex;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.6);z-index:9999;align-items:center;justify-content:center;";
  wrap.innerHTML = '<div style="background:#fff;width:92%;max-width:420px;border-radius:16px;padding:16px;max-height:80vh;overflow:auto;">'
    + '<b style="font-size:18px;">⚙️ Custom - Kisko Dikhana Hai?</b>'
    + '<div style="font-size:12px;color:#666;margin:6px 0;">Tick karo, jisko tick karoge sirf wahi dekhega - naam type nahi karna</div>'
    + '<input id="customSearch" oninput="filterCustomFriends()" placeholder="Friend dhoondo..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:20px;outline:none;margin-bottom:10px;">'
    + '<div id="customFriendList"></div>'
    + '<div style="display:flex;gap:8px;margin-top:12px;"><button onclick="saveCustomPicker()" style="flex:1;background:#e65100;color:#fff;border:none;border-radius:20px;padding:11px;font-weight:bold;">✅ Done</button><button onclick="closeCustomPicker()" style="background:#eee;border:1px solid #ddd;border-radius:20px;padding:11px 14px;">✖️</button></div>'
    + '<div id="customSelectedCount" style="font-size:12px;color:#e65100;margin-top:8px;font-weight:bold;"></div></div>';
  document.body.appendChild(wrap); renderCustomList("");
}
function renderCustomList(q){
  var box = document.getElementById("customFriendList"); if(!box) return;
  var sel = getCustom(); var all = getFriends(); var html = "";
  all.forEach(function(n){
    if(q && String(n).toLowerCase().indexOf(String(q).toLowerCase())===-1) return;
    var ck = sel.indexOf(n)!==-1 ? " checked" : "";
    html += '<label style="display:flex;gap:10px;align-items:center;background:#fff8f0;border-radius:10px;padding:10px;margin-bottom:6px;cursor:pointer;"><input type="checkbox" class="customCk" value="'+String(n).replace(/"/g,"")+'"'+ck+' style="width:20px;height:20px;">'+n+'</label>';
  });
  box.innerHTML = html || '<div style="color:#999;padding:10px;">Koi friend nahi mila - pehle Friend banao</div>';
  var c = document.getElementById("customSelectedCount"); if(c) c.textContent = "✅ Selected: " + sel.length + " friend";
}
function filterCustomFriends(){ var s=document.getElementById("customSearch"); renderCustomList(s?s.value:""); }
function saveCustomPicker(){
  var list=[]; document.querySelectorAll(".customCk:checked").forEach(function(c){ list.push(c.value); });
  saveCustom(list); closeCustomPicker(); alert("✅ Custom save ho gaya - sirf "+list.length+" friend dekhenge");
}
function closeCustomPicker(){ var p=document.getElementById("customPicker"); if(p) p.style.display="none"; }
function renderBar(){
  var box = document.getElementById("privacyBar"); if(!box) return;
  var v = getVis(); var owner = !isVisitorNow();
  if(owner){
    box.innerHTML = '<div class="msg-actions"><span style="font-size:13px;font-weight:bold;padding:8px 2px;">👁️ Kaun dekhega?</span>'
      + '<button id="vPublic" class="'+(v==="Public"?"on":"")+'" onclick="setVis(\'Public\')">🌍 Public</button>'
      + '<button id="vFriend" class="'+(v==="Friend"?"on":"")+'" onclick="setVis(\'Friend\')">👥 Friend</button>'
      + '<button id="vPrivate" class="'+(v==="Private"?"on":"")+'" onclick="setVis(\'Private\')">🔒 Private</button>'
      + '<button id="vCustom" class="'+(v==="Custom"?"on":"")+'" onclick="setVis(\'Custom\')">⚙️ Custom</button>'
      + '<span id="visHint" style="font-size:12px;color:#666;padding:8px 2px;">Abhi: '+v+'</span></div>';
  } else {
    var label = v==="Public"?"🌍 Public":v==="Friend"?"👥 Friend":v==="Private"?"🔒 Private":"⚙️ Custom - Sirf chune hue friends";
    box.innerHTML = '<div class="msg-actions"><span style="font-size:13px;font-weight:bold;padding:8px 2px;">👁️ Kaun dekhega?</span>'
      + '<span class="pill" id="pVisBadge" style="background:#e8f5e9;padding:7px 12px;border-radius:20px;">'+label+'</span>'
      + '<span style="font-size:12px;color:#888;">🔒 Sirf dekh sakte ho - badal nahi sakte</span></div>';
  }
}
function canSee(viewerName){
  var v = getVis();
  if(v==="Public") return true;
  if(v==="Private") return false;
  if(v==="Friend"){ try{ var f=JSON.parse(localStorage.getItem("fr_myfriends")||"[]"); return f.indexOf(viewerName)!==-1; }catch(e){ return false; } }
  if(v==="Custom"){ return getCustom().indexOf(viewerName)!==-1; }
  return true;
}

/* ========== 2. VISITOR ENFORCER - har 500ms me wapis chhupayega ========== */
function applyVisitor(){
  try{
    var v = isVisitorNow();
    if(document.body){ if(v) document.body.classList.add("visitor-mode"); else document.body.classList.remove("visitor-mode"); }
    if(v){
      // Profile ke upar wale privacy button - Profile Edit wali patti
      var pb = document.getElementById("profileBtns"); if(pb) pb.style.display = "none";
      // Kaun dekhega wali patti - timedatalist wali purani patti
      var allMsg = document.querySelectorAll(".msg-actions");
      for(var i=0;i<allMsg.length;i++){
        var txt = allMsg[i].textContent || "";
        if(txt.indexOf("Kaun dekhega")!==-1){ allMsg[i].style.display = "none"; }
      }
      // Akela-akela button bhi - agar kahin bach gaya to
      ["vPublic","vFriend","vPrivate","vCustom"].forEach(function(id){
        var el = document.getElementById(id); if(el) el.style.display = "none";
      });
      var kd = document.getElementById("kaunDekhegaCard"); if(kd) kd.style.display = "none";
      // Badge wapis dikhao - taaki pata chale Friend ne kya rakha hai
      var badge = document.getElementById("pVisBadge");
      if(badge){ badge.style.display = ""; badge.textContent = getVis()==="Public"?"🌍 Public":getVis()==="Friend"?"👥 Friend":getVis()==="Private"?"🔒 Private":"⚙️ Custom"; }
    }
    renderBar();
  }catch(e){}
}
/* timedatalist ka apna setVis / setProfileVis isko daba deta hai,
   isliye 1.5 sec baad dobara apna wala laga do - Visitor guard ke saath */
function forceGuard(){
  window.setVis = setVis;
  window.setPrivacy = setVis;
  window.setProfileVis = function(v){
    if(isVisitorNow()){ alert("🔒 Sirf dekh sakte ho - Friend ki privacy badal nahi sakte"); return; }
    if(v==="Custom"){ openCustomPicker(); return; }
    try{ localStorage.setItem(visKey(), v); localStorage.setItem("timeline_privacy", v); }catch(e){}
    applyVisitor();
  };
  window.setProfilePrivacy = window.setProfileVis;
  window.openCustomPicker = openCustomPicker;
  window.closeCustomPicker = closeCustomPicker;
  window.saveCustomPicker = saveCustomPicker;
  window.filterCustomFriends = filterCustomFriends;
  window.PRIVACY = { get: getVis, set: setVis, canSee: canSee, isOwner: function(){ return !isVisitorNow(); }, getCustom: getCustom, render: renderBar };
  window._applyVisitorMode = applyVisitor;
}
window.setVis = setVis; window.setPrivacy = setVis;
forceGuard();
document.addEventListener("DOMContentLoaded", function(){ renderBar(); applyVisitor(); forceGuard(); });
setTimeout(function(){ renderBar(); applyVisitor(); forceGuard(); }, 500);
setTimeout(function(){ renderBar(); applyVisitor(); forceGuard(); }, 1500);
setTimeout(function(){ renderBar(); applyVisitor(); forceGuard(); }, 3000);
setInterval(function(){ if(isVisitorNow()) applyVisitor(); }, 500);

/* ========== 3. OLD (v2) - 5 alag ON/OFF - bachaya hua ========== */
var DEFS = { showInSearch:"on", albumPublic:"on", msgPublic:"on", detailPublic:"on", friendsPublic:"on" };
var LABELS = [
  {k:"showInSearch", t:"🔍 Search me ID dikhe", d:"OFF = koi search me tumhe nahi dhoondh payega"},
  {k:"albumPublic",  t:"📸 Photos sabko dikhe", d:"OFF = sirf friend banne par dikhengi"},
  {k:"msgPublic",    t:"💬 Messages sabko dikhe", d:"OFF = sirf friend banne par dikhenge"},
  {k:"detailPublic", t:"📝 Detail/Thinking sabko dikhe", d:"OFF = sirf friend banne par dikhega"},
  {k:"friendsPublic",t:"👥 Friends list sabko dikhe", d:"OFF = sirf friend banne par dikhegi"}
];
function myPrivacy(){
  var out={},k; for(k in DEFS) out[k]=DEFS[k];
  try{ var s=JSON.parse(localStorage.getItem("my_privacy")||"null"); if(s) for(k in out){ if(s[k]==="on"||s[k]==="off") out[k]=s[k]; } }catch(e){}
  try{ var lp=JSON.parse(localStorage.getItem("customer_profile")||"{}"); if(lp.privacy) for(k in out){ if(lp.privacy[k]==="on"||lp.privacy[k]==="off") out[k]=lp.privacy[k]; } else if(lp.profilePublic==="off"){ for(k in out) out[k]="off"; } }catch(e){}
  return out;
}
function savePrivacy(p){
  try{ localStorage.setItem("my_privacy", JSON.stringify(p)); }catch(e){}
  try{ var lp=JSON.parse(localStorage.getItem("customer_profile")||"{}"); lp.privacy=p; lp.profilePublic=p.showInSearch; try{ localStorage.setItem("customer_profile", JSON.stringify(lp)); }catch(e){} }catch(e){}
  setTimeout(function(){ try{ if(window._fbDb){ var cid = getMyOwnUid() || "customer1"; window._fbDb.ref("customer_profiles/"+cid+"/privacy").set(p); window._fbDb.ref("customer_profiles/"+cid+"/profilePublic").set(p.showInSearch); } }catch(e){} },1000);
}
function effCid(){ try{ return getMyOwnUid() || localStorage.getItem("auth_uid") || "customer1"; }catch(e){ return "customer1"; } }
window.PRIV_bar = function(boxId, keys){
  try{
    var box = document.getElementById(boxId) || document.body;
    if(!box || document.getElementById("privBarBox")) return;
    var cur = myPrivacy();
    var div = document.createElement("div"); div.id = "privBarBox";
    div.style.cssText = "background:#f3e5f5;border:2px solid #7b1fa2;border-radius:12px;padding:10px;margin:8px 0;font-size:13px;";
    var h = '<b>🔒 Privacy — ON = sabko dikhega, OFF = sirf Friend ko</b><br>';
    LABELS.forEach(function(L){ var on = cur[L.k]==="on"; h += '<label style="display:flex;gap:8px;align-items:center;background:#fff;border-radius:8px;padding:8px;margin-top:6px;cursor:pointer;"><input type="checkbox" class="privBarCk" data-k="'+L.k+'"'+(on?" checked":"")+' style="width:20px;height:20px;">'+L.t+'</label>'; });
    h += '<button id="privBarSave" style="background:#7b1fa2;color:#fff;border:none;padding:10px 18px;border-radius:20px;font-weight:bold;margin-top:8px;cursor:pointer;">💾 Privacy Save Karo</button>';
    div.innerHTML = h; box.appendChild(div);
    document.getElementById("privBarSave").onclick = function(){
      var np={}; for(var k in DEFS) np[k]="on";
      var cks=document.querySelectorAll(".privBarCk"); for(var i=0;i<cks.length;i++) np[cks[i].getAttribute("data-k")] = cks[i].checked ? "on" : "off";
      savePrivacy(np); alert("✅ Privacy save ho gayi!");
    };
  }catch(e){}
};
window.PRIV_placeBtn = function(key, boxId){ try{ window.PRIV_bar(boxId,[key]); }catch(e){} };
window.PRIV_get = function(u){
  var out={},k; for(k in DEFS) out[k]=DEFS[k];
  try{ var p=(u&&u.privacy)||{}; for(k in out){ if(p[k]==="on"||p[k]==="off") out[k]=p[k]; } if(u && u.profilePublic==="off" && !u.privacy){ for(k in out) out[k]="off"; } }catch(e){}
  return out;
};
window.PRIV_isFriend = function(name){ try{ var mf=JSON.parse(localStorage.getItem("fr_myfriends")||"[]"); return mf.indexOf(name)!==-1; }catch(e){ return false; } };
window.PRIV_my = myPrivacy;
setTimeout(function(){
  var b=document.getElementById("custEditBtn");
  if(b){ b.addEventListener("click", function(){ setTimeout(function(){ if(document.getElementById("cePrivSec")) return; var nameInput=document.getElementById("ceName"); if(!nameInput||!nameInput.parentNode) return; var cur=myPrivacy(); var sec=document.createElement("div"); sec.id="cePrivSec"; sec.style.cssText="background:#f3e5f5;border:2px solid #7b1fa2;border-radius:12px;padding:12px;margin:6px 0 12px;"; var h='<b style="color:#7b1fa2;font-size:15px;">🔒 Privacy Settings</b>'+'<div style="font-size:12px;color:#666;margin:4px 0 10px;">Har cheez ka alag button — OFF wali cheez sirf <b>friend</b> banne par dikhegi</div>'; LABELS.forEach(function(L){ var on=cur[L.k]==="on"; h+='<label style="display:flex;align-items:center;gap:10px;background:#fff;border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer;">'+'<input type="checkbox" class="cePrivCk" data-k="'+L.k+'"'+(on?" checked":"")+' style="width:22px;height:22px;flex-shrink:0;">'+'<div><b style="font-size:14px;color:#333;">'+L.t+'</b>'+'<div style="font-size:12px;color:#888;">'+L.d+'</div></div></label>'; }); sec.innerHTML=h; nameInput.parentNode.insertBefore(sec, nameInput); },400); }); }
  var sv=document.getElementById("ceSave");
  if(sv){ sv.addEventListener("click", function(){ var p={},k; for(k in DEFS) p[k]="on"; var cks=document.querySelectorAll(".cePrivCk"); for(var i=0;i<cks.length;i++){ p[cks[i].getAttribute("data-k")]=cks[i].checked?"on":"off"; } savePrivacy(p); }); }
},1200);
console.log("🔒 privacy.js v5 loaded | MY:", getMyOwnUid(), "OWNER:", getPageOwnerUid(), "VISITOR:", isVisitorNow());
})();