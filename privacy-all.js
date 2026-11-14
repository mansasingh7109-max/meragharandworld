// privacy-all.js - Profile + Album + Timeline + Friend List + Detail + Thinking - sabka Privacy
// 1 line se sab files me judta hai

function PA_getDb(){
  try{
    if(typeof _fbDb !== "undefined" && _fbDb) return _fbDb;
    if(window._fbDb) return window._fbDb;
    if(typeof firebase !== "undefined" && firebase.apps && firebase.apps.length) return firebase.database();
  }catch(e){}
  return null;
}
function PA_myUid(){ try{ return localStorage.getItem("auth_uid") || ""; }catch(e){ return ""; } }

// Sab sections ke naam - yahi keys Firebase me save hongi
// profile, photo, album, timeline, detail, thinking, friends, phone, email, city, job, status
function PA_isPublic(priv, key){
  if(!priv) return true;
  if(priv[key] === "private") return false;
  if(priv[key] === "public") return true;
  if(priv[key + "Public"] === "off") return false;
  return true;
}

function savePrivacy(key, val){
  var uid = PA_myUid();
  var db = PA_getDb();
  if(!uid){ alert("Pehle login karo!"); return; }
  if(!db){ alert("Firebase nahi laga!"); return; }
  var up = {};
  up["privacy/" + key] = val;
  db.ref("customer_profiles/" + uid).update(up, function(err){
    if(err){ alert("❌ Save nahi hua: " + err.message); return; }
    // Usi section ke buttons ka colour badal do
    document.querySelectorAll('[data-privacy-key="'+key+'"]').forEach(function(b){
      var v = b.getAttribute("data-privacy-val");
      if(v === val){ b.style.background = "#25D366"; b.style.color = "#fff"; b.style.border = "1px solid #25D366"; }
      else{ b.style.background = "#fff"; b.style.color = "#333"; b.style.border = "1px solid #ccc"; }
    });
    alert("✅ " + key + " ab " + val + " ho gaya");
  });
}

function PA_bindPrivacyButtons(){
  document.querySelectorAll("[data-privacy-key]").forEach(function(btn){
    if(btn.getAttribute("data-pa-bound")) return;
    btn.setAttribute("data-pa-bound","1");
    btn.addEventListener("click", function(e){
      e.stopPropagation();
      var k = btn.getAttribute("data-privacy-key");
      var v = btn.getAttribute("data-privacy-val");
      savePrivacy(k, v);
    });
  });
}

// ===== ALBUM - sab jagah ek jaisa photo =====
function PA_getPhoto(P){ if(!P) return ""; return P.profilePhoto || P.photo || P.profilePic || P.photoUrl || ""; }
function PA_getAllPhotos(P){
  if(!P) return [];
  var arr = [];
  var main = PA_getPhoto(P);
  if(main) arr.push(main);
  var olds = P.oldPhotos || P.extraPhotos || P.album || [];
  if(Array.isArray(olds)){
    olds.forEach(function(ph){
      if(typeof ph === "string" && ph && arr.indexOf(ph) === -1) arr.push(ph);
    });
  }
  return arr;
}
function PA_loadAlbum(fuid, cb){
  var db = PA_getDb();
  if(!db || !fuid){ cb([]); return; }
  db.ref("customer_profiles/" + fuid).once("value").then(function(s){
    var P = s.val() || {};
    var photos = PA_getAllPhotos(P);
    // Album Private hai to khali bhejo
    if(!PA_isPublic(P.privacy || {}, "album") && !PA_isPublic(P.privacy || {}, "photo")){
      // Agar album private hai to sirf lock dikhayenge, photo nahi
      if(P.privacy && (P.privacy.album === "private")){ cb([]); return; }
    }
    if(photos.length){ cb(photos); return; }
    return db.ref("customer_albums/" + fuid).once("value").then(function(as){
      var av = as.val() || {};
      var arr2 = [];
      Object.keys(av).forEach(function(k){
        var x = av[k];
        if(typeof x === "string") arr2.push(x);
        else if(x && (x.url || x.photo)) arr2.push(x.url || x.photo);
      });
      cb(arr2);
    });
  }).catch(function(){ cb([]); });
}

document.addEventListener("DOMContentLoaded", function(){ PA_bindPrivacyButtons(); });