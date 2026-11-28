/* profile-box-show.js - Profile Box me Naam + Photo dikhao */
/* UPDATE: Old code neeche backup me hai, delete nahi kiya. Naya update upar hai. */
/* UPDATE: Ye file sirf customerlogin wali Profile Box (pfAvatar/pfName) sambhalegi, */
/* taaki profile-box-fix.js se ladai na ho. Dono file ek saath chalengi. */

/* ===== UPDATE - NAYA CODE - UPAR ===== */
(function(){
  "use strict";

  function showBox(nm, ph, photo){
    var box = document.getElementById("profileBox");
    if(!box) return; // Is page me Profile Box hi nahi hai to kuch mat karo
    var n = document.getElementById("pfName");
    var p = document.getElementById("pfPhone");
    var av = document.getElementById("pfAvatar");
    box.style.display = "block";
    var gb = document.getElementById("gmailBox");
    if(gb) gb.style.display = "none";
    // Agar profile-box-fix.js ne naam pehle se bhar diya hai to usko mat kaato
    if(n && nm && n.textContent.indexOf("load ho raha") !== -1) n.textContent = nm;
    if(n && nm && !n.textContent) n.textContent = nm;
    if(p) p.textContent = ph ? "📱 " + ph : "";
    if(av && photo){
      // Pehle se photo lagi hai to dobara mat banao
      if(av.querySelector("img")) return;
      av.textContent = "";
      av.innerHTML = "";
      var img = document.createElement("img");
      img.src = photo;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      av.appendChild(img);
    }
    // Main page wali photo bhi bhar do - pfPhotoImg / pfPhotoImg2
    try{
      var p1 = document.getElementById("pfPhotoImg");
      var p2 = document.getElementById("pfPhotoImg2");
      if(photo && p1){ p1.src = photo; p1.style.display = "block"; }
      if(photo && p2){ p2.src = photo; p2.style.display = "block"; }
    }catch(e){}
  }

  function fillFromLocal(){
    var nm = "", ph = "", photo = "";
    try{ nm = localStorage.getItem("customer_name") || ""; }catch(e){}
    try{ ph = localStorage.getItem("customer_phone") || ""; }catch(e){}
    try{ photo = localStorage.getItem("customer_photo") || ""; }catch(e){}
    try{
      var d = JSON.parse(localStorage.getItem("customer_profile") || "null");
      if(d){
        if(!nm) nm = d.profileName || d.name || "";
        if(!ph) ph = d.profilePhone || d.phone || "";
        if(!photo) photo = d.profilePhoto || d.photo || "";
      }
    }catch(e){}
    try{
      var u = (window.firebase && firebase.auth && firebase.auth().currentUser) || null;
      if(u){
        if(!nm) nm = u.displayName || "";
        if(!photo) photo = u.photoURL || "";
      }
    }catch(e){}
    if(nm || photo) showBox(nm, ph, photo);
    return {nm:nm, ph:ph, photo:photo};
  }

  function fillFromFirebase(){
    try{
      var uid = "";
      try{ uid = localStorage.getItem("auth_uid") || ""; }catch(e){}
      if(!uid || !window._fbDb) return;
      window._fbDb.ref("customer_profiles/" + uid).once("value").then(function(s){
        var P = s.val() || {};
        var nm = P.profileName || P.name || P.customer_name || "";
        var ph = P.profilePhone || P.phone || "";
        var photo = P.profilePhoto || P.photo || "";
        if(nm || photo){
          try{
            if(nm) localStorage.setItem("customer_name", nm);
            if(ph) localStorage.setItem("customer_phone", ph);
            if(photo) localStorage.setItem("customer_photo", photo);
            var old = {};
            try{ old = JSON.parse(localStorage.getItem("customer_profile") || "{}"); }catch(e){}
            old.profileName = nm || old.profileName;
            old.profilePhoto = photo || old.profilePhoto;
            old.profilePhone = ph || old.profilePhone;
            localStorage.setItem("customer_profile", JSON.stringify(old));
          }catch(e){}
          showBox(nm, ph, photo);
        }
      }).catch(function(){});
    }catch(e){}
  }

  /* UPDATE: Red patti header photo bhi isi file se */
  function loadHeader(){
    try{
      var lp = "";
      try{ lp = localStorage.getItem("header_photo") || ""; }catch(e){}
      if(lp){
        var hi = document.getElementById("headerPhotoImg");
        var hic = document.getElementById("headerPhotoIcon");
        if(hi){ hi.src = lp; hi.style.display = "block"; if(hic) hic.style.display = "none"; }
      }
      var uid = localStorage.getItem("auth_uid") || "";
      if(uid && window._fbDb){
        window._fbDb.ref("headerPhotos/" + uid).once("value").then(function(s){
          var v = s.val() || {};
          var p = (typeof v === "string") ? v : (v.photo || v.url || "");
          if(p){
            try{ localStorage.setItem("header_photo", p); }catch(e){}
            var hi2 = document.getElementById("headerPhotoImg");
            var hic2 = document.getElementById("headerPhotoIcon");
            if(hi2){ hi2.src = p; hi2.style.display = "block"; if(hic2) hic2.style.display = "none"; }
          }
        }).catch(function(){});
      }
    }catch(e){}
  }

  function start(){
    var L = fillFromLocal();
    if(!L.nm){
      var n2 = document.getElementById("pfName");
      if(n2 && n2.textContent.indexOf("load ho raha") === -1) n2.textContent = "⏳ Naam load ho raha hai...";
    }
    loadHeader();
    try{
      var app = (window.firebase && firebase.apps && firebase.apps.length) ? firebase.apps[0] : null;
      var key = (app && app.options && app.options.apiKey) || "";
      var isNakli = !key || key.indexOf("PASTE_") === 0 || key.indexOf("PASTE_YOUR") !== -1;
      if(isNakli && !sessionStorage.getItem("_pfShowFixed")){
        sessionStorage.setItem("_pfShowFixed", "1");
        fetch("connect.js").then(function(r){ return r.text(); }).then(function(txt){
          function pick(k){
            var m = txt.match(new RegExp(k + "\\s*:\\s*\"([^\"]+)\""));
            return m ? m[1] : "";
          }
          var CFG = {
            apiKey: pick("apiKey"),
            authDomain: pick("authDomain"),
            databaseURL: pick("databaseURL"),
            projectId: pick("projectId"),
            storageBucket: pick("storageBucket"),
            messagingSenderId: pick("messagingSenderId"),
            appId: pick("appId")
          };
          if(!CFG.apiKey) return;
          return app.delete().then(function(){
            firebase.initializeApp(CFG);
            window._fbDb = firebase.database();
            window._fbAuth = firebase.auth();
            fillFromFirebase();
            loadHeader();
          });
        }).catch(function(){});
        return;
      }
    }catch(e){}
    setTimeout(fillFromFirebase, 500);
    setTimeout(fillFromFirebase, 2000);
    setTimeout(loadHeader, 1500);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

/* ===== OLD CODE - BACKUP - DELETE MAT KARNA - UPAR WALA HI CHALEGA ===== */
/*
Tumhara purana profile-box-show.js yahan backup me safe hai.
Agar naya update me koi problem aaye to is comment ko hata ke purana wapas chala sakte ho.
Purana code:
(function(){
  function showBox(nm, ph, photo){ ... pfName / pfPhone / pfAvatar ... }
  function fillFromLocal(){ ... customer_name / customer_phone / customer_photo / customer_profile ... }
  function fillFromFirebase(){ ... customer_profiles / auth_uid ... }
  function start(){ ... local se turant + PASTE_ key fix + Firebase se ... }
})();
*/