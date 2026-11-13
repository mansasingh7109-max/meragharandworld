// mydata.js - EK FILE, SAB HTML KE LIYE
// Kaam: Jiska login hai, uska data sirf uski ID se aayega.
// Dost ka data dost ki ID se aayega. Koi mix nahi hoga.

// 1. Login wale ki ID
window.myUid = localStorage.getItem("auth_uid") || "";

// Date + Time - har save / history / recycle ke liye
window.myDateTime = function(){
  var d = new Date();
  var dd = String(d.getDate()).padStart(2,"0");
  var mm = String(d.getMonth()+1).padStart(2,"0");
  var yy = d.getFullYear();
  var hh = String(d.getHours()).padStart(2,"0");
  var mi = String(d.getMinutes()).padStart(2,"0");
  return dd + "-" + mm + "-" + yy + " " + hh + ":" + mi;
};

// 2. Firebase ready hai ya nahi
function myDB(){
  if(window.firebase && firebase.database) return firebase.database();
  return null;
}

// 3. APNA Profile lao - sirf apni ID se
window.getMyProfile = function(cb){
  var db = myDB(); if(!db || !window.myUid){ cb({}); return; }
  db.ref("customer_profiles/"+window.myUid).once("value").then(function(s){
    cb(s.val()||{});
  }).catch(function(){ cb({}); });
};

// 4. APNA Album lao - sirf apni ID se
window.getMyAlbum = function(cb){
  var db = myDB(); if(!db || !window.myUid){ cb([]); return; }
  db.ref("customer_albums/"+window.myUid).once("value").then(function(s){
    var out=[]; var v=s.val()||{};
    Object.keys(v).forEach(function(k){
      var x=v[k];
      if(typeof x==="string") out.push(x);
      else if(x && x.url) out.push(x.url);
      else if(x && x.photo) out.push(x.photo);
    });
    cb(out);
  }).catch(function(){ cb([]); });
};

// 4B. DOST KA Album lao - dost ki ID se (UPDATE)
window.getFriendAlbum = function(friendUid, cb){
  var db = myDB(); if(!db || !friendUid){ cb([]); return; }
  db.ref("customer_albums/"+friendUid).once("value").then(function(s){
    var out=[]; var v=s.val()||{};
    Object.keys(v).forEach(function(k){
      var x=v[k];
      if(typeof x==="string") out.push(x);
      else if(x && x.url) out.push(x.url);
      else if(x && x.photo) out.push(x.photo);
    });
    cb(out);
  }).catch(function(){ cb([]); });
};

// 5. APNI Timeline lao - sirf apni ID se
window.getMyTimeline = function(cb){
  var db = myDB(); if(!db || !window.myUid){ cb([]); return; }
  db.ref("timeline/"+window.myUid).once("value").then(function(s){
    var out=[]; var v=s.val()||{};
    Object.keys(v).forEach(function(k){ out.push(v[k]); });
    cb(out);
  }).catch(function(){ cb([]); });
};

// 5B. DOST KI Timeline lao - dost ki ID se (UPDATE)
window.getFriendTimeline = function(friendUid, cb){
  var db = myDB(); if(!db || !friendUid){ cb([]); return; }
  db.ref("timeline/"+friendUid).once("value").then(function(s){
    var out=[]; var v=s.val()||{};
    Object.keys(v).forEach(function(k){ out.push(v[k]); });
    cb(out);
  }).catch(function(){ cb([]); });
};

// 6. FRIENDS lao - apne ko chhod ke, baaki sabki ID se
window.getFriends = function(cb){
  var db = myDB(); if(!db){ cb([]); return; }
  db.ref("customer_profiles").once("value").then(function(s){
    var out=[];
    s.forEach(function(ch){
      if(ch.key===window.myUid) return; // apne ko skip karo
      out.push({ uid: ch.key, data: ch.val()||{} });
    });
    cb(out);
  }).catch(function(){ cb([]); });
};

// 7. APNA Profile SAVE karo - UPDATE + HISTORY, overwrite nahi (UPDATE)
window.saveMyProfile = function(obj){
  var db = myDB(); if(!db || !window.myUid) return;
  obj = obj || {};
  // Pehli Gmail LOCK - kabhi change nahi hogi
  if(obj.first_email) delete obj.first_email;
  if(obj.firstEmail) delete obj.firstEmail;
  // Pehle purana data lao, phir history me daalo, phir update karo
  db.ref("customer_profiles/"+window.myUid).once("value").then(function(s){
    var old = s.val() || {};
    var dt = window.myDateTime();
    // Jo field badal raha hai, uski purani value history me
    Object.keys(obj).forEach(function(k){
      if(old[k] !== undefined && old[k] !== obj[k]){
        db.ref("history/"+window.myUid).push({
          field: k,
          old_value: old[k],
          new_value: obj[k],
          date_time: dt
        });
      }
    });
    obj.updated_at = dt;
    db.ref("customer_profiles/"+window.myUid).update(obj);
  });
};

