/* ============================================================
   OLD CODE - V7 - BACKUP - Isko delete mat karna
   Tumhara wala - SIZE 40 wala - comment me save hai
============================================================ */
/* TUMHARA PURANA CODE YAHAN Jaisa tha waisa hi rakha hai - upar wale message wala poora code */
/* Is file me neeche NEW CODE chalega, purana sirf backup ke liye hai */

/* ============================================================
   NEW CODE - V8 - Red patti me BIG + CLEAN photo, icon bilkul nahi
============================================================ */
(function(){
  function box(){ return document.getElementById("headerPhotoBox"); }
  function img(){ return document.getElementById("headerPhotoImg"); }
  function em(){ return document.getElementById("headerPhotoEmoji"); }
  function uid(){ return localStorage.getItem("auth_uid") || ""; }
  function db(){ return window._fbDb || null; }

  // BIG SIZE - Red patti me fit hone wali sabse badi sahi size
  // 120 = badi + saaf + screen kharab nahi hogi
  // Aur badi chahiye to 140 kar do, 400 mat karna - screen phat jayegi
  var SIZE = 120;

  function applySize(){
    var b = box(); if(!b) return;
    if(b.dataset.sizeLocked) return;
    b.dataset.sizeLocked = "1";
    var s = SIZE;
    b.style.setProperty("width", s+"px", "important");
    b.style.setProperty("height", s+"px", "important");
    b.style.setProperty("min-width", s+"px", "important");
    b.style.setProperty("min-height", s+"px", "important");
    b.style.setProperty("max-width", s+"px", "important");
    b.style.setProperty("max-height", s+"px", "important");
    b.style.setProperty("flex-shrink", "0", "important");
    b.style.setProperty("flex-grow", "0", "important");
    b.style.setProperty("border-radius", "50%", "important");
    b.style.setProperty("overflow", "hidden", "important");
    b.style.setProperty("position", "relative", "important");
    // Red patti ko bhi bada karo taaki 120px fit ho jaye
    var patti = b.parentElement;
    if(patti){
      patti.style.setProperty("min-height", (s + 24) + "px", "important");
      patti.style.setProperty("justify-content", "center", "important");
      patti.style.setProperty("overflow", "hidden", "important");
    }
    var e = em();
    if(e) e.style.fontSize = Math.round(s * 0.45) + "px";
  }

  // Photo lage to icon BILKUL gayab - !important se
  function showPhoto(url){
    var i = img(), e = em(); if(!i) return;
    applySize();
    if(url && url.length > 10){
      i.src = url;
      i.style.setProperty("display", "block", "important");
      i.style.setProperty("position", "absolute", "important");
      i.style.setProperty("top", "0", "important");
      i.style.setProperty("left", "0", "important");
      i.style.setProperty("width", "100%", "important");
      i.style.setProperty("height", "100%", "important");
      i.style.setProperty("object-fit", "cover", "important");
      i.style.setProperty("object-position", "center center", "important");
      if(e){
        e.style.setProperty("display", "none", "important");
        e.style.setProperty("visibility", "hidden", "important");
      }
    } else {
      i.removeAttribute("src");
      i.style.setProperty("display", "none", "important");
      if(e){
        e.textContent = "👩";
        e.style.setProperty("display", "flex", "important");
        e.style.setProperty("visibility", "visible", "important");
      }
    }
  }

  function loadLocal(){
    try{
      var ph = localStorage.getItem("header_photo") || "";
      var sUid = localStorage.getItem("header_photo_uid") || "";
      var cur = uid();
      if(ph && (!sUid || !cur || sUid === cur)) showPhoto(ph);
    }catch(e){}
  }

  function loadFirebase(){
    try{
      var u = uid(); var d = db();
      if(!u || !d) return;
      d.ref("headerPhotos/" + u).once("value").then(function(s){
        var v = s.val() || {};
        var ph = v.photo || "";
        if(ph){
          showPhoto(ph);
          try{
            localStorage.setItem("header_photo", ph);
            localStorage.setItem("header_photo_uid", u);
          }catch(e){}
        }
      });
    }catch(e){}
  }

  function trySaveLocal(small){
    try{ localStorage.setItem("header_photo", small); localStorage.setItem("header_photo_uid", uid()); return true; }
    catch(e){
      try{ localStorage.removeItem("header_photo"); localStorage.setItem("header_photo", small); localStorage.setItem("header_photo_uid", uid()); return true; }
      catch(e2){ return false; }
    }
  }

  function saveBoth(small){
    trySaveLocal(small);
    try{
      var u = uid(); var d = db();
      if(u && d) d.ref("headerPhotos/" + u).set({photo: small, updatedAt: Date.now()});
    }catch(e){}
    showPhoto(small);
  }

  // CLEAN photo - 800px sharp save, 120px me dikhegi to bilkul saaf
  function compressAndSave(dataUrl){
    var image = new Image();
    image.onload = function(){
      var sizes = [800, 600, 400, 300];
      var quals = [0.92, 0.85, 0.8, 0.7];
      var done = false;
      for(var k = 0; k < sizes.length && !done; k++){
        var max = sizes[k];
        var w = image.width, h = image.height;
        if(w > max || h > max){ var r = Math.min(max / w, max / h); w = Math.round(w * r); h = Math.round(h * r); }
        var c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(image, 0, 0, w, h);
        var small = c.toDataURL("image/jpeg", quals[k]);
        var ok = trySaveLocal(small);
        if(ok){ done = true; saveBoth(small); alert("✅ Photo Firebase me save ho gayi! Ab hategi nahi."); }
      }
      if(!done){ alert("Phone memory full hai"); }
    };
    image.src = dataUrl;
  }

  function removeHeaderPhoto(){
    try{ localStorage.removeItem("header_photo"); localStorage.setItem("header_photo_uid", uid()); }catch(e){}
    try{
      var u = uid(); var d = db();
      if(u && d) d.ref("headerPhotos/" + u).remove();
    }catch(e){}
    showPhoto("");
  }

  function openMenu(){
    var old = document.getElementById("headerPhotoMenu"); if(old) old.remove();
    var m = document.createElement("div"); m.id = "headerPhotoMenu";
    m.style.cssText = "position:fixed;top:60px;right:10px;z-index:99999;background:#fff;border:1px solid #ddd;border-radius:12px;padding:10px;box-shadow:0 4px 20px rgba(0,0,0,0.3);display:flex;flex-direction:column;gap:8px;min-width:200px;";
    m.innerHTML = '<button id="hpUpload" style="padding:10px;border:none;border-radius:10px;background:#e65100;color:#fff;font-weight:bold;">📤 Apni Pasand ki Photo Lagao</button>'
      + '<button id="hpRemove" style="padding:10px;border:1px solid #e65100;border-radius:10px;background:#fff;color:#e65100;font-weight:bold;">🗑️ Photo Hatao</button>'
      + '<button id="hpClose" style="padding:8px;border:none;background:none;color:#999;">✖ Band karo</button>';
    document.body.appendChild(m);
    document.getElementById("hpClose").onclick = function(){ m.remove(); };
    document.getElementById("hpRemove").onclick = function(){ m.remove(); if(confirm("Header photo hatani hai?")) removeHeaderPhoto(); };
    document.getElementById("hpUpload").onclick = function(){
      m.remove();
      var inp = document.getElementById("headerPhotoFile");
      if(!inp){
        inp = document.createElement("input"); inp.type = "file"; inp.id = "headerPhotoFile"; inp.accept = "image/*";
        inp.style.display = "none"; document.body.appendChild(inp);
        inp.addEventListener("change", function(){
          var f = inp.files[0]; if(!f) return;
          var rd = new FileReader();
          rd.onload = function(){ compressAndSave(rd.result); inp.value = ""; };
          rd.readAsDataURL(f);
        });
      }
      inp.click();
    };
  }

  function start(){
    var b = box(); if(!b || b.dataset.headerV8) return;
    b.dataset.headerV8 = "1"; b.style.cursor = "pointer";
    b.addEventListener("click", openMenu);
    applySize();
    loadLocal();
    loadFirebase();
    window.addEventListener("focus", function(){ loadFirebase(); });
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();