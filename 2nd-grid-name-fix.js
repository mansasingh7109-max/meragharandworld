// 2nd-grid-name-fix.js - V2 - senderUid se naam, senderName se nahi
(function(){
  // Mera asli naam - Firebase + profile_detail se nikalo, my_profile pe bharosa mat karo
  window._MY_REAL_NAME = "";
  function loadMyName(){
    var loginUid = "";
    try{ loginUid = typeof getMyUid==="function" ? getMyUid() : ""; }catch(e){}
    if(!loginUid) return;
    // 1. profile_detail_LOGINUID se
    try{
      var lp = JSON.parse(localStorage.getItem("profile_detail_" + loginUid) || "{}");
      if(lp.profileName || lp.name){ window._MY_REAL_NAME = lp.profileName || lp.name; }
    }catch(e){}
    // 2. Firebase se - sabse pakka
    try{
      if(window._fbDb) window._fbDb.ref("customer_profiles/" + loginUid).once("value").then(function(s){
        var P = s.val() || {};
        var n = P.profileName || P.name || "";
        if(n){ window._MY_REAL_NAME = n; try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){} }
      });
    }catch(e){}
  }

  function applyFix(){
    // 1. realNameFor - hamesha senderUid se naam, save hue galat senderName se nahi
    window.realNameFor = function(m){
      if(!m) return "";
      var loginUid = "";
      try{ loginUid = typeof getMyUid==="function" ? getMyUid() : ""; }catch(e){}
      // Agar Comment maine likha hai to MERA naam - chahe save me Santosh likha ho
      if(m.senderUid && loginUid && String(m.senderUid)===String(loginUid)){
        if(window._MY_REAL_NAME) return window._MY_REAL_NAME;
        if(m.senderName && m.senderName!=="Friend") return m.senderName;
        if(m.who && m.who!=="Friend") return m.who;
        return "Main";
      }
      // Agar Comment Owner ne likha hai to Owner ka naam
      try{
        if(m.senderUid && typeof msgOwner==="function" && String(m.senderUid)===String(msgOwner())){
          if(typeof FRIEND_DATA!=="undefined" && FRIEND_DATA && (FRIEND_DATA.profileName || FRIEND_DATA.name)) return FRIEND_DATA.profileName || FRIEND_DATA.name;
        }
      }catch(e){}
      // Baaki kisi ka Comment - uska senderUid wali profile se naam
      try{
        if(m.senderUid){
          var pr = JSON.parse(localStorage.getItem("profile_detail_" + m.senderUid) || "{}");
          if(pr.profileName && pr.profileName!=="Friend") return pr.profileName;
          if(pr.name && pr.name!=="Friend") return pr.name;
        }
      }catch(e){}
      // Last me senderName - par Owner ka naam yahan mat thopo
      if(m.senderName && m.senderName!=="Friend") return m.senderName;
      if(m.who && m.who!=="Friend") return m.who;
      return "";
    };

    // 2. sendComment - save hote waqt bhi mera sahi naam save ho
    var _old = window._fixedSendComment || window.sendComment;
    window._fixedSendComment = _old;
    window.sendComment = function(){
      var popup = document.getElementById("commentPopupInput");
      var bottom = document.getElementById("commentInput");
      var inp = (popup && popup.value.trim()) ? popup : bottom;
      if(!inp || !inp.value.trim()){ alert("Comment likhne ke liye neeche wale box me likho aur Comment dabao."); return; }
      var loginUid = "";
      try{ loginUid = typeof getMyUid==="function" ? getMyUid() : ""; }catch(e){}
      var myName = window._MY_REAL_NAME || "";
      if(!myName){
        try{
          var lp2 = JSON.parse(localStorage.getItem("profile_detail_" + loginUid) || "{}");
          myName = lp2.profileName || lp2.name || "";
        }catch(e){}
      }
      var owner = "";
      try{ owner = typeof msgOwner==="function" ? msgOwner() : ""; }catch(e){}
      var m = { text: inp.value.trim(), senderUid: loginUid, loginUid: loginUid, senderName: myName, who: myName, time: Date.now(), updatedAt: Date.now(), date: new Date().toISOString().slice(0,10), privacy: "Public", boxOwner: owner, owner: owner, type: "comment" };
      try{ COMMENTS.unshift(m); }catch(e){}
      try{ localStorage.setItem("group_comments_" + owner, JSON.stringify(COMMENTS)); }catch(e){}
      try{ if(window._fbDb && owner) window._fbDb.ref("group_comments/" + owner + "/messages").set(COMMENTS); }catch(e){}
      inp.value = ""; if(popup) popup.value = "";
      try{ if(typeof closeCommentPopup==="function") closeCommentPopup(); }catch(e){}
      try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){}
    };
    window.saveTimelineComment = window.sendComment;
    window.sendCommentPopup = window.sendComment;
  }

  loadMyName();
  applyFix();
  // Main script agar baad me realNameFor ko wapas badle to ye dobara fix karega
  var n = 0;
  var iv = setInterval(function(){ applyFix(); loadMyName(); try{ if(typeof renderMessages==="function") renderMessages(); }catch(e){} n++; if(n>6) clearInterval(iv); }, 500);
})();