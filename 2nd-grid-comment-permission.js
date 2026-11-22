// 2nd-grid-comment-permission.js
// 2nd Grid: Sender ko Edit + Hide/Delete | Owner ko Hide/Delete | Sabko Reply + Dislike
(function(){
  function isOwner(){
    try{ return typeof isOwnerNow==="function" ? isOwnerNow() : false; }catch(e){ return false; }
  }
  function myUid(){
    try{ return typeof getMyUid==="function" ? getMyUid() : ""; }catch(e){ return ""; }
  }
  function isMine(m){
    try{ return !!(m && m.senderUid && myUid() && String(m.senderUid)===String(myUid())); }catch(e){ return false; }
  }
  function findIdx(t, txt){
    if(t){
      for(var i=0;i<COMMENTS.length;i++){ if(String(COMMENTS[i].time)===String(t)) return i; }
    }
    if(txt){
      for(var j=0;j<COMMENTS.length;j++){ if(COMMENTS[j].text===txt) return j; }
    }
    return -1;
  }
  function saveComments(){
    var owner = "";
    try{ owner = typeof msgOwner==="function" ? msgOwner() : ""; }catch(e){}
    try{ localStorage.setItem("group_comments_" + owner, JSON.stringify(COMMENTS)); }catch(e){}
    try{ if(window._fbDb && owner) window._fbDb.ref("group_comments/" + owner + "/messages").set(COMMENTS); }catch(e){}
  }

  // 1. 2nd Grid ke button - kaun kya dekh payega
  var _oldBtns = window.actionBtns;
  window.actionBtns = function(m, is2nd){
    if(is2nd){
      var dis = m.dislikes || 0;
      var disBtn = '<button class="btn" onclick="dislikeComment(this,'+(m.time||0)+')">👎 Dislike ('+dis+')</button>';
      // Maine likha hai - Edit + Hide/Delete mera adhikar
      if(isMine(m)) return '<button class="btn" onclick="editComment(this,'+(m.time||0)+')">✏️ Edit</button><button class="btn" onclick="hideComment(this,'+(m.time||0)+')">🗑️ Hide/Delete</button><button class="btn" onclick="replyComment(this)">💬 Reply</button>' + disBtn;
      // Owner hu - Hide/Delete mera adhikar
      if(isOwner()) return '<button class="btn" onclick="hideComment(this,'+(m.time||0)+')">🗑️ Hide/Delete</button><button class="btn" onclick="replyComment(this)">💬 Reply</button>' + disBtn;
      // Baaki Friend - sirf Reply + Dislike
      return '<button class="btn" onclick="replyComment(this)">💬 Reply</button>' + disBtn;
    }
    if(typeof _oldBtns==="function") return _oldBtns(m, is2nd);
    return "";
  };

  // 2. EDIT - asli wala, alert nahi - apna Comment edit hoga, Save hoga
  window.editComment = function(el, t){
    var idx = -1;
    if(t) idx = findIdx(t, "");
    if(idx===-1 && el){
      try{
        var card = el.closest(".card");
        var txt = card ? card.querySelector(".msg-name").parentNode.textContent : "";
        for(var k=0;k<COMMENTS.length;k++){ if(txt.indexOf(COMMENTS[k].text)!==-1){ idx=k; break; } }
      }catch(e){}
    }
    if(idx===-1){ alert("Ye comment nahi mila, ek baar page reload karo"); return; }
    var m = COMMENTS[idx];
    if(!isMine(m)){ alert("🔒 Ye Comment tumne nahi likha, isliye Edit nahi kar sakte"); return; }
    var nw = prompt("Comment Edit karo:", m.text);
    if(nw===null) return;
    if(!nw.trim()){ alert("Khali comment save nahi hoga"); return; }
    m.text = nw.trim(); m.updatedAt = Date.now(); m.edited = true;
    saveComments();
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
    alert("✅ Comment Edit ho gaya");
  };

  // 3. HIDE/DELETE - Sender ya Owner dono kar sakte hain, sahi wala delete hoga
  window.hideComment = function(el, t){
    var idx = -1;
    if(t) idx = findIdx(t, "");
    if(idx===-1 && el){
      try{
        var card2 = el.closest(".card");
        var txt2 = card2 ? card2.querySelector(".msg-name").parentNode.textContent : "";
        for(var k2=0;k2<COMMENTS.length;k2++){ if(txt2.indexOf(COMMENTS[k2].text)!==-1){ idx=k2; break; } }
      }catch(e){}
    }
    if(idx===-1){ alert("Ye comment nahi mila, ek baar page reload karo"); return; }
    var m = COMMENTS[idx];
    // Sirf likhne wala ya Owner hi Hide/Delete kar sakta hai
    if(!isMine(m) && !isOwner()){ alert("🔒 Hide/Delete sirf likhne wala ya Timeline Owner kar sakta hai"); return; }
    if(!confirm("Hide/Delete - Recycle Bin me jayega?")) return;
    var item = COMMENTS[idx];
    try{ if(typeof moveToRecycle==="function") moveToRecycle(item, "comment"); }catch(e){}
    COMMENTS.splice(idx, 1);
    saveComments();
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
  };

  // 4. DISLIKE - jo bhi Comment me hai, Dislike kar sakta hai
  window.dislikeComment = function(el, t){
    var idx = findIdx(t, "");
    if(idx===-1){ alert("Ye comment nahi mila"); return; }
    var m = COMMENTS[idx];
    if(!m.dislikedBy) m.dislikedBy = [];
    var me = myUid();
    var p = m.dislikedBy.indexOf(me);
    if(p!==-1){ m.dislikedBy.splice(p, 1); } // dobara dabaya to Dislike wapas
    else { m.dislikedBy.push(me); }
    m.dislikes = m.dislikedBy.length;
    saveComments();
    try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
  };

  setTimeout(function(){ try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){} }, 500);
})();