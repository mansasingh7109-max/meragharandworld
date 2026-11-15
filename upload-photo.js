<!DOCTYPE html>
<html lang="hi"><head><style>
@font-face {
  font-family: "Optimistic";
  font-style: normal;
  font-weight: 400 600;
  font-display: swap;
  src: url("/fonts/OptimisticAI_VF_Optimized.woff2") format("woff2");
}
@font-face {
  font-family: "Optimistic Mono";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/OptimisticMono_W_TextRegular.woff2") format("woff2");
}
:where(html) {
  font-family: "Optimistic", system-ui, sans-serif;
}
:where(code, pre, kbd, samp) {
  font-family: "Optimistic Mono", ui-monospace, monospace;
}
</style><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Photo Upload - Single / Multiple</title>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;font-family:Arial,sans-serif}
body{background:#fff8f0;padding:16px;max-width:600px;margin:0 auto}
h2{color:#e65100;margin-bottom:10px}
.box{background:#fff;border-radius:14px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
button{padding:10px 16px;border:none;border-radius:20px;font-weight:bold;cursor:pointer;margin:4px}
.btn-on{background:#e65100;color:#fff}
.btn-off{background:#eee;color:#333}
#preview{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
#preview img{width:100px;height:100px;object-fit:cover;border-radius:10px}
#list img{width:200px;max-width:65%;height:auto;object-fit:contain;display:block;margin:8px auto;border-radius:10px;background:#F48FB1}
.msg{background:#fff;border-radius:10px;padding:10px;margin:8px 0}
</style></head><body>
<h2>📸 Photo Upload - Alag File</h2>
<div class="box">
  <div>
    <button id="singleBtn" class="btn-on" onclick="setMode('single')">1 Photo - Single</button>
    <button id="multiBtn" class="btn-off" onclick="setMode('multiple')">Bahut Saari - Multiple</button>
  </div>
  <br>
  <button style="background:#e65100;color:#fff;width:100%" onclick="document.getElementById('photoFile').click()">📸 Photo Chuno</button>
  <input type="file" id="photoFile" accept="image/*" style="display:none">
  <div id="preview"></div>
  <div id="count" style="color:green;font-size:13px;"></div>
  <br>
  <!-- EK LINE SE SAVE - bas ye button dabao -->
  <button style="background:#25D366;color:#fff;width:100%;font-size:16px" onclick="savePhotos()">✅ Save Karo</button>
  <button style="background:#eee;width:100%" onclick="clearPreview()">❌ Cancel / Saaf Karo</button>
</div>
<h3 style="margin:14px 0 6px">Saved Photos 👇</h3>
<div id="list"></div>
<script>
var FIREBASE_CONFIG={apiKey:"AIzaSyApXIGoX071cYEvGbfhBF69DB9Kv5YlSMA",authDomain:"santramarketshoppingmall.firebaseapp.com",databaseURL:"https://santramarketshoppingmall-default-rtdb.firebaseio.com",projectId:"santramarketshoppingmall",storageBucket:"santramarketshoppingmall.firebasestorage.app",messagingSenderId:"398490252924",appId:"1:398490252924:web:4b6f73b48d28e1c23b7bf9",measurementId:"G-M3YK28NTT0"};
var _fbDb=null; try{firebase.initializeApp(FIREBASE_CONFIG); _fbDb=firebase.database();}catch(e){}
var _mode="single";
var _selected=[]; // yahan photo rakhi rehti hai, Save tak
function setMode(m){
  _mode=m;
  document.getElementById("singleBtn").className = m==="single" ? "btn-on" : "btn-off";
  document.getElementById("multiBtn").className = m==="multiple" ? "btn-on" : "btn-off";
  document.getElementById("photoFile").multiple = (m==="multiple");
  clearPreview();
}
function showPreview(){
  var p=document.getElementById("preview");
  p.innerHTML=_selected.map(function(u){return '<img src="'+u+'">';}).join("");
  document.getElementById("count").textContent = _selected.length ? "✅ "+_selected.length+" photo chuni - ab Save dabao" : "";
}
function clearPreview(){ _selected=[]; showPreview(); document.getElementById("photoFile").value=""; }
document.getElementById("photoFile").addEventListener("change", function(e){
  var files=e.target.files; if(!files||!files.length) return;
  if(_mode==="single"){ _selected=[]; } // Single me purani hat jayegi, Multiple me judti jayegi
  Array.prototype.forEach.call(files, function(f){
    var r=new FileReader();
    r.onload=function(){ _selected.push(r.result); showPreview(); };
    r.readAsDataURL(f);
  });
  e.target.value="";
});
// ==== EK LINE SE SAVE - yehi ek function sab karta hai ====
function savePhotos(){
  if(!_selected.length){ alert("Pehle Photo chuno!"); return; }
  var arr=[]; try{arr=JSON.parse(localStorage.getItem("group_msgs")||"[]");}catch(e){}
  _selected.forEach(function(u){
    arr.push({who:"Manisha", text:'<img src="'+u+'" style="width:200px;max-width:60%;border-radius:10px;">', time:Date.now(), updatedAt:Date.now(), type:"group_msg"});
  });
  localStorage.setItem("group_msgs", JSON.stringify(arr));
  try{ var u=localStorage.getItem("auth_uid")||"Manisha"; if(_fbDb) _fbDb.ref("group_msgs/"+u).set(arr); }catch(e){}
  _selected=[]; showPreview();
  showList();
  alert("✅ Save ho gaya! "+arr.length+" photo total");
}
function showList(){
  var arr=[]; try{arr=JSON.parse(localStorage.getItem("group_msgs")||"[]");}catch(e){}
  var box=document.getElementById("list");
  if(!arr.length){ box.innerHTML='<div style="color:#999;text-align:center">Koi photo nahi</div>'; return; }
  box.innerHTML="";
  arr.slice().reverse().forEach(function(m){
    var d=document.createElement("div"); d.className="msg"; d.innerHTML=m.text; box.appendChild(d);
  });
}
showList();
</script><script>(function(){var loc=location.href.replace(/#.*$/,"");var ATTR_NAMES=["data-product-id","data-productid","data-product_id","product-id","productid","product_id","data-source-entity-id","source-entity-id","source_entity_id","data-product","data-metadata","data-meta"];var DATASET_KEYS=["productId","productid","product_id","sourceEntityId","sourceentityid","source_entity_id","product","metadata","meta"];function readProductId(value){if(typeof value!=="string"||value.length===0)return null;if(/^[0-9]{6,}$/.test(value))return value;var match=value.match(/(?:product(?:_|-)?id|source(?:_|-)?entity(?:_|-)?id)["'=:\s]+([0-9]{6,})/i);return match?match[1]:null}function extractProductId(start){for(var node=start;node&&node!==document.body;node=node.parentElement){for(var i=0;i<ATTR_NAMES.length;i++){var attrValue=node.getAttribute&&node.getAttribute(ATTR_NAMES[i]);var attrProductId=readProductId(attrValue);if(attrProductId)return attrProductId}var dataset=node.dataset||null;if(dataset){for(var j=0;j<DATASET_KEYS.length;j++){var dataValue=dataset[DATASET_KEYS[j]];var dataProductId=readProductId(dataValue);if(dataProductId)return dataProductId}}}return null}function isInlineMediaSlotElement(node){return !!(node&&node.getAttribute&&node.getAttribute("data-clippy-inline-media-slot")!==null)}function findInlineMediaSlot(start){for(var node=start;node&&node!==document.body;node=node.parentElement){if(isInlineMediaSlotElement(node))return node}return null}function readInlineMediaUrl(node){if(!node)return null;return node.getAttribute&&((node.getAttribute("data-clippy-inline-media-url")||node.getAttribute("data-url")||node.getAttribute("data_url")))||node.href||null}function stripHash(url){return String(url).replace(/#.*$/,"")}function urlsMatch(a,b){if(!a||!b)return false;try{return stripHash(new URL(a,loc).href)===stripHash(new URL(b,loc).href)}catch(_){return stripHash(a)===stripHash(b)}}function isFirstPartyReelUrl(value){try{var url=new URL(value,loc);if(url.protocol!=="https:")return false;var host=url.hostname.toLowerCase();var supported=host==="instagram.com"||host.endsWith(".instagram.com")||host==="facebook.com"||host.endsWith(".facebook.com");return supported&&/\/reels?\//i.test(url.pathname)}catch(_){return false}}function isInlineMediaUrlClick(node,href){var slot=findInlineMediaSlot(node);if(!slot)return false;var slotUrl=readInlineMediaUrl(slot);if(slotUrl)return urlsMatch(href,slotUrl);return isFirstPartyReelUrl(href)}function findDataHref(start){for(var node=start;node&&node!==document.body;node=node.parentElement){if(node.getAttribute){var href=node.getAttribute("data-href")||node.getAttribute("data-url");if(href)return{href:href,node:node}}}return null}var nativeOpen=window.open;window.open=function(url){if(parent!==window&&typeof url==="string"&&/^https?:\/\//.test(url)){parent.postMessage({type:"ecto:usercontent-link-click",href:url},"*");return null}return nativeOpen?nativeOpen.apply(window,arguments):null};document.addEventListener("click",function(e){var target=e.target instanceof Element?e.target:null;if(!target)return;if(parent===window)return;var a=target.closest?target.closest("a[href]"):null;if(a&&a.href&&/^https?:\/\//.test(a.href)&&a.href.replace(/#.*$/,"")!==loc){if(isInlineMediaUrlClick(a,a.href))return;var productId=extractProductId(target)||extractProductId(a);if(productId){e.preventDefault();parent.postMessage({type:"ecto-artifact-link-click",productId:productId},"*");return}e.preventDefault();parent.postMessage({type:"ecto:usercontent-link-click",href:a.href},"*");return}var dataHref=findDataHref(target);if(dataHref&&/^https?:\/\//.test(dataHref.href)&&dataHref.href.replace(/#.*$/,"")!==loc){if(isInlineMediaUrlClick(dataHref.node,dataHref.href))return;e.preventDefault();parent.postMessage({type:"ecto:usercontent-link-click",href:dataHref.href},"*")}},true)})();</script><script>(function(){var FOCUS_TYPE="ecto:artifact-focus-request";var CLOSE_TYPE="ecto:artifact-close-request";function focusArtifactDocument(){var body=document.body;if(!body)return;try{window.focus();}catch(e){}if(!body.hasAttribute("tabindex"))body.setAttribute("tabindex","-1");try{body.focus({preventScroll:true});}catch(e){try{body.focus();}catch(e2){}}}window.addEventListener("message",function(event){if(event.source!==window.parent)return;var data=event.data;if(!data||typeof data!=="object"||data.type!==FOCUS_TYPE)return;if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",focusArtifactDocument,{once:true});return;}focusArtifactDocument();});window.addEventListener("keydown",function(event){if(event.key!=="Escape")return;window.setTimeout(function(){if(event.defaultPrevented)return;window.parent.postMessage({type:CLOSE_TYPE},"*");},0);});})();</script></body></html>