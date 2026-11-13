// block-check.js - Blocked user ko rokne ke liye
// index.html aur friends.html me <script src="block-check.js"></script> add karo
(function(){
function checkBlocked(){
try{
var _p=JSON.parse(localStorage.getItem("customer_profile")||"{}");
var _ph=_p.profilePhone||_p.phone||"";
var _nm=_p.profileName||_p.name||"";
if(!_ph && !_nm) return; // login nahi kiya to check mat karo
if(!window._fbDb && !window.firebase){ return; }
var _db=window._fbDb||(window.firebase?firebase.database():null);
if(!_db) return;
// phone se dhoondo
if(_ph){
_db.ref("customer_profiles").orderByChild("profilePhone").equalTo(_ph).once("value",function(snap){
snap.forEach(function(ch){
var _v=ch.val()||{};
if(_v.blocked){
alert("🔴 Tum BLOCK ho gaye ho!\nAdmin se sampark karo.");
try{localStorage.removeItem("customer_logged_in");}catch(e){}
location.href="index.html";
}
});
});
}
}catch(e){ console.log("block-check:",e); }
}
// page load par 2 second baad check karo (Firebase load hone do)
setTimeout(checkBlocked,2000);
})();