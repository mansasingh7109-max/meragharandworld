// photo-video-upload.js V6 - Tumhari V5 wali hi, bas photo chhota karke save wala fix add hai
// UPDATE: 1) Comment Input ko placeholder se bhi pakdega, 2) Sirf photo bheji to Save pe gayab nahi hogi, 3) Edit me Photo Hatao option, 4) Badi photo ko chhota karke save karega
(function(){
  window._pickedPhotos = window._pickedPhotos || [];
  window._pickedVideos = window._pickedVideos || [];
  window._lastBox = window._lastBox || "comment"; // "msg" ya "comment"

  // Input dhoondo - ID se nahi mila to placeholder se
  function findCommentInput(){
    return document.getElementById("commentInput") || document.querySelector('input[placeholder*="2nd Grid me Comment"]') || document.getElementById("commentPopupInput");
  }
  function findMsgInput(){
    return document.getElementById("msgInput") || document.querySelector('input[placeholder*="Message likho"]');
  }

  // Kahan se Photo dabaya - 1st Grid ya Comment Box - ye pakdo
  document.addEventListener("click", function(e){
    var btn = e.target.closest ? e.target.closest("button") : null;
    if(!btn) return;
    var oc = btn.getAttribute("onclick") || "";
    if(oc.indexOf("pickPhoto")!==-1 || oc.indexOf("pickVideo")!==-1){
      var card = btn.closest(".card");
      if(card && (card.querySelector("#commentInput") || card.querySelector('input[placeholder*="2nd Grid"]'))) window._lastBox = "comment";
      else if(card && card.querySelector("#msgInput")) window._lastBox = "msg";
      else if(document.getElementById("commentPopup") && document.getElementById("commentPopup").style.display==="block") window._lastBox = "comment";
    }
  }, true);

  function renderPreviewInBox(){
    document.querySelectorAll(".inbox-photo-preview").forEach(function(el){ el.remove(); });
    var total = window._pickedPhotos.length + window._pickedVideos.length;
    if(total===0) return;
    var inp = window._lastBox==="comment" ? findCommentInput() : findMsgInput();
    if(!inp) inp = findCommentInput() || findMsgInput();
    if(!inp) return;
    var div = document.createElement("div");
    div.className = "inbox-photo-preview";
    div.style.cssText = "margin-top:8px;padding:8px;background:#f1f8e9;border:1px solid #aed581;border-radius:10px;";
    var thumbs = "";
    window._pickedPhotos.forEach(function(src){
      thumbs += '<img src="'+src+'" style="width:70px;height:70px;object-fit:cover;border-radius:8px;margin:3px;border:1px solid #ccc;">';
    });
    window._pickedVideos.forEach(function(){
      thumbs += '<span style="display:inline-block;width:70px;height:70px;background:#000;color:#fff;border-radius:8px;text-align:center;line-height:70px;font-size:24px;margin:3px;">🎥</span>';
    });
    div.innerHTML = '<div style="font-weight:bold;color:#2e7d32;font-size:13px;">✅ Upload Done - '+window._pickedPhotos.length+' Photo, '+window._pickedVideos.length+' Video</div><div style="font-size:12px;color:#666;">Ab isi box me message likho ya bina likhe Comment / Send dabao</div><div>'+thumbs+'</div><button onclick="clearUploadPreview()" style="margin-top:6px;background:#f44336;color:#fff;border:none;padding:6px 12px;border-radius:12px;font-size:12px;">✖️ Photo Hatao</button>';
    inp.parentElement.appendChild(div);
    var popup = document.getElementById("commentPopup");
    if(popup && popup.style.display==="block"){
      var oldP = popup.querySelector(".inbox-photo-preview");
      if(oldP) oldP.remove();
      var div2 = div.cloneNode(true);
      popup.appendChild(div2);
    }
    var pb = document.getElementById("commentPreviewBox");
    if(window._lastBox==="comment" && pb){ pb.innerHTML=""; pb.appendChild(div.cloneNode(true)); }
  }
  window.clearUploadPreview = function(){
    window._pickedPhotos = []; window._pickedVideos = [];
    document.querySelectorAll(".inbox-photo-preview").forEach(function(el){ el.remove(); });
  };

  // FIX: Badi photo ko chhota karke save karo - warna localStorage / Firebase save nahi karta
  function compressPhoto(file, done){
    var r = new FileReader();
    r.onload = function(e){
      var img = new Image();
      img.onload = function(){
        var max = 800;
        var w = img.width, h = img.height;
        if(w > max){ h = Math.round(h * max / w); w = max; }
        if(h > max){ w = Math.round(w * max / h); h = max; }
        var c = document.createElement("canvas");
        c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        try{ done(c.toDataURL("image/jpeg", 0.7)); }catch(err){ done(e.target.result); }
      };
      img.src = e.target.result;
    };
    r.readAsDataURL(file);
  }
  function bindPhotoInput(id){
    var el = document.getElementById(id);
    if(!el) return;
    el.setAttribute("multiple","multiple");
    el.onchange = function(){
      var files = Array.prototype.slice.call(el.files || []);
      if(!files.length) return;
      var left = files.length;
      files.forEach(function(f){
        compressPhoto(f, function(small){
          window._pickedPhotos.push(small);
          left--; if(left===0) renderPreviewInBox();
        });
      });
      el.value = "";
    };
  }
  bindPhotoInput("photoFile");
  bindPhotoInput("commentPhotoFile");

  var vf = document.getElementById("videoFile");
  if(vf){
    vf.setAttribute("multiple","multiple");
    vf.onchange = function(){
      var files = Array.prototype.slice.call(vf.files || []);
      if(!files.length) return;
      var left = files.length;
      files.forEach(function(f){
        var r = new FileReader();
        r.onload = function(e){
          window._pickedVideos.push(e.target.result);
          left--; if(left===0) renderPreviewInBox();
        };
        r.readAsDataURL(f);
      });
      vf.value = "";
    };
  }
  var cvf = document.getElementById("commentVideoFile");
  if(cvf){
    cvf.setAttribute("multiple","multiple");
    cvf.onchange = function(){
      var files = Array.prototype.slice.call(cvf.files || []);
      if(!files.length) return;
      var left = files.length;
      files.forEach(function(f){
        var r = new FileReader();
        r.onload = function(e){
          window._pickedVideos.push(e.target.result);
          left--; if(left===0) renderPreviewInBox();
        };
        r.readAsDataURL(f);
      });
      cvf.value = "";
    };
  }

  // Card me Multiple Photo dikhao
  var _oldCard = window.cardHTML;
  window.cardHTML = function(m, is2nd){
    var h = "";
    if(typeof _oldCard==="function") h = _oldCard(m, is2nd);
    // Agar purane card me photo nahi dikhi to photos[0] se dikhao
    if(m && m.photos && m.photos.length && h.indexOf(m.photos[0].slice(0,30))===-1){
      var first = '<img class="photo" src="'+m.photos[0]+'" onclick="openPreview(this.src)">';
      h = h.replace('</div></div></div>', first + '</div></div></div>');
    }
    if(m && m.photos && m.photos.length>1){
      var extra = "";
      for(var i=1;i<m.photos.length;i++){ extra += '<img class="photo" src="'+m.photos[i]+'" onclick="openPreview(this.src)">'; }
      h = h.replace('</div></div></div>', extra + '</div></div></div>');
    }
    if(m && m.videos && m.videos.length){
      var vextra = "";
      m.videos.forEach(function(src){ vextra += '<video src="'+src+'" controls style="width:100%;border-radius:10px;margin-top:6px;"></video>'; });
      h = h.replace('</div></div></div>', vextra + '</div></div></div>');
    }
    return h;
  };

  // 1st Grid Send
  var _oldSend = window.sendMsg1st;
  window.sendMsg1st = function(){
    var inp = findMsgInput();
    var txt = inp ? inp.value.trim() : "";
    var hasMedia = window._pickedPhotos.length>0 || window._pickedVideos.length>0;
    if(!txt && !hasMedia){ alert("Pehle Message ya Photo/Video chuno"); return; }
    if(!hasMedia && typeof _oldSend==="function"){ _oldSend(); return; }
    var P={}; try{ P=JSON.parse(localStorage.getItem("my_profile")||"{}"); }catch(e){}
    var owner = typeof msgOwner==="function" ? msgOwner() : "";
    var loginUid = typeof getMyUid==="function" ? getMyUid() : "";
    var finalText = txt || "📸 Photo";
    var m = { text: finalText, photo: window._pickedPhotos[0]||"", video: window._pickedVideos[0]||"", photos: window._pickedPhotos.slice(), videos: window._pickedVideos.slice(), senderUid: loginUid, senderName: P.profileName||P.name||"", who: P.profileName||P.name||"", time: Date.now(), date: new Date().toISOString().slice(0,10), privacy:"Public", boxOwner: owner, owner: owner, type:"group_msg" };
    if(typeof MSGS!=="undefined") MSGS.unshift(m);
    try{ localStorage.setItem("group_msgs_"+owner, JSON.stringify(MSGS)); }catch(e){}
    try{ if(window._fbDb && owner) window._fbDb.ref("group_msgs/"+owner+"/messages").set(MSGS); }catch(e){}
    window.clearUploadPreview();
    if(inp) inp.value="";
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
  };
  window.sendMsg = window.sendMsg1st;

  // 2nd Grid Comment - Yahi sabse zaroori hai
  var _oldComment = window.sendComment;
  window.sendComment = function(){
    var bottom = findCommentInput();
    var popup = document.getElementById("commentPopupInput");
    var inp = (popup && popup.value.trim()) ? popup : bottom;
    var txt = inp ? inp.value.trim() : "";
    var hasMedia = window._pickedPhotos.length>0 || window._pickedVideos.length>0;
    if(!txt && !hasMedia){ alert("Pehle Comment ya Photo/Video chuno"); return; }
    if(!hasMedia && typeof _oldComment==="function" && _oldComment.toString().indexOf("alert")!==-1){
      // Purana dummy alert wala sendComment hai to usko mat chalao, neeche se save karo
    } else if(!hasMedia && typeof _oldComment==="function"){ _oldComment(); return; }
    var P2={}; try{ P2=JSON.parse(localStorage.getItem("my_profile")||"{}"); }catch(e){}
    var owner2 = typeof msgOwner==="function" ? msgOwner() : "";
    var loginUid2 = typeof getMyUid==="function" ? getMyUid() : "";
    var finalText2 = txt || "📸 Photo";
    var m2 = { text: finalText2, photo: window._pickedPhotos[0]||"", video: window._pickedVideos[0]||"", photos: window._pickedPhotos.slice(), videos: window._pickedVideos.slice(), senderUid: loginUid2, senderName: P2.profileName||P2.name||"", who: P2.profileName||P2.name||"", time: Date.now(), date: new Date().toISOString().slice(0,10), privacy:"Public", boxOwner: owner2, owner: owner2, type:"comment" };
    if(typeof COMMENTS!=="undefined") COMMENTS.unshift(m2);
    try{ localStorage.setItem("group_comments_"+owner2, JSON.stringify(COMMENTS)); }catch(e){}
    try{ if(window._fbDb && owner2) window._fbDb.ref("group_comments/"+owner2+"/messages").set(COMMENTS); }catch(e){}
    window.clearUploadPreview();
    if(inp) inp.value=""; if(popup) popup.value="";
    try{ if(typeof closeCommentPopup==="function") closeCommentPopup(); }catch(e){}
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
    // Agar tumhari file fixed wali hai to showComments bhi chalao
    try{ if(typeof showComments==="function") showComments(); }catch(e){}
  };
  window.saveTimelineComment = window.sendComment;
  window.sendCommentPopup = window.sendComment;

  // UPDATE: Edit me Photo Hatao ka option
  window.editComment = function(el){
    var card = el.closest ? el.closest(".card") : null;
    if(!card) return;
    if(typeof COMMENTS==="undefined" || !COMMENTS.length){ alert("Edit karne ko kuch nahi"); return; }
    var sorted = COMMENTS.slice().sort(function(a,b){ return (b.time||0)-(a.time||0); });
    var cardTxt = card.textContent || "";
    var found = null;
    for(var i=0;i<sorted.length;i++){
      if(sorted[i].senderUid===getMyUid() && cardTxt.indexOf(String(sorted[i].text||"").slice(0,20))!==-1){ found = sorted[i]; break; }
    }
    if(!found){ for(var j=0;j<sorted.length;j++){ if(sorted[j].senderUid===getMyUid()){ found = sorted[j]; break; } } }
    if(!found){ alert("Edit sirf jisne likha wahi kar sakta hai"); return; }
    var nt = prompt("Comment edit karo:", found.text||"");
    if(nt===null) return;
    var removePhoto = false;
    if(found.photo || (found.photos && found.photos.length) || found.video || (found.videos && found.videos.length)){
      removePhoto = confirm("Photo / Video bhi hatani hai?\nOK = Photo bhi hat jayegi\nCancel = Photo rahegi, sirf text badlega");
    }
    if(nt.trim()) found.text = nt.trim();
    if(removePhoto){ found.photo=""; found.photos=[]; found.video=""; found.videos=[]; }
    found.updatedAt = Date.now();
    try{ localStorage.setItem("group_comments_"+msgOwner(), JSON.stringify(COMMENTS)); }catch(e){}
    try{ if(window._fbDb && msgOwner()) window._fbDb.ref("group_comments/"+msgOwner()+"/messages").set(COMMENTS); }catch(e){}
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
    alert("✅ Edit ho gaya" + (removePhoto ? " - Photo bhi hat gayi" : ""));
  };
  window.editMsg = window.editComment;
})();