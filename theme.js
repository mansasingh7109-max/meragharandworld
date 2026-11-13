// theme.js - Clean, NO popup
(function(){
var DEF={font:"Arial",fontSize:"16",txtColor:"#333333",fStyle:"normal",hText:"Hamare Dost",hColor:"#e65100",hSize:"22",hStyle:"bold",bgColor:"#fff8f0",bgImg:"",bgVideo:"",btnColor:"#25D366",btnText:"💬 Chat",cardBg:"#ffffff",hdrColor:"#e65100",darkMode:false};
function G(){try{var s=JSON.parse(localStorage.getItem("site_theme")||"{}");for(var k in DEF)if(s[k]===undefined)s[k]=DEF[k];return s;}catch(e){var n={};for(var k in DEF)n[k]=DEF[k];return n;}}
function A(){
var t=G();
var s=document.getElementById("wtheme-style");
if(!s){s=document.createElement("style");s.id="wtheme-style";document.head.appendChild(s);}
var c="body{font-family:'"+t.font+"',sans-serif!important;font-size:"+t.fontSize+"px!important;background-color:"+t.bgColor+"!important;color:"+t.txtColor+"!important;font-weight:"+(t.fStyle==="bold"?"bold":"normal")+"!important;font-style:"+(t.fStyle==="italic"?"italic":"normal")+"!important;";
if(t.bgImg)c+="background-image:url('"+t.bgImg+"')!important;background-size:cover!important;background-attachment:fixed!important;";
c+="}";
c+="h1,h2,.sec h2{color:"+t.hColor+"!important;font-size:"+t.hSize+"px!important;font-weight:"+(t.hStyle==="bold"?"bold":"normal")+"!important;font-style:"+(t.hStyle==="italic"?"italic":"normal")+"!important;}";
c+=".sendbtn,.accbtn,.chatbtn{background:"+t.btnColor+"!important;}";
c+=".mycard,.fcard,.detail-card{background:"+t.cardBg+"!important;}";
c+="#hdr,.admin-header{background:"+t.hdrColor+"!important;}";
if(t.darkMode)c+="body{filter:invert(1) hue-rotate(180deg);}img,video{filter:invert(1) hue-rotate(180deg);}";
s.innerHTML=c;
var old=document.getElementById("wtheme-bgvideo");
if(old)old.remove();
if(t.bgVideo){
var v=document.createElement("video");
v.id="wtheme-bgvideo";v.src=t.bgVideo;v.autoplay=true;v.loop=true;v.muted=true;
v.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:-1;opacity:0.5;";
document.body.prepend(v);
}
}
setTimeout(A,800);
setTimeout(function(){
if(document.getElementById("wtheme-btn"))return;
var b=document.createElement("a");
b.id="wtheme-btn";b.innerHTML="🎨";b.href="theme.html";
b.style.cssText="position:fixed;bottom:20px;right:20px;width:52px;height:52px;border-radius:50%;background:#e65100;color:#fff;font-size:24px;z-index:99998;box-shadow:0 4px 12px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;text-decoration:none;";
document.body.appendChild(b);
},1200);
})();