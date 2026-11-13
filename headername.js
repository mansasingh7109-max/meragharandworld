/* headername.js v3 - naam header + Public/Private button ka asli kaam */
/* OLD CODE + UPDATE - purana logic same hai, sirf update joda hai */
(function(){
  function qUid(){ try{ var m=location.search.match(/[?&](uid|cid)=([^&]+)/); return m?decodeURIComponent(m[2]):""; }catch(e){ return ""; } }
  function myUid(){ try{ return localStorage.getItem("auth_uid")||""; }catch(e){ return ""; } }
  function localName(){
    try{
      // UPDATE: UNIQUE + Gmail login - my_profile purana hai to usko ignore karo, par customer_login (Gmail wala) ko mat roko. Pehle galti: my_profile mismatch pe "" return kar deta tha, isliye naam khali rehta tha.
      var _uid=myUid();
      function _ok(obj){ if(!obj) return false; if(!obj._uid) return true; if(!_uid) return true; return obj._uid===_uid; }
      var n=localStorage.getItem("customer_name")||"";
      if(n) return n;
      var un=localStorage.getItem("customer_username")||"";
      if(un) return un;
      // 1. Gmail login wala - auth.js isme naam rakhta hai, customer_name me nahi
      try{ var lg=JSON.parse(localStorage.getItem("customer_login")||"null"); if(lg && _ok(lg) && (lg.name||lg.profileName)) return lg.name||lg.profileName; }catch(e){}
      // 2. customer_profile - sirf isi UID ka ho tabhi
      try{ var cp=JSON.parse(localStorage.getItem("customer_profile")||"{}"); if(_ok(cp) && (cp.profileName||cp.name||cp.customer_name)) return cp.profileName||cp.name||cp.customer_name; }catch(e){}
      // 3. my_profile - sirf isi UID ka ho tabhi
      try{ var mp=JSON.parse(localStorage.getItem("my_profile")||"{}"); if(_ok(mp) && (mp.profileName||mp.name||mp.customer_name)) return mp.profileName||mp.name||mp.customer_name; }catch(e){}
      // 4. auth_uid se naam - agar UID Naam_Mobile hai to Naam nikal lo
      if(_uid && _uid.indexOf("_")!==-1){ var _nm=_uid.split("_")[0]||""; if(_nm && !/^\d+$/.test(_nm)) return _nm; }
      return "";
    }catch(e){ return ""; }
  }

  // UPDATE: getDb - dobara initializeApp nahi karega, connect.js wala _fbDb hi lega
  function getDb(){
    try{
      if(typeof _fbDb!=="undefined" && _fbDb) return _fbDb;
      if(window._fbDb) return window._fbDb;
      // mydata.js ka helper ho to wahi use karo
      if(window.myDB) { var d = window.myDB(); if(d) return d; }
      if(typeof firebase!=="undefined" && firebase.apps && firebase.apps.length){
        return firebase.database();
      }
    }catch(e){}
    return null;
  }

  // ===== PUBLIC / PRIVATE - ye function pehle kahin tha hi nahi, isliye button press nahi hota tha =====
  window.setSectionPrivacy=function(section, mode){
    var uid=myUid();
    if(!uid){ alert("Pehle login karo!"); return; }
    section=section||"album"; mode=(mode==="private"?"private":"public");
    try{ localStorage.setItem("privacy_"+section, mode); }catch(e){}
    var db=getDb();
    if(db){
      // UPDATE: .set() se pura privacy ud jata tha, isliye ab .update() hai
      var upd={};
      upd["privacy_"+section]=mode;
      db.ref("customer_profiles/"+uid).update(upd);
      db.ref("customer_profiles/"+uid).once("value").then(function(s){
        var P=s.val()||{}; var pr=P.privacy||{}; pr[section]=mode; pr[section+"Public"]=(mode==="public"?"on":"off");
        // UPDATE: privacy object ko bhi update se save karo, set se nahi
        db.ref("customer_profiles/"+uid+"/privacy").update(pr);
      });
    }
    alert("✅ "+section+" ab "+(mode==="public"?"🌍 Public":"🔒 Private")+" hai");
    // button highlight
    try{
      document.querySelectorAll('#myPrivacyBar button, button').forEach(function(b){
        var t=(b.textContent||"").toLowerCase();
        if(t.indexOf("public")!==-1 || t.indexOf("private")!==-1) b.style.outline="none";
      });
      if(window.event && window.event.target) window.event.target.style.outline="3px solid #000";
    }catch(e){}
  };

  // ===== HEADER NAAM - renderOwn() baad me overwrite karta hai, isliye baar-baar lagao =====
  // UPDATE: isFriend alag se bhejte hain, taaki "Mera Profile" / "Uska Profile" mix na ho
  function apply(nm, isFriend){
    if(!nm) return;
    var ttl=document.getElementById('ttl');
    if(ttl){
      var old=ttl.textContent||"";
      var nw="";
      if(old.indexOf("Profile Edit")!==-1 || document.title.indexOf("Edit")!==-1) nw="✏️ "+nm+" ka Profile Edit Karo";
      else if(document.title.toLowerCase().indexOf("album")!==-1 || old.indexOf("Album")!==-1) nw="📸 "+nm+" ka Album";
      else if(document.title.toLowerCase().indexOf("timeline")!==-1 || old.indexOf("Timeline")!==-1) nw="📅 "+nm+" ki Timeline";
      if(nw && old!==nw) ttl.textContent=nw;
    }
    var brand=document.getElementById('brand');
    if(brand){
      var b=brand.textContent||"";
      if(b.indexOf("Mera Profile Edit")!==-1 || document.title.indexOf("Edit")!==-1) brand.textContent="✏️ "+nm+" ka Profile Edit Karo";
      // UPDATE: apna ho to "Mera Profile - Naam", dost ka ho to "Naam ka Profile"
      else if(b.indexOf("Mera Profile")!==-1 || b.indexOf("ka Profile")!==-1) brand.textContent = isFriend ? "👤 "+nm+" ka Profile" : "👤 Mera Profile - "+nm;
      else if(b.indexOf("Mere Dost")!==-1 || b.indexOf("ke Dost")!==-1) brand.textContent="👥 "+nm+" ke Dost";
    }
    // Album ke andar "Mera Album:" wala label
    try{
      var bar=document.getElementById('myPrivacyBar');
      if(bar){ var bb=bar.querySelector('b'); if(bb) bb.textContent="📸 "+nm+" ka Album:"; }
    }catch(e){}
  }

  function run(){
    var my=myUid(), view=qUid()||my; if(!view) return;
    var isFriend = !!(view && my && view!==my);
    var ln=localName();
    // UPDATE: apne page pe hi local naam lagao, dost ke page pe local naam mat lagao
    if(ln && !isFriend) apply(ln, false);
    var db=getDb();
    if(db){
      db.ref("customer_profiles/"+view).once("value").then(function(s){
        var P=s.val()||{}; var nm=P.profileName||P.name||P.customer_name||ln;
        if(nm) apply(nm, isFriend);
        // renderOwn() ne overwrite kiya ho to 3 second tak har 600ms me dobara lagao
        var n=0; var iv=setInterval(function(){ apply(nm, isFriend); n++; if(n>5) clearInterval(iv); }, 600);
      });
    }
  }

  // UPDATE: editprofile save ke baad turant header refresh ke liye
  window.refreshHeaderName=function(){ run(); };

  if(document.readyState==="loading") document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 1200);
})();