// 8. APNA Album SAVE karo - hamesha apni ID ke neeche
window.saveMyAlbum = function(obj){
  var db = myDB(); if(!db || !window.myUid) return;
  db.ref("customer_albums/"+window.myUid).update(obj||{});
};

// 9. APNI Timeline SAVE karo
window.saveMyTimeline = function(obj){
  var db = myDB(); if(!db || !window.myUid) return;
  db.ref("timeline/"+window.myUid).update(obj||{});
};

// ===== 10. PRIVATE / PUBLIC + FOLLOW =====
window.setMyPrivacy = function(mode){
  var db = myDB(); if(!db || !window.myUid) return;
  db.ref("customer_profiles/"+window.myUid+"/privacy").set(mode==="private"?"private":"public");
};

window.getFriendProfile = function(friendUid, cb){
  var db = myDB(); if(!db || !friendUid){ cb(false, {}); return; }
  db.ref("customer_profiles/"+friendUid).once("value").then(function(s){
    var Q = s.val()||{};
    var privacy = Q.privacy || "public";
    if(privacy!=="private"){ cb(true, Q); return; }
    db.ref("follows/"+window.myUid+"/"+friendUid).once("value").then(function(f){
      if(f.val()){ cb(true, Q); }
      else { cb(false, Q); }
    }).catch(function(){ cb(false, Q); });
  }).catch(function(){ cb(false, {}); });
};

window.followUser = function(friendUid, cb){
  var db = myDB(); if(!db || !window.myUid || !friendUid){ if(cb) cb("Login nahi hai"); return; }
  db.ref("customer_profiles/"+friendUid+"/privacy").once("value").then(function(s){
    var privacy = s.val() || "public";
    if(privacy==="private"){
      db.ref("follow_requests/"+friendUid+"/"+window.myUid).set(true).then(function(){
        if(cb) cb("Follow Request bhej di! Accept hone ke baad profile dikhegi.");
      });
    } else {
      db.ref("follows/"+window.myUid+"/"+friendUid).set(true).then(function(){
        db.ref("followers/"+friendUid+"/"+window.myUid).set(true).then(function(){
          if(cb) cb("Follow ho gaya!");
        });
      });
    }
  });
};

window.acceptFollowRequest = function(requestUid, cb){
  var db = myDB(); if(!db || !window.myUid || !requestUid){ if(cb) cb("Error"); return; }
  db.ref("follows/"+requestUid+"/"+window.myUid).set(true).then(function(){
    db.ref("followers/"+window.myUid+"/"+requestUid).set(true).then(function(){
      db.ref("follow_requests/"+window.myUid+"/"+requestUid).remove().then(function(){
        if(cb) cb("Request Accept ho gayi!");
      });
    });
  });
};

// Reject - incoming request ke liye (UPDATE)
window.rejectFollowRequest = function(requestUid, cb){
  var db = myDB(); if(!db || !window.myUid || !requestUid){ if(cb) cb("Error"); return; }
  // Reject = Recycle Bin me jayega, Firebase se delete nahi hoga
  db.ref("recycle_bin/"+window.myUid).push({
    type: "follow_request_rejected",
    from_uid: requestUid,
    date_time: window.myDateTime()
  }).then(function(){
    db.ref("follow_requests/"+window.myUid+"/"+requestUid).remove().then(function(){
      if(cb) cb("Request Reject ho gayi!");
    });
  });
};

window.unfollowUser = function(friendUid, cb){
  var db = myDB(); if(!db || !window.myUid) return;
  db.ref("follows/"+window.myUid+"/"+friendUid).remove().then(function(){
    db.ref("followers/"+friendUid+"/"+window.myUid).remove().then(function(){
      if(cb) cb("Unfollow ho gaya");
    });
  });
};

window.isFollowing = function(friendUid, cb){
  var db = myDB(); if(!db || !window.myUid){ cb(false); return; }
  db.ref("follows/"+window.myUid+"/"+friendUid).once("value").then(function(s){ cb(!!s.val()); });
};

// ===== 11. ALAG-ALAG PRIVACY - Profile / Album / Timeline =====
window.setSectionPrivacy = function(section, mode){
  var db = myDB(); if(!db || !window.myUid) return;
  if(["profile","album","timeline"].indexOf(section)===-1) return;
  db.ref("customer_profiles/"+window.myUid+"/privacy_"+section).set(mode==="private"?"private":"public");
  if(section==="profile") db.ref("customer_profiles/"+window.myUid+"/privacy").set(mode==="private"?"private":"public");
};

window.canSeeSection = function(friendUid, section, cb){
  var db = myDB(); if(!db || !friendUid){ cb(false); return; }
  db.ref("customer_profiles/"+friendUid).once("value").then(function(s){
    var Q = s.val()||{};
    var privacy = Q["privacy_"+section] || Q.privacy || "public";
    if(privacy!=="private"){ cb(true); return; }
    db.ref("follows/"+window.myUid+"/"+friendUid).once("value").then(function(f){ cb(!!f.val()); }).catch(function(){ cb(false); });
  }).catch(function(){ cb(false); });
};