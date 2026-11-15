// datetime-all.js - Album + Profile + Timeline + Detail + Thinking + Message - sab ke liye Date-Time
// Ek hi file, sab file me kaam karega

function fmtDT(ts){
  try{
    var d = new Date(ts || Date.now());
    var dd = String(d.getDate()).padStart(2,"0");
    var mm = String(d.getMonth()+1).padStart(2,"0");
    var yy = d.getFullYear();
    var hh = String(d.getHours()).padStart(2,"0");
    var mi = String(d.getMinutes()).padStart(2,"0");
    return dd+"-"+mm+"-"+yy+"  "+hh+":"+mi;
  }catch(e){ return ""; }
}
function showDT(m){
  if(!m) return "";
  var t = m.time || m.createdAt || m.created || Date.now();
  var u = m.updatedAt || m.updated || m.editTime;
  if(u && u != t){ return "📅 "+fmtDT(t)+"  •  ✏️ Updated: "+fmtDT(u); }
  return "📅 "+fmtDT(t);
}
// Dikhane ke liye chhota HTML - har jagah same
function dtHTML(m){ return "<span style='font-size:11px;color:#888;'>"+showDT(m)+"</span><br>"; }
// Naya banane / Edit karne par time lagane ke liye
function setNewTime(m){ m.time = Date.now(); m.updatedAt = Date.now(); return m; }
function setUpdateTime(m){ m.updatedAt = Date.now(); return m; }
// Recycle Bin me bhi Date-Time dikhane ke liye
function dtText(m){ return showDT(m); }