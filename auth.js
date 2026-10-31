// =====================================================
// AUTH.JS v4.1 - Gmail Login + Poora Signup Form
// Fields: Naam, Username, Mobile, DOB (Din/Mahina/Saal),
//         City, State, Gmail, Password (eye)
// Smart error + Pakka Logout
// 100% FREE forever
// =====================================================
(function(){
"use strict";

/* ---------- 1. UID nikalo ---------- */
var AUTH_UID = null, AUTH_EMAIL = null;
try{
  AUTH_UID = localStorage.getItem("auth_uid") || null;
  AUTH_EMAIL = localStorage.getItem("auth_email") || null;
}catch(e){}
window.AUTH_UID = AUTH_UID;
window.AUTH_EMAIL = AUTH_EMAIL;
if(AUTH_UID){ try{ localStorage.setItem("customer_logged_in","1"); }catch(e){} }

/* ---------- 2. Auth LAZY init + smart problem check ---------- */
var _auth = null, _authListenerOn = false;
function getAuth(){
  if(_auth) return _auth;
  try{
    if(window.firebase && firebase.auth){
      _auth = firebase.auth();
      window._fbAuth = _auth;
      if(!_authListenerOn){
        _authListenerOn = true;
        _auth.onAuthStateChanged(function(user){
          if(user){
            try{
              localStorage.setItem("auth_uid", user.uid);
              localStorage.setItem("auth_email", user.email || "");
              localStorage.setItem("customer_logged_in","1");
            }catch(e){}
            window.AUTH_UID = user.uid;
            window.AUTH_EMAIL = user.email || "";
          }
        });
      }
      return _auth;
    }
  }catch(e){}
  return null;
}
function authProblem(){
  if(!window.firebase) return "page-load";
  if(!firebase.auth) return "auth-file";
  if(!firebase.apps || firebase.apps.length === 0) return "keys";
  return null;
}
function needAuth(){
  var a = getAuth();
  if(a) return a;
  var pr = authProblem();
  if(pr === "auth-file") authErr("⚠️ Login wali file load nahi hui! index.html me firebase-auth-compat.js wali line check karo");
  else if(pr === "keys") authErr("⚠️ Server keys missing hain! FIREBASE_CONFIG me asli keys bharo");
  else authErr("Server se jud nahi paya! Page refresh karke dobara try karo 🔄");
  return null;
}
setTimeout(function(){ getAuth(); }, 2000);
setTimeout(function(){ getAuth(); }, 5000);

/* ---------- 3. Purana data naye UID par copy ---------- */
function migrateToUid(uid){
  try{
    if(!window._fbDb) return;
    var db = window._fbDb;
    db.ref("customer_profiles/" + uid).once("value", function(snap){
      if(snap.exists()) return;
      var d = null;
      try{ d = JSON.parse(localStorage.getItem("customer_profile") || "null"); }catch(e){}
      var nd = d || {};
      nd.profileEmail = AUTH_EMAIL || "";
      try{ db.ref("customer_profiles/" + uid).set(nd); }catch(e){}
    });
  }catch(e){}
}

/* ---------- 4. Helpers ---------- */
var INP = "width:100%;padding:12px;border:1px solid #ddd;border-radius:10px;margin-bottom:10px;font-size:15px;box-sizing:border-box;";
function authErr(m){
  var b = document.getElementById("authErr");
  if(b) b.textContent = m;
}
function g(id){ var el = document.getElementById(id); return el ? el.value.trim() : ""; }
function fbErr(e){
  var m = "Kuch problem hui, dobara try karo!";
  if(e.code==="auth/email-already-in-use") m = "Ye Gmail pehle se hai! Login karo.";
  else if(e.code==="auth/invalid-credential"||e.code==="auth/wrong-password") m = "Gmail ya password galat!";
  else if(e.code==="auth/user-not-found") m = "Account nahi mila! Naya Account Banao.";
  else if(e.code==="auth/weak-password") m = "Password 6+ akshar ka rakho!";
  else if(e.code==="auth/invalid-email") m = "Sahi Gmail likho!";
  else if(e.code==="auth/operation-not-allowed") m = "Abhi thodi problem hai, baad me try karo 🙏";
  else if(e.code==="auth/network-request-failed") m = "Internet check karo, phir try karo 📶";
  return m;
}

/* ---------- 5. LOGIN ---------- */
function doLogin(){
  var a = needAuth(); if(!a) return;
  var em = g("authEmail"), pw = g("authPass");
  if(!em || em.indexOf("@") < 0){ authErr("Sahi Gmail likho!"); return; }
  if(!pw){ authErr("Password likho!"); return; }
  authErr("Ruko... ⏳");
  a.signInWithEmailAndPassword(em, pw).then(function(cred){
    var uid = cred.user.uid;
    try{
      localStorage.setItem("auth_uid", uid);
      localStorage.setItem("auth_email", em);
      localStorage.setItem("customer_logged_in", "1");
    }catch(e){}
    window.AUTH_UID = uid; window.AUTH_EMAIL = em;
    migrateToUid(uid);
    alert("Welcome wapas! ✅");
    setTimeout(function(){ location.reload(); }, 800);
  }).catch(function(e){ authErr(fbErr(e)); });
}
window.authLogin = function(){ doLogin(); };

/* ---------- 6. SIGNUP ---------- */
window.doSignup = function(){
  var a = needAuth(); if(!a) return;
  var nm = g("suName"), un = g("suUsername"), mo = g("suMobile"),
      dy = g("suDay"), mh = g("suMonth"), yy = g("suYear"),
      city = g("suCity"), state = g("suState"),
      em = g("suEmail"), pw = g("suPass");
  var dob = (dy && mh && yy) ? (dy + "/" + mh + "/" + yy) : "";
  if(!nm){ authErr("Apna Naam likho! *"); return; }
  if(!mo || !/^[0-9]{10}$/.test(mo)){ authErr("10 ank ka sahi Mobile Number likho! *"); return; }
  if(!em || em.indexOf("@") < 0){ authErr("Sahi Gmail likho! *"); return; }
  if(!pw || pw.length < 6){ authErr("Password 6+ akshar ka rakho! *"); return; }
  authErr("Account ban raha hai... ⏳");
  a.createUserWithEmailAndPassword(em, pw).then(function(cred){
    var uid = cred.user.uid;
    var profile = {
      profileName: nm,
      username: un,
      profilePhone: mo,
      dob: dob,
      city: city,
      state: state,
      profileEmail: em,
      loginType: "gmail",
      createdAt: new Date().toISOString()
    };
    try{
      localStorage.setItem("auth_uid", uid);
      localStorage.setItem("auth_email", em);
      localStorage.setItem("customer_logged_in", "1");
      localStorage.setItem("customer_login", JSON.stringify({name: nm, phone: mo}));
      localStorage.setItem("customer_profile", JSON.stringify(profile));
    }catch(e){}
    window.AUTH_UID = uid; window.AUTH_EMAIL = em;
    try{ if(window._fbDb) window._fbDb.ref("customer_profiles/" + uid).set(profile); }catch(e){}
    alert("Welcome, " + nm + "! ✅ Account ban gaya!");
    setTimeout(function(){ location.reload(); }, 800);
  }).catch(function(e){ authErr(fbErr(e)); });
};

/* ---------- 7. Eye buttons + Reset ---------- */
window.togglePass = function(){
  var p = document.getElementById("authPass");
  var b = document.getElementById("passEye");
  if(!p) return;
  if(p.type === "password"){ p.type = "text"; if(b) b.textContent = "🙈"; }
  else { p.type = "password"; if(b) b.textContent = "👁️"; }
};
window.toggleSuPass = function(){
  var p = document.getElementById("suPass");
  var b = document.getElementById("suPassEye");
  if(!p) return;
  if(p.type === "password"){ p.type = "text"; if(b) b.textContent = "🙈"; }
  else { p.type = "password"; if(b) b.textContent = "👁️"; }
};
window.authReset = function(){
  var a = needAuth(); if(!a) return;
  var em = g("authEmail");
  if(!em || em.indexOf("@") < 0){ authErr("Pehle upar apna Gmail likho, phir ye dabao!"); return; }
  if(!confirm(em + " par password reset link bhejein?")) return;
  authErr("Link bhej rahe hain... ⏳");
  a.sendPasswordResetEmail(em).then(function(){
    authErr("");
    alert("✅ Reset link bhej diya! Apna Gmail kholo aur link par click karke naya password rakho.");
  }).catch(function(e){ authErr(fbErr(e)); });
};

/* ---------- 8. Logout (signOut ka wait karta hai) ---------- */
window.authLogout = function(){
  if(!confirm("Logout karein?")) return;
  var done = function(){
    try{
      localStorage.removeItem("auth_uid");
      localStorage.removeItem("auth_email");
      localStorage.removeItem("customer_logged_in");
    }catch(e){}
    alert("Logout ho gaya! 👋");
    location.reload();
  };
  try{
    var a = getAuth();
    if(a){ a.signOut().then(done).catch(done); }
    else done();
  }catch(e){ done(); }
};

/* ---------- 8b. PAKKA Logout - koi button miss nahi hoga ---------- */
function patchLogoutFns(){
  ["logoutNow","pfDoLogout","doLogout","logout"].forEach(function(n){
    if(window[n] && window[n] !== window.authLogout){
      try{ window[n] = window.authLogout; }catch(e){}
    }
  });
}
setTimeout(patchLogoutFns, 1500);
setTimeout(patchLogoutFns, 3000);
setTimeout(patchLogoutFns, 6000);

/* Koi bhi Logout button dabe - seedha authLogout chalega */
document.addEventListener("click", function(ev){
  var el = ev.target;
  if(!el || !el.closest) return;
  var btn = el.closest("#pfLogoutBtn,.pfLogoutBtn,#logoutBtn,.logoutBtn,[data-logout]");
  if(!btn){
    var b = el.closest("button");
    if(b){
      var t = (b.textContent || "").replace(/[^a-z]/gi,"").toLowerCase();
      if(t === "logout") btn = b;
    }
  }
  if(btn){
    ev.preventDefault();
    if(ev.stopImmediatePropagation) ev.stopImmediatePropagation();
    ev.stopPropagation();
    window.authLogout();
  }
}, true);

/* ---------- 9. Form views ---------- */
window._authView = "login";
window.showSignup = function(){ window._authView = "signup"; renderAuthForm(); window.scrollTo(0,0); };
window.showLogin = function(){ window._authView = "login"; renderAuthForm(); window.scrollTo(0,0); };
window.authSignup = function(){ window.showSignup(); };

function loginFormHtml(){
  return '<div style="font-size:40px;">📧</div>'
  +'<b style="font-size:20px;color:#333;">Gmail Login</b>'
  +'<div style="font-size:13px;color:#888;margin:8px 0 16px;">Apne Gmail se login karo<br>Data hamesha safe rahega ✅</div>'
  +'<input id="authEmail" type="email" placeholder="Gmail address *" style="'+INP+'">'
  +'<div style="position:relative;margin-bottom:10px;">'
  +'<input id="authPass" type="password" placeholder="Password *" style="width:100%;padding:12px 44px 12px 12px;border:1px solid #ddd;border-radius:10px;font-size:15px;box-sizing:border-box;">'
  +'<button type="button" id="passEye" onclick="togglePass()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:20px;cursor:pointer;padding:4px;">👁️</button>'
  +'</div>'
  +'<div id="authErr" style="color:#d32f2f;font-size:13px;margin-bottom:8px;min-height:18px;"></div>'
  +'<div style="text-align:right;margin:-2px 0 10px;"><a href="javascript:void(0)" onclick="authReset()" style="font-size:13px;color:#e65100;font-weight:bold;">🔑 Password bhool gaye?</a></div>'
  +'<button onclick="authLogin()" style="background:#25D366;color:#fff;border:none;padding:14px;width:100%;border-radius:30px;font-weight:bold;font-size:16px;cursor:pointer;">🔓 Login</button>'
  +'<button onclick="showSignup()" style="background:#fff;color:#e65100;border:2px solid #e65100;padding:12px;width:100%;border-radius:30px;font-weight:bold;font-size:15px;cursor:pointer;margin-top:10px;">📝 Naya Account Banao</button>'
  +'<div style="font-size:11px;color:#aaa;margin-top:10px;">  • Password sirf tumhe pata hoga</div>';
}

function dobHtml(){
  var d = '<div style="text-align:left;font-size:12px;color:#888;margin:0 0 4px 2px;">🎂 Date of Birth</div>';
  d += '<div style="display:flex;gap:8px;margin-bottom:10px;">';
  d += '<select id="suDay" style="flex:1;padding:12px;border:1px solid #ddd;border-radius:10px;font-size:15px;background:#fff;"><option value="">Din</option>';
  for(var i=1;i<=31;i++){ d += '<option value="'+i+'">'+i+'</option>'; }
  d += '</select>';
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  d += '<select id="suMonth" style="flex:1.2;padding:12px;border:1px solid #ddd;border-radius:10px;font-size:15px;background:#fff;"><option value="">Mahina</option>';
  for(var m=0;m<12;m++){ d += '<option value="'+(m+1)+'">'+months[m]+'</option>'; }
  d += '</select>';
  d += '<select id="suYear" style="flex:1.3;padding:12px;border:1px solid #ddd;border-radius:10px;font-size:15px;background:#fff;"><option value="">Saal</option>';
  var y = new Date().getFullYear();
  for(var yr=y;yr>=1950;yr--){ d += '<option value="'+yr+'">'+yr+'</option>'; }
  d += '</select></div>';
  return d;
}

function signupFormHtml(){
  return '<div style="font-size:40px;">📝</div>'
  +'<b style="font-size:20px;color:#333;">Naya Account Banao</b>'
  +'<div style="font-size:13px;color:#888;margin:8px 0 16px;">Apni detail bharo<br>Data hamesha safe rahega ✅</div>'
  +'<input id="suName" placeholder="Naam * (jaise: Manisha)" style="'+INP+'">'
  +'<input id="suUsername" placeholder="Username (jaise: manisha07)" style="'+INP+'">'
  +'<input id="suMobile" type="tel" maxlength="10" placeholder="Mobile Number * (10 ank)" style="'+INP+'">'
  +dobHtml()
  +'<input id="suCity" placeholder="City (jaise: Jodhpur)" style="'+INP+'">'
  +'<input id="suState" placeholder="State (jaise: Rajasthan)" style="'+INP+'">'
  +'<input id="suEmail" type="email" placeholder="Gmail address *" style="'+INP+'">'
  +'<div style="position:relative;margin-bottom:10px;">'
  +'<input id="suPass" type="password" placeholder="Password * (6+ akshar, apne man ka)" style="width:100%;padding:12px 44px 12px 12px;border:1px solid #ddd;border-radius:10px;font-size:15px;box-sizing:border-box;">'
  +'<button type="button" id="suPassEye" onclick="toggleSuPass()" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;font-size:20px;cursor:pointer;padding:4px;">👁️</button>'
  +'</div>'
  +'<div id="authErr" style="color:#d32f2f;font-size:13px;margin-bottom:8px;min-height:18px;"></div>'
  +'<button onclick="doSignup()" style="background:#e65100;color:#fff;border:none;padding:14px;width:100%;border-radius:30px;font-weight:bold;font-size:16px;cursor:pointer;">✅ Account Banao</button>'
  +'<div style="margin-top:10px;"><a href="javascript:void(0)" onclick="showLogin()" style="font-size:13px;color:#666;">← Wapas Login par jao</a></div>'
  +'<div style="font-size:11px;color:#aaa;margin-top:8px;">100% Free • Gmail ka asli password yahan mat likho</div>';
}

function renderAuthForm(){
  var card = document.getElementById("authCardInner");
  if(!card) return;
  card.innerHTML = (window._authView === "signup") ? signupFormHtml() : loginFormHtml();
}

function buildAuthUI(){
  var old = document.getElementById("loginBtn");
  if(!old) return false;
  var host = old.closest("div");
  var box = document.getElementById("profile");
  if(box && box.contains(old)) host = box;
  var ph = document.getElementById("profileHead");
  if(ph && ph.contains(old)) host = ph;
  var pt = document.getElementById("profileTop");
  if(pt && pt.contains(old)) host = pt;
  host.innerHTML =
   '<div style="display:flex;justify-content:center;padding:12px 20px;">'
  +'<div id="authCardInner" style="background:#fff;padding:24px;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,.1);text-align:center;width:340px;max-width:95%;">'
  +'</div></div>';
  renderAuthForm();
  return true;
}
var _t = 0;
var _iv = setInterval(function(){
  _t++;
  try{ if(buildAuthUI()) clearInterval(_iv); }catch(e){}
  if(_t > 40) clearInterval(_iv);
}, 300);

console.log("auth.js v4.1 loaded | UID=" + (AUTH_UID || "none"));
})();