// photo-video-upload.js V6
// UPDATE: 1) Duplicate photo nahi save hogi, 2) Edit Box card ke neeche aayega - card hilega nahi, 3) Edit me Photo / Video / Tag button, 4) Ek photo hatane pe dusri nahi hategi, 5) Card me 2 photo bhejoge to 2 dikhengi - aakhri letters se pehchan
// NEW FIX: Timeline file me kuch badalne ki zarurat nahi - ye file khud card me data-time ghusayegi, Edit ab time se sahi card dhoondhega, text se nahi
(function(){
  window._pickedPhotos = window._pickedPhotos || [];
  window._pickedVideos = window._pickedVideos || [];
  window._lastBox = window._lastBox || "comment";

  function findCommentInput(){
    return document.getElementById("commentInput") || document.querySelector('input[placeholder*="2nd Grid me Comment"]') || document.getElementById("commentPopupInput");
  }
  function findMsgInput(){
    return document.getElementById("msgInput") || document.querySelector('input[placeholder*="Message likho"]');
  }
  function uniqList(arr){
    var out = [];
    (arr||[]).forEach(function(s){
      if(!s) return;
      if(out.indexOf(s)===-1) out.push(s);
    });
    return out;
  }

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
          if(window._pickedPhotos.indexOf(small)===-1) window._pickedPhotos.push(small);
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
          if(window._pickedVideos.indexOf(e.target.result)===-1) window._pickedVideos.push(e.target.result);
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
          if(window._pickedVideos.indexOf(e.target.result)===-1) window._pickedVideos.push(e.target.result);
          left--; if(left===0) renderPreviewInBox();
        };
        r.readAsDataURL(f);
      });
      cvf.value = "";
    };
  }

  // Card me Multiple Photo dikhao + card me data-time ghusao (Timeline file chhede bina)
  var _oldCard = window.cardHTML;
  window.cardHTML = function(m, is2nd){
    var h = "";
    if(typeof _oldCard==="function") h = _oldCard(m, is2nd);
    // NEW: card ko uske time se pehchano - Edit isi time se sahi card dhoondhega
    var tVal = (m && (m.time || m.createdAt)) ? String(m.time || m.createdAt) : "0";
    var is2 = is2nd ? "1" : "0";
    if(h.indexOf("data-time=")===-1){
      h = h.replace('<div class="card">', '<div class="card" data-time="'+tVal+'" data-is2nd="'+is2+'">');
      if(h.indexOf("data-time=")===-1){
        h = h.replace('<div class="card" ', '<div class="card" data-time="'+tVal+'" data-is2nd="'+is2+'" ');
      }
    }
    function tail(s){ return s ? String(s).slice(-150) : ""; }
    var allP = uniqList([m ? m.photo : ""].concat(m && m.photos ? m.photos : []));
    var allV = uniqList([m ? m.video : ""].concat(m && m.videos ? m.videos : []));
    var extra = "";
    allP.forEach(function(src){
      if(src && h.indexOf(tail(src))===-1 && extra.indexOf(tail(src))===-1){
        extra += '<img class="photo" src="'+src+'" onclick="openPreview(this.src)">';
      }
    });
    if(extra) h = h.replace('</div></div></div>', extra + '</div></div></div>');
    var vextra = "";
    allV.forEach(function(src){
      if(src && h.indexOf(tail(src))===-1 && vextra.indexOf(tail(src))===-1){
        vextra += '<video src="'+src+'" controls style="width:100%;border-radius:10px;margin-top:6px;"></video>';
      }
    });
    if(vextra) h = h.replace('</div></div></div>', vextra + '</div></div></div>');
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
    var up = uniqList(window._pickedPhotos);
    var uv = uniqList(window._pickedVideos);
    var m = { text: finalText, photo: up[0]||"", video: uv[0]||"", photos: up.slice(), videos: uv.slice(), senderUid: loginUid, senderName: P.profileName||P.name||"", who: P.profileName||P.name||"", time: Date.now(), date: new Date().toISOString().slice(0,10), privacy:"Public", boxOwner: owner, owner: owner, type:"group_msg" };
    if(typeof MSGS!=="undefined") MSGS.unshift(m);
    try{ localStorage.setItem("group_msgs_"+owner, JSON.stringify(MSGS)); }catch(e){}
    try{ if(window._fbDb && owner) window._fbDb.ref("group_msgs/"+owner+"/messages").set(MSGS); }catch(e){}
    window.clearUploadPreview();
    if(inp) inp.value="";
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
  };
  window.sendMsg = window.sendMsg1st;

  // 2nd Grid Comment
  var _oldComment = window.sendComment;
  window.sendComment = function(){
    var bottom = findCommentInput();
    var popup = document.getElementById("commentPopupInput");
    var inp = (popup && popup.value.trim()) ? popup : bottom;
    var txt = inp ? inp.value.trim() : "";
    var hasMedia = window._pickedPhotos.length>0 || window._pickedVideos.length>0;
    if(!txt && !hasMedia){ alert("Pehle Comment ya Photo/Video chuno"); return; }
    if(!hasMedia && typeof _oldComment==="function" && _oldComment.toString().indexOf("alert")!==-1){
    } else if(!hasMedia && typeof _oldComment==="function"){ _oldComment(); return; }
    var P2={}; try{ P2=JSON.parse(localStorage.getItem("my_profile")||"{}"); }catch(e){}
    var owner2 = typeof msgOwner==="function" ? msgOwner() : "";
    var loginUid2 = typeof getMyUid==="function" ? getMyUid() : "";
    var finalText2 = txt || "📸 Photo";
    var up2 = uniqList(window._pickedPhotos);
    var uv2 = uniqList(window._pickedVideos);
    var m2 = { text: finalText2, photo: up2[0]||"", video: uv2[0]||"", photos: up2.slice(), videos: uv2.slice(), senderUid: loginUid2, senderName: P2.profileName||P2.name||"", who: P2.profileName||P2.name||"", time: Date.now(), date: new Date().toISOString().slice(0,10), privacy:"Public", boxOwner: owner2, owner: owner2, type:"comment" };
    if(typeof COMMENTS!=="undefined") COMMENTS.unshift(m2);
    try{ localStorage.setItem("group_comments_"+owner2, JSON.stringify(COMMENTS)); }catch(e){}
    try{ if(window._fbDb && owner2) window._fbDb.ref("group_comments/"+owner2+"/messages").set(COMMENTS); }catch(e){}
    window.clearUploadPreview();
    if(inp) inp.value=""; if(popup) popup.value="";
    try{ if(typeof closeCommentPopup==="function") closeCommentPopup(); }catch(e){}
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
    try{ if(typeof showComments==="function") showComments(); }catch(e){}
  };
  window.saveTimelineComment = window.sendComment;
  window.sendCommentPopup = window.sendComment;

  // UPDATE: Edit - time se sahi card, Box card ke neeche, SAARI photos chhoti + Close, Photo / Video / Tag bhi
  function editFn(el){
    var card = el.closest ? el.closest(".card") : null;
    if(!card) return;
    if(card.querySelector(".edit-box")) return;

    // NEW: card ka time lo - yehi sahi card ki pehchan hai, text nahi
    var cardTime = card.getAttribute("data-time") || "";
    var cardIs2nd = card.getAttribute("data-is2nd") || "";
    var myUid = (typeof getMyUid==="function" ? getMyUid() : "");
    var cardTxt = (card.textContent || "").replace(/Edit|Hide\/Delete|Comment|Save|Cancel|Photo Delete Karo/g, "").trim();

    // Sahi list pehle - 1st Grid ho to MSGS pehle, 2nd Grid ho to COMMENTS pehle
    var list1 = (cardIs2nd==="1") ? (typeof COMMENTS!=="undefined" ? COMMENTS : []) : (typeof MSGS!=="undefined" ? MSGS : []);
    var list2 = (cardIs2nd==="1") ? (typeof MSGS!=="undefined" ? MSGS : []) : (typeof COMMENTS!=="undefined" ? COMMENTS : []);
    var isMsg = (cardIs2nd!=="1");

    function findByTime(list){
      if(!cardTime || cardTime==="0") return null;
      for(var i=0;i<list.length;i++){
        if(String(list[i].time||list[i].createdAt||"")===String(cardTime)) return list[i];
      }
      return null;
    }
    function findByText(list){
      var best = null, bestScore = 0;
      (list||[]).forEach(function(it){
        if(myUid && it.senderUid && it.senderUid!==myUid) return;
        var t = String(it.text||"").trim();
        if(!t) return;
        var score = 0;
        if(cardTxt.indexOf(t)!==-1) score = 100 + t.length;
        else if(t.length>4 && cardTxt.indexOf(t.slice(0,15))!==-1) score = 50;
        else if(cardTxt.indexOf(t.slice(0,8))!==-1) score = 20;
        if(score > bestScore){ bestScore = score; best = it; }
      });
      return best;
    }

    var found = findByTime(list1);
    if(!found){ found = findByTime(list2); if(found) isMsg = (list2===MSGS); }
    if(!found){ found = findByText(list1); }
    if(!found){ found = findByText(list2); if(found) isMsg = (list2===MSGS); }
    if(!found){ alert("Edit sirf jisne likha wahi kar sakta hai"); return; }

    var editPhotos = uniqList([found.photo].concat(found.photos||[]));
    var editVideos = uniqList([found.video].concat(found.videos||[]));

    var box = document.createElement("div");
    box.className = "edit-box";
    box.style.cssText = "margin-top:10px;padding:10px;background:#fff3e0;border:1px solid #ffcc80;border-radius:10px;";
    box.innerHTML =
      '<b>✏️ Edit ' + (isMsg ? "Message" : "Comment") + ' - <span class="edit-count">' + editPhotos.length + '</span> Photo</b>' +
      '<input class="edit-text" value="'+String(found.text||"").replace(/"/g,"")+'" style="width:100%;padding:8px;margin:6px 0;border:1px solid #ddd;border-radius:10px;">' +
      '<div style="display:flex;gap:6px;margin:6px 0;"><button class="edit-add-photo" style="flex:1;background:#fff;border:1px solid #ff9800;padding:8px;border-radius:20px;">📸 Photo</button><button class="edit-add-video" style="flex:1;background:#fff;border:1px solid #ff9800;padding:8px;border-radius:20px;">🎥 Video</button><button class="edit-add-tag" style="flex:1;background:#fff;border:1px solid #ff9800;padding:8px;border-radius:20px;">🏷️ Tag</button></div>' +
      '<input type="file" class="edit-file-photo" accept="image/*" multiple style="display:none;">' +
      '<input type="file" class="edit-file-video" accept="video/*" multiple style="display:none;">' +
      '<div class="edit-all-photos" style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;"></div>' +
      '<div style="font-size:12px;color:#666;">Har photo pe ✖️ dabao to sirf wahi photo hategi</div>' +
      '<div style="display:flex;gap:6px;margin-top:8px;"><button class="edit-save" style="flex:1;background:#e65100;color:#fff;border:none;padding:10px;border-radius:20px;font-weight:bold;">✅ Save</button><button class="edit-cancel" style="flex:1;background:#eee;border:1px solid #ddd;padding:10px;border-radius:20px;">❌ Cancel</button></div>';
    // FIX hilna: Edit Box card ke SABSE NEECHE - sab photo ke neeche, upar insert nahi, card hilega nahi
    card.appendChild(box);

    var photoWrap = box.querySelector(".edit-all-photos");
    var countEl = box.querySelector(".edit-count");
    function drawPhotos(){
      photoWrap.innerHTML = "";
      if(countEl) countEl.textContent = editPhotos.length;
      if(!editPhotos.length && !editVideos.length){
        photoWrap.innerHTML = '<span style="font-size:12px;color:#888;">Is me photo nahi hai - upar se Photo dabake nayi jodo</span>';
        return;
      }
      editPhotos.forEach(function(src, idx){
        var w = document.createElement("div");
        w.style.cssText = "position:relative;width:60px;height:60px;";
        w.innerHTML = '<img src="'+src+'" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #ccc;">' +
          '<button class="one-photo-close" data-i="'+idx+'" style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:#f44336;color:#fff;border:2px solid #fff;font-size:12px;line-height:1;">✖️</button>';
        photoWrap.appendChild(w);
      });
      editVideos.forEach(function(src, idx){
        var w = document.createElement("div");
        w.style.cssText = "position:relative;width:60px;height:60px;";
        w.innerHTML = '<div style="width:60px;height:60px;background:#000;color:#fff;border-radius:8px;text-align:center;line-height:60px;font-size:22px;">🎥</div>' +
          '<button class="one-video-close" data-i="'+idx+'" style="position:absolute;top:-6px;right:-6px;width:22px;height:22px;border-radius:50%;background:#f44336;color:#fff;border:2px solid #fff;font-size:12px;line-height:1;">✖️</button>';
        photoWrap.appendChild(w);
      });
      photoWrap.querySelectorAll(".one-photo-close").forEach(function(b){
        b.onclick = function(){
          var i = parseInt(b.getAttribute("data-i"));
          editPhotos.splice(i, 1);
          drawPhotos();
        };
      });
      photoWrap.querySelectorAll(".one-video-close").forEach(function(b){
        b.onclick = function(){
          var i = parseInt(b.getAttribute("data-i"));
          editVideos.splice(i, 1);
          drawPhotos();
        };
      });
    }
    drawPhotos();

    var fp = box.querySelector(".edit-file-photo");
    box.querySelector(".edit-add-photo").onclick = function(){ fp.click(); };
    fp.onchange = function(){
      var files = Array.prototype.slice.call(fp.files||[]);
      var left = files.length;
      if(!left) return;
      files.forEach(function(f){
        compressPhoto(f, function(small){
          if(editPhotos.indexOf(small)===-1) editPhotos.push(small);
          left--; if(left===0) drawPhotos();
        });
      });
      fp.value = "";
    };
    var fv = box.querySelector(".edit-file-video");
    box.querySelector(".edit-add-video").onclick = function(){ fv.click(); };
    fv.onchange = function(){
      var files = Array.prototype.slice.call(fv.files||[]);
      var left = files.length;
      if(!left) return;
      files.forEach(function(f){
        var r = new FileReader();
        r.onload = function(e){
          if(editVideos.indexOf(e.target.result)===-1) editVideos.push(e.target.result);
          left--; if(left===0) drawPhotos();
        };
        r.readAsDataURL(f);
      });
      fv.value = "";
    };
    box.querySelector(".edit-add-tag").onclick = function(){
      var nm = prompt("Kisko Tag karna hai? Naam likho:");
      if(!nm) return;
      var ti = box.querySelector(".edit-text");
      ti.value = (ti.value.trim() + " @" + nm.trim()).trim();
    };

    box.querySelector(".edit-cancel").onclick = function(){ box.remove(); };
    box.querySelector(".edit-save").onclick = function(){
      var nt = box.querySelector(".edit-text").value.trim();
      if(nt) found.text = nt;
      found.photos = uniqList(editPhotos);
      found.photo = found.photos[0] || "";
      found.videos = uniqList(editVideos);
      found.video = found.videos[0] || "";
      found.updatedAt = Date.now();
      // 1st Grid me wahi message 2 baar ho to dono ko update karo, nahi to purana dikhta rahega
      var targetList = isMsg ? (typeof MSGS!=="undefined" ? MSGS : []) : (typeof COMMENTS!=="undefined" ? COMMENTS : []);
      if(cardTime && cardTime!=="0"){
        targetList.forEach(function(it){
          if(String(it.time||it.createdAt||"")===String(cardTime)){
            it.text = found.text; it.photos = found.photos.slice(); it.photo = found.photo;
            it.videos = found.videos.slice(); it.video = found.video; it.updatedAt = found.updatedAt;
          }
        });
      }
      var owner = (typeof msgOwner==="function" ? msgOwner() : "");
      if(isMsg){
        try{ localStorage.setItem("group_msgs_"+owner, JSON.stringify(MSGS)); }catch(e){}
        try{ if(window._fbDb && owner) window._fbDb.ref("group_msgs/"+owner+"/messages").set(MSGS); }catch(e){}
      } else {
        try{ localStorage.setItem("group_comments_"+owner, JSON.stringify(COMMENTS)); }catch(e){}
        try{ if(window._fbDb && owner) window._fbDb.ref("group_comments/"+owner+"/messages").set(COMMENTS); }catch(e){}
      }
      try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
      try{ if(typeof showComments==="function") showComments(); }catch(e){}
      alert("✅ Edit ho gaya");
    };
  }
  window.editComment = editFn;
  window.editMsg = editFn;
  // NEW: Timeline ki purani Edit wali line isko daba na de, isliye page load hone ke baad dobara pakka karo
  window.addEventListener("load", function(){
    setTimeout(function(){ window.editComment = editFn; window.editMsg = editFn; window.cardHTML = window.cardHTML; }, 300);
  });
})();