/* profile-position-fix.js - Naam CENTER + Photo RIGHT + Gap */
/* Kaam: Naam-photo ko purani jagah se utha ke nayi sahi jagah me rakhna */
(function(){
  "use strict";
  var DONE = false;

  function rebuild(){
    var name = document.getElementById("pfName")
      || document.getElementById("showName")
      || document.querySelector(".pname");
    var user = document.getElementById("pfUserName")
      || document.getElementById("pfPhone")
      || document.getElementById("showPhone");
    var photoBox = document.getElementById("pfPhotoBox2")
      || document.getElementById("pfPhotoBox")
      || document.getElementById("headerPhotoBox");
    if(!name || !photoBox) return;

    // Agar pehle se nayi jagah me hai to dobara mat banao
    if(document.getElementById("pfNewTop")) {
      applyStyle();
      return;
    }

    // 1. Nayi wrapper banao - yehi asli layout hai
    var wrap = document.createElement("div");
    wrap.id = "pfNewTop";
    wrap.setAttribute("style",
      "display:flex !important;" +
      "flex-direction:row !important;" +
      "align-items:center !important;" +
      "justify-content:space-between !important;" +
      "gap:18px !important;" +
      "width:100% !important;" +
      "padding:8px 4px 8px 8px !important;" +
      "box-sizing:border-box !important;"
    );

    // 2. Left box - Naam + Username - CENTER
    var left = document.createElement("div");
    left.id = "pfNewLeft";
    left.setAttribute("style",
      "flex:1 !important;" +
      "text-align:center !important;" +
      "min-width:0 !important;"
    );

    // Naam ko left me daalo
    left.appendChild(name);
    if(user) left.appendChild(user);

    // 3. Wrapper me daalo - Left + Photo
    wrap.appendChild(left);
    wrap.appendChild(photoBox);

    // 4. Wrapper ko Profile Box ke sabse upar lagao
    var card = document.getElementById("profileBox")
      || document.getElementById("profileCard")
      || photoBox.parentElement;
    if(card){
      card.insertBefore(wrap, card.firstChild);
    } else {
      photoBox.parentElement.insertBefore(wrap, photoBox);
    }

    DONE = true;
    applyStyle();
  }

  function applyStyle(){
    var name = document.getElementById("pfName");
    var user = document.getElementById("pfUserName") || document.getElementById("pfPhone");
    var photoBox = document.getElementById("pfPhotoBox2") || document.getElementById("pfPhotoBox");
    var wrap = document.getElementById("pfNewTop");
    if(wrap){
      wrap.style.setProperty("display", "flex", "important");
      wrap.style.setProperty("gap", "18px", "important"); // <-- Gap yahan se: 12px kam, 28px zyada
      wrap.style.setProperty("justify-content", "space-between", "important");
      wrap.style.setProperty("align-items", "center", "important");
    }
    if(name){
      name.style.setProperty("display", "block", "important");
      name.style.setProperty("text-align", "center", "important");
      name.style.setProperty("margin", "0 auto", "important");
      name.style.setProperty("padding", "0", "important");
      name.style.setProperty("width", "100%", "important");
      name.style.setProperty("font-size", "26px", "important");
      name.style.setProperty("font-weight", "bold", "important");
    }
    if(user){
      user.style.setProperty("display", "block", "important");
      user.style.setProperty("text-align", "center", "important");
      user.style.setProperty("margin", "2px auto 0", "important");
      user.style.setProperty("width", "100%", "important");
    }
    if(photoBox){
      photoBox.style.setProperty("position", "relative", "important");
      photoBox.style.setProperty("right", "auto", "important");
      photoBox.style.setProperty("top", "auto", "important");
      photoBox.style.setProperty("transform", "none", "important");
      photoBox.style.setProperty("margin", "0", "important");
      photoBox.style.setProperty("margin-left", "auto", "important"); // <-- Photo ko RIGHT dhakelga
      photoBox.style.setProperty("flex-shrink", "0", "important");
      photoBox.style.setProperty("width", "84px", "important");
      photoBox.style.setProperty("height", "84px", "important");
      photoBox.style.setProperty("border-radius", "50%", "important");
      photoBox.style.setProperty("overflow", "hidden", "important");
      photoBox.style.setProperty("display", "flex", "important");
      var img = photoBox.querySelector("img");
      if(img){
        img.style.setProperty("width", "100%", "important");
        img.style.setProperty("height", "100%", "important");
        img.style.setProperty("object-fit", "cover", "important");
        img.style.setProperty("display", "block", "important");
      }
    }
  }

  function start(){
    rebuild();
    setTimeout(rebuild, 800);
    setTimeout(rebuild, 2000);
    // Agar koi purani file wapas tod de to ye dobara bana dega
    setInterval(rebuild, 2500);
    try{
      var obs = new MutationObserver(function(){ rebuild(); });
      obs.observe(document.body, {childList:true, subtree:true});
      setTimeout(function(){ obs.disconnect(); }, 12000);
    }catch(e){}
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();