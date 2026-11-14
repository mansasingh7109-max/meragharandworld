// friend-preview.js - Dono Eye ke liye, 1 line se judta hai
function openPreview(uid){
  if(!uid) return;
  location.href = 'friend-preview.html?uid=' + encodeURIComponent(uid);
}
function openPreviewByName(nm){
  if(!nm) return;
  location.href = 'friend-preview.html?name=' + encodeURIComponent(nm);
}
function openFriendPreview(uid){ openPreview(uid); }

// --- UID pehchano ---
function isUidToken(s){
  if(!s) return false;
  s = String(s).trim();
  if(s.length < 15) return false;
  if(!/[a-zA-Z]/.test(s)) return false;
  if(!/[0-9]/.test(s)) return false;
  if(/^[0-9]{10}$/.test(s)) return false;
  return true;
}
function cleanPhone(v){
  if(!v) return "";
  var s = String(v).trim();
  if(isUidToken(s)) return "";
  var d = s.replace(/[^0-9]/g,"");
  if(d.length === 10) return d;
  if(d.length === 12 && d.indexOf("91") === 0) return d.slice(2);
  if(/[a-zA-Z]/.test(s)) return "";
  return "";
}
function isPrivateVal(v){
  if(v===undefined || v===null || v==="") return false;
  var t=String(v).toLowerCase();
  if(t==="private" || t==="only_me" || t==="sirf_main" || t==="onlyme" || t==="false" || t==="0" || t==="no") return true;
  return false;
}

// --- UID ko har jagah se mitao, baar-baar ---
function removeUidEverywhere(){
  try{
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var n;
    while(n = w.nextNode()){
      var t = n.nodeValue || "";
      if(isUidToken(t)){
        n.nodeValue = "";
        if(n.parentElement) n.parentElement.style.display = "none";
      } else {
        var parts = t.split(/\s+/);
        var changed = false;
        for(var i=0;i<parts.length;i++){
          if(isUidToken(parts[i])){ parts[i]=""; changed=true; }
        }
        if(changed) n.nodeValue = parts.join(" ").trim();
      }
    }
  }catch(e){}
  try{
    var els = document.querySelectorAll(".fr,.st,.phone,.role");
    for(var k=0;k<els.length;k++){
      if(isUidToken(els[k].textContent)){ els[k].textContent=""; els[k].style.display="none"; }
    }
  }catch(e){}
}

// --- Preview page - Sirf Profile + 1 Button ---
function loadFriendPreview(){
  if(location.pathname.indexOf("friend-preview") === -1) return;
  var uid = "";
  var m = location.search.match(/[?&]uid=([^&]+)/);
  if(m) uid = decodeURIComponent(m[1]);
  if(!uid) return;
  if(typeof firebase === "undefined") return;
  var db = null;
  try{ db = firebase.database(); }catch(e){}
  if(!db) return;

  // Sirf 1 button rahega - Friend Profile wala, Dekho word ke saath
  var linkEl = document.getElementById("linkProfile");
  if(linkEl) linkEl.href = "friend-profile.html?uid=" + encodeURIComponent(uid);

  db.ref("customer_profiles/" + uid).once("value").then(function(s){
    var P = s.val() || {};

    // Public / Private - sirf saaf-saaf Private ho to Private, warna Public
    var phonePriv = P.phoneVisibility || P.phone_visibility || P.profilePhoneVisibility || P.phonePrivacy || P.visibility || P.privacy || P.isPublic;
    var detailPriv = P.detailVisibility || P.detail_visibility || P.profileVisibility || P.visibility || P.privacy || P.isPublic;
    var showPhone = !isPrivateVal(phonePriv);
    var showDetail = !isPrivateVal(detailPriv);

    // 1. PROFILE - Naam / Photo hamesha
    var name = P.profileName || P.name || P.customer_name || P.username || P.displayName || "Friend";
    var nameEl = document.getElementById("pvName") || document.querySelector("h2");
    if(nameEl && name) nameEl.textContent = name;
    var brand = document.getElementById("brand");
    if(brand) brand.textContent = name;
    document.title = (name || "Friend") + " - Friend Preview";
    var ft = document.getElementById("friendsTitle");
if(ft) ft.textContent = "🏠 " + name + " ke Dost";
    var photo = P.profilePhoto || P.photo || P.photoURL || P.profileImage || P.image || P.profilePic || "";
    var photoEl = document.getElementById("pvPhoto") || document.querySelector(".bigphoto img") || document.querySelector(".bigphoto");
    if(photoEl && photo){
      if(photoEl.tagName === "IMG") photoEl.src = photo;
      else photoEl.innerHTML = '<img src="'+photo+'">';
    }

    // ProfileBox wala naya HTML - wahi bharega
    var box = document.getElementById("profileBox");
    if(box){
      var detail = P.profileDetail || P.detail || P.bio || P.about || P.status || P.customer_detail || P.description || "";
      if(!showDetail) detail = "🔒 Private - Detail chhupa hua hai";
      var phone = cleanPhone(P.profilePhone || P.phone || P.customer_phone || P.loginPhone || P.mobile || P.mobileNumber || P.contact || "");
      if(!showPhone) phone = "";
      // NO EDIT - Preview me sirf Dekho, Edit user ka apna kaam hai
      var h = '<div class="bigphoto">'+(photo?'<img src="'+photo+'">':'👤')+'</div><h2>'+name+'</h2>';
      if(phone) h += '<div class="ph">📞 '+phone+'</div>';
      h += '<div class="dt">'+(detail||"Is dost ne abhi koi detail nahi likha.")+'</div>';
      h += '<div class="act"><a href="chat-box.html?uid='+encodeURIComponent(uid)+'" style="background:#25D366;">💬 Chat Karo</a><a href="friends.html" style="background:#e65100;">👥 Dost List</a></div>';
      box.innerHTML = h;
    }

    // Purane pvDetail / pvPhone wale ID ho to bhi bhar do
    var detailEl = document.getElementById("pvDetail");
    if(detailEl){
      var d2 = P.profileDetail || P.detail || P.bio || P.about || "";
      detailEl.textContent = showDetail ? d2 : "🔒 Private - Detail chhupa hua hai";
    }
    var phoneEls = document.querySelectorAll("#pvPhone, .pvPhone, #pvPhoneRow");
    var phone2 = cleanPhone(P.profilePhone || P.phone || "");
    for(var i=0;i<phoneEls.length;i++){
      if(showPhone && phone2){ phoneEls[i].textContent = "📞 " + phone2; phoneEls[i].style.display = ""; }
      else { phoneEls[i].textContent = ""; phoneEls[i].style.display = "none"; }
    }

    // Album / Timeline / Friends ke button hata diye - isliye yahan unka load bhi nahi hai
    // Unka poora data Friend Profile page me dikhega - friend-profile.html me

    removeUidEverywhere();
  });
}

document.addEventListener("DOMContentLoaded", function(){
  loadFriendPreview();
  removeUidEverywhere();
  setTimeout(removeUidEverywhere, 500);
  setTimeout(removeUidEverywhere, 1500);
  try{
    var obs = new MutationObserver(function(){ removeUidEverywhere(); });
    obs.observe(document.body, {childList:true, subtree:true, characterData:true});
  }catch(e){}
  setInterval(removeUidEverywhere, 1000);
});