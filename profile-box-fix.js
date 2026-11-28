/* ===== profile-box-fix.js - FINAL SAHI WALA - sab andar ===== */
(function(){
  function myUid(){
    try{ return localStorage.getItem("auth_uid") || localStorage.getItem("MY_OWN_UID") || ""; }catch(e){ return ""; }
  }
  function myNameLocal(){
    try{
      var c = JSON.parse(localStorage.getItem("customer_profile")||"{}");
      if(c.profileName || c.name) return c.profileName || c.name;
      var m = JSON.parse(localStorage.getItem("my_profile")||"{}");
      if(m.profileName || m.name) return m.profileName || m.name;
      // Acode me kabhi naam alag key me hota hai, wahan se bhi dhoondo
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        try{
          var v = JSON.parse(localStorage.getItem(k)||"{}");
          if(v && (v.profileName || v.name) && k.indexOf("profile")!==-1) return v.profileName || v.name;
        }catch(e){}
      }
      return "";
    }catch(e){ return ""; }
  }
  function myPhotoLocal(){
    try{
      var c = JSON.parse(localStorage.getItem("customer_profile")||"{}");
      var m = JSON.parse(localStorage.getItem("my_profile")||"{}");
      return c.profilePhoto || m.photo || c.photo || "";
    }catch(e){ return ""; }
  }

  /* 1. NAAM + PHOTO */
  function fillNamePhoto(){
    var n = document.getElementById("pfName");
    var p1 = document.getElementById("pfPhotoImg");
    var p2 = document.getElementById("pfPhotoImg2");
    var ph = document.getElementById("pfPhone");
    var nm = myNameLocal();
    var pt = myPhotoLocal();
    if(n && nm) n.textContent = nm;
    if(pt){
      if(p1){ p1.src = pt; p1.style.display = "block"; }
      if(p2){ p2.src = pt; p2.style.display = "block"; }
    }
    try{
      var c = JSON.parse(localStorage.getItem("customer_profile")||"{}");
      var phone = c.profilePhone || c.phone || localStorage.getItem("customer_phone") || "";
      if(ph && phone) ph.textContent = "📞 " + phone;
    }catch(e){}
    var uid = myUid();
    if(!uid || !window._fbDb) return;
    window._fbDb.ref("customer_profiles/"+uid).once("value").then(function(s){
      var d = s.val()||{};
      var n2 = d.profileName || d.name || "";
      var pt2 = d.profilePhoto || d.photo || "";
      if(n && n2) n.textContent = n2;
      if(pt2){
        if(p1){ p1.src = pt2; p1.style.display = "block"; }
        if(p2){ p2.src = pt2; p2.style.display = "block"; }
      }
      try{
        var old = JSON.parse(localStorage.getItem("customer_profile")||"{}");
        if(n2) old.profileName = n2;
        if(pt2) old.profilePhoto = pt2;
        localStorage.setItem("customer_profile", JSON.stringify(old));
      }catch(e){}
    });
    try{
      window._fbDb.ref("customer_profiles/"+uid).off("value", window._pfFollow);
      window._pfFollow = function(s){
        var d = s.val()||{};
        var n2 = d.profileName || d.name || "";
        var pt2 = d.profilePhoto || d.photo || "";
        if(n && n2) n.textContent = n2;
        if(pt2){
          if(p1){ p1.src = pt2; p1.style.display = "block"; }
          if(p2){ p2.src = pt2; p2.style.display = "block"; }
        }
      };
      window._fbDb.ref("customer_profiles/"+uid).on("value", window._pfFollow);
    }catch(e){}
  }

  /* 2. LIST */
  window.pfLoadFriends = function(){
    var box = document.getElementById("pfFriendList");
    if(!box) return;
    box.style.display = "block";
    box.style.background = "#ffffff";
    box.style.border = "1px solid #ffd6d6";
    box.style.borderRadius = "14px";
    box.style.padding = "8px";
    box.style.marginTop = "10px";
    box.style.boxShadow = "0 2px 10px rgba(0,0,0,0.06)";
    var uid = myUid();
    if(!window._fbDb){ box.innerHTML = '<div style="text-align:center;color:#999;padding:10px">⏳ Dost load ho rahe hain...</div>'; return; }
    window._fbDb.ref("customer_profiles").once("value").then(function(s){
      var all = s.val()||{};
      return window._fbDb.ref("friends/"+uid).once("value").then(function(snap){
        var ids = Object.keys(snap.val()||{});
        var list = [];
        ids.forEach(function(id){
          if(id===uid) return;
          var P = all[id]||{};
          var nm = P.profileName || P.name || "";
          if(nm) list.push({id:id, name:nm, photo:P.profilePhoto||P.photo||""});
        });
        if(!list.length){
          Object.keys(all).forEach(function(id){
            if(id===uid) return;
            var P2 = all[id]||{};
            var nm2 = P2.profileName || P2.name || "";
            if(nm2) list.push({id:id, name:nm2, photo:P2.profilePhoto||P2.photo||""});
          });
        }
        if(!list.length){ box.innerHTML = '<div style="text-align:center;color:#999;padding:10px">Abhi koi dost nahi hai</div>'; return; }
        var seen = {}, h = "";
        list.forEach(function(o){
          if(seen[o.name.toLowerCase()]) return;
          seen[o.name.toLowerCase()] = 1;
          var pic = (o.photo && (o.photo.indexOf("http")===0 || o.photo.indexOf("data:")===0)) ? '<img src="'+o.photo+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">' : '<span style="font-size:22px;">👤</span>';
          h += '<label style="display:flex;align-items:center;gap:10px;padding:8px;border-bottom:1px solid #f0dede;cursor:pointer;background:#fff;border-radius:10px;margin-bottom:6px;"><input type="checkbox" class="pfFrChk" value="'+o.id+'" data-name="'+o.name+'" style="width:18px;height:18px;">'+pic+'<b style="flex:1;font-size:14px;">'+o.name+'</b></label>';
        });
        box.innerHTML = h;
      });
    });
  };

  /* 3. ALL FRIENDS */
  window.pfSelectAll = function(){
    var box = document.getElementById("pfFriendList");
    if(box) box.style.display = "block";
    window.pfLoadFriends();
    setTimeout(function(){ document.querySelectorAll("#pfFriendList .pfFrChk").forEach(function(c){ c.checked = true; }); }, 600);
    setTimeout(function(){ document.querySelectorAll("#pfFriendList .pfFrChk").forEach(function(c){ c.checked = true; }); }, 1500);
  };
  window.openFrPopup = window.pfSelectAll;

  /* 4. CLEAR */
  window.pfClearAll = function(){
    document.querySelectorAll("#pfFriendList .pfFrChk").forEach(function(c){ c.checked = false; });
  };

  /* 5. INBOX ME BHEJO */
  window.pfSendMsg = function(){
    var t = document.getElementById("pfMsgText2");
    var txt = t ? (t.value||"") : "";
    if(!txt.trim()){ alert("Pehle message likho!"); return; }
    var sel = [];
    document.querySelectorAll("#pfFriendList .pfFrChk:checked").forEach(function(c){ sel.push({id:c.value, name:c.getAttribute("data-name")||c.value}); });
    if(!sel.length){ alert("Pehle All Friends dabao!"); return; }
    var uid = myUid();
    if(!uid || !window._fbDb){ alert("Login / Firebase nahi mila!"); return; }
    var myName = myNameLocal() || "Me";
    var ts = Date.now();
    sel.forEach(function(o, i){
      var id = "m_"+ts+"_"+i+"_"+Math.floor(Math.random()*1000);
      var msg = {id:id, me:true, type:"text", text:txt, time:new Date(ts).toLocaleString(), ts:ts, fromUid:uid, fromName:myName, toUid:o.id, toName:o.name};
      window._fbDb.ref("chats/"+uid+"/"+o.id+"/"+id).set(msg);
      window._fbDb.ref("chats/"+o.id+"/"+uid+"/"+id).set(msg);
    });
    alert("✅ "+sel.length+" dost ko bhej diya!");
    if(t) t.value = "";
  };

  /* 6. PHOTO UPLOAD */
  window.pfUploadPhoto = function(input){
    var f = input.files[0]; if(!f) return;
    var r = new FileReader();
    r.onload = function(e){
      var photo = e.target.result;
      var p1 = document.getElementById("pfPhotoImg");
      var p2 = document.getElementById("pfPhotoImg2");
      if(p1){ p1.src = photo; p1.style.display = "block"; }
      if(p2){ p2.src = photo; p2.style.display = "block"; }
      try{
        var c = JSON.parse(localStorage.getItem("customer_profile")||"{}");
        c.profilePhoto = photo; localStorage.setItem("customer_profile", JSON.stringify(c));
        var m = JSON.parse(localStorage.getItem("my_profile")||"{}");
        m.photo = photo; localStorage.setItem("my_profile", JSON.stringify(m));
      }catch(e){}
      var uid = myUid();
      if(uid && window._fbDb) window._fbDb.ref("customer_profiles/"+uid).update({profilePhoto:photo});
      fixIconChipak();
      alert("Photo badal gayi! ✅");
    };
    r.readAsDataURL(f);
  };

  /* 7. BUTTONS */
  function bindBtns(){
    document.querySelectorAll("button").forEach(function(b){
      var txt = (b.textContent||"").trim();
      if(txt.indexOf("All Friends")!==-1 && txt.indexOf("Clear")===-1){ b.onclick = function(e){ if(e) e.preventDefault(); window.pfSelectAll(); }; }
      if(txt.indexOf("Clear")!==-1){ b.onclick = function(e){ if(e) e.preventDefault(); window.pfClearAll(); }; }
      if(txt.indexOf("Inbox Me Bhejo")!==-1){ b.onclick = function(e){ if(e) e.preventDefault(); window.pfSendMsg(); }; }
    });
  }

  /* 8. ICON CHIPKA - AB ANDAR HAI, BAHAR NAHI */
  function fixIconChipak(){
    // Right side wali duplicate kati hui photo hatao, sirf Manisha wali rakho
    var dupBox = document.getElementById("pfPhotoBox");
    var mainBox = document.getElementById("pfPhotoBox2");
    if(dupBox && mainBox){
      dupBox.style.display = "none";
    }
    var box = mainBox || dupBox;
    if(!box) return;
    box.style.display = "flex";
    box.style.position = "relative";
    box.style.overflow = "visible";
    var img = box.querySelector("img");
    if(img && img.src && img.src.length > 10){
      img.style.display = "block";
      img.style.position = "relative";
      img.style.zIndex = "2";
      img.style.objectFit = "cover";
      // Photo aa gayi to 👩 placeholder hatao
      box.querySelectorAll("span, div, i, label").forEach(function(el){
        if(el.querySelector("img")) return;
        var t = (el.textContent||"").trim();
        if(t === "👩" || t === "🧑" || t === "👤" || t.indexOf("👩") !== -1){
          el.style.display = "none";
        }
        if(t === "📸" || t.indexOf("📸") !== -1){
          el.style.position = "absolute";
          el.style.right = "-2px";
          el.style.bottom = "-2px";
          el.style.top = "auto";
          el.style.left = "auto";
          el.style.width = "22px";
          el.style.height = "22px";
          el.style.fontSize = "12px";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.background = "#fff";
          el.style.borderRadius = "50%";
          el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
          el.style.zIndex = "5";
        }
      });
    }
  }

  // START - page banne ke baad chalao, pehle nahi
  function start(){
    fillNamePhoto();
    window.pfLoadFriends();
    bindBtns();
    fixIconChipak();
    setTimeout(fillNamePhoto, 1200);
    setTimeout(function(){ window.pfLoadFriends(); bindBtns(); fixIconChipak(); }, 1200);
    setTimeout(function(){ bindBtns(); fixIconChipak(); }, 3000);
  }
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();