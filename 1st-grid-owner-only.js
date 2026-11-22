// 1st-grid-owner-only.js
// 1st Grid = sirf Owner ka data | Friend ko Edit / Photo / Video / Message Box nahi dikhega
(function(){
  // 1. CSS - Friend ki Timeline me Edit / Hide / Photo / Video / Message Box chhupao
  var st = document.createElement("style");
  st.textContent = 'body.visitor-mode button[onclick*="editMsg"],body.visitor-mode button[onclick*="hideMsg"]{display:none !important;}'
    + 'body.visitor-mode #tabMessages > .card:first-child button[onclick*="pickPhoto"],'
    + 'body.visitor-mode #tabMessages > .card:first-child button[onclick*="pickVideo"],'
    + 'body.visitor-mode #tabMessages > .card:first-child button[onclick*="tagMsg"]{display:none !important;}';
  document.head.appendChild(st);

  // 2. SAVE LOCK - Friend Owner ke 1st Grid me Save hi nahi kar payega
  var _oldSend = window.sendMsg1st;
  window.sendMsg1st = function(){
    try{ if(typeof isOwnerNow==="function" && !isOwnerNow()){ alert("🔒 1st Grid me sirf Owner Message likh sakta hai"); return; } }catch(e){}
    if(typeof _oldSend==="function") return _oldSend();
  };
  window.sendMsg = window.sendMsg1st;
  window.saveTimelineMsg = window.sendMsg1st;

  // 3. BUTTON LOCK - Friend ko 1st Grid me Edit kabhi mat do, sirf Comment
  if(typeof window.actionBtns==="function"){
    var _oldBtns = window.actionBtns;
    window.actionBtns = function(m, is2nd){
      if(!is2nd){
        try{ if(typeof isOwnerNow==="function" && !isOwnerNow()) return '<button class="btn" onclick="commentMsg(this)">💬 Comment</button>'; }catch(e){}
      }
      return _oldBtns(m, is2nd);
    };
    window.actionBtns1st = function(m){ return window.actionBtns(m, false); };
  }

  // 4. VIEW FILTER - 1st Grid me sirf Owner ka data dikhega
  if(typeof window.renderMessages==="function"){
    var _oldRender = window.renderMessages;
    window.renderMessages = function(){
      // MSGS ko temporarily Owner-only karke original render chalao
      var _bak = window.MSGS;
      try{
        if(typeof msgOwner==="function" && Array.isArray(_bak)){
          var owner = msgOwner();
          window.MSGS = _bak.filter(function(m){
            var s = String(m.senderUid || m.loginUid || "");
            if(!s) return true; // purana data jisme senderUid nahi hai
            return s === String(owner);
          });
        }
        _oldRender();
      }catch(e){ try{ _oldRender(); }catch(e2){} }
      window.MSGS = _bak;

      // 5. MESSAGE BOX HIDE - Friend ko 1st Grid ka Message Box mat dikhao
      try{
        if(typeof isOwnerNow==="function" && !isOwnerNow()){
          var inp = document.getElementById("msgInput");
          if(inp){
            var card = inp.closest(".card");
            if(card) card.style.display = "none";
          }
          // Koi Edit / Photo / Video button reh gaya ho to usko bhi chhupao
          var btns = document.querySelectorAll('#tabMessages button[onclick*="editMsg"], #tabMessages button[onclick*="hideMsg"]');
          btns.forEach(function(b){ b.style.display = "none"; });
        }
      }catch(e){}
    };
  }

  // Page khulte hi ek baar filter laga do
  setTimeout(function(){ try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){} }, 600);
})();