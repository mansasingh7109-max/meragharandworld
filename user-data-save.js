/* user-data-save.js - HAMESHA sahi user ka data Firebase + Website me save karega */
(function(){
  function q(k){ try{ return new URLSearchParams(location.search).get(k)||""; }catch(e){ return ""; } }
  function myUid(){ return q("login")||q("me")||localStorage.getItem("auth_uid")||localStorage.getItem("MY_OWN_UID")||""; }
  /* owner = ?uid= wala. Agar uid nahi hai to login wala = apni Timeline */
  function ownerUid(){ return q("uid")||q("cid")||q("owner")||q("id")||q("page")||sessionStorage.getItem("VIEW_OWNER_UID")||myUid(); }
  function myName(){
    try{ var PP=JSON.parse(localStorage.getItem("my_profile")||"{}"); var n=PP.profileName||PP.name||""; if(n) return n; }catch(e){}
    return localStorage.getItem("my_name")||localStorage.getItem("customer_name")||"";
  }
  function key(b){ return b+"_"+(ownerUid()||"me"); }
  function save(base, arr){
    try{ localStorage.setItem(key(base), JSON.stringify(arr||[])); }catch(e){}
    try{ if(window._fbDb && ownerUid()){ if(base==="group_msgs"||base==="group_comments") window._fbDb.ref(base+"/"+ownerUid()+"/messages").set(arr||[]); else window._fbDb.ref(base+"/"+ownerUid()).set(arr||[]); } }catch(e){}
    return arr;
  }
  function load(base){ try{ var v=localStorage.getItem(key(base)); if(v) return JSON.parse(v); }catch(e){} return []; }
  function saveComment(text, photo, video, tag){
    var arr = load("group_comments");
    var nm = myName();
    arr.unshift({ text:text||"", photo:photo||"", video:video||"", tag:tag||"", senderUid:myUid(), senderName:nm, who:nm, name:nm, time:Date.now(), date:new Date().toISOString().slice(0,10), privacy:"Public", boxOwner:ownerUid(), owner:ownerUid() });
    save("group_comments", arr);
    return arr;
  }
  function saveProfile(P){
    try{ if(P) localStorage.setItem("my_profile", JSON.stringify(P)); }catch(e){}
    try{ if(window._fbDb && myUid()) window._fbDb.ref("customer_profiles/"+myUid()).update(P); }catch(e){}
  }
  window.UDSAVE = { myUid:myUid, ownerUid:ownerUid, key:key, save:save, load:load, saveComment:saveComment, saveProfile:saveProfile };
})();