// hide-words.js V4 - FINAL
// Rule: List = sab kuch list hai, sirf Detail/Popup me phone dikhega
// UID / Firebase / 【entity-GitHub¦canonical_name=GitHub】 - kahin nahi dikhega
(function(){
  function isInDetail(el){
    if(!el) return false;
    var p = el;
    while(p && p !== document.body){
      var id = (p.id||"").toLowerCase();
      var cn = (typeof p.className==="string"?p.className:"").toLowerCase();
      if(/detail|friend-view|friendview|friend-profile|friendprofile|popup|modal|detailbox|profile-detail/.test(id+" "+cn)) return true;
      p = p.parentElement;
    }
    var path = (location.pathname||"").toLowerCase();
    if(path.indexOf("friend-view")!==-1 || path.indexOf("friend-profile")!==-1 || path.indexOf("friendprofile")!==-1) return true;
    return false;
  }
  function isUidToken(s){
    if(!s) return false;
    s=String(s).trim();
    if(s.length<15) return false;
    if(!/[a-zA-Z]/.test(s)) return false;
    if(!/[0-9]/.test(s)) return false;
    if(/^[0-9]{10}$/.test(s)) return false;
    return true;
  }
  function cleanNode(node){
    var t=node.nodeValue||"";
    if(!t) return;
    var detail=isInDetail(node.parentElement);
    var inList=!detail;
    var parts=t.split(/(\s+)/);
    var changed=false;
    for(var i=0;i<parts.length;i++){
      var w=parts[i];
      if(!w||/^\s+$/.test(w)) continue;
      if(isUidToken(w)||w.indexOf("Firebase")!==-1||w.indexOf("【entity-GitHub¦canonical_name=GitHub】")!==-1||w==="UID"||w==="uid"){ parts[i]=""; changed=true; continue; }
      if(inList){
        var d=w.replace(/[^0-9]/g,"");
        if(d.length===10 || (d.length===12 && d.indexOf("91")===0)){
          parts[i]=""; changed=true; continue;
        }
      }
    }
    if(changed){
      var out=parts.join("").replace(/\s*•\s*$/,"").replace(/[ ]{2,}/g," ").trim();
      node.nodeValue=out;
    }
  }
  function cleanAll(){
    try{
      var walker=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var n; while(n=walker.nextNode()){ cleanNode(n); }
    }catch(e){}
    try{
      var all=document.querySelectorAll(".fr,.st,.phone,.role,.num");
      for(var i=0;i<all.length;i++){
        if(isInDetail(all[i])) continue;
        var tx=(all[i].textContent||"").trim().replace(/[^0-9]/g,"");
        if(tx.length===10 || tx.length===12){
          all[i].textContent="";
          all[i].style.display="none";
        }
      }
    }catch(e){}
  }
  function run(){ cleanAll(); }
  document.addEventListener("DOMContentLoaded",function(){ run(); setTimeout(run,300); setTimeout(run,1000); });
  try{ var obs=new MutationObserver(function(){ run(); }); obs.observe(document.documentElement,{childList:true,subtree:true,characterData:true}); }catch(e){}
  setInterval(run,500);
})();