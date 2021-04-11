// $Revision$

var chrsz   = 8;
var hexcase = 0;
var max_retlen = 66560;

function safe_add(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

function rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

function md4_cmn(q, a, b, x, s, t) {
  return safe_add(rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}

function md4_ff(a, b, c, d, x, s) {
  return md4_cmn((b & c) | ((~b) & d), a, 0, x, s, 0);
}

function md4_gg(a, b, c, d, x, s) {
  return md4_cmn((b & c) | (b & d) | (c & d), a, 0, x, s, 1518500249);
}

function md4_hh(a, b, c, d, x, s) {
  return md4_cmn(b ^ c ^ d, a, 0, x, s, 1859775393);
}

function core_md4(x, len) {
  x[len >> 5] |= 0x80 << (len % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  for(var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    a = md4_ff(a, b, c, d, x[i+ 0], 3 );
    d = md4_ff(d, a, b, c, x[i+ 1], 7 );
    c = md4_ff(c, d, a, b, x[i+ 2], 11);
    b = md4_ff(b, c, d, a, x[i+ 3], 19);
    a = md4_ff(a, b, c, d, x[i+ 4], 3 );
    d = md4_ff(d, a, b, c, x[i+ 5], 7 );
    c = md4_ff(c, d, a, b, x[i+ 6], 11);
    b = md4_ff(b, c, d, a, x[i+ 7], 19);
    a = md4_ff(a, b, c, d, x[i+ 8], 3 );
    d = md4_ff(d, a, b, c, x[i+ 9], 7 );
    c = md4_ff(c, d, a, b, x[i+10], 11);
    b = md4_ff(b, c, d, a, x[i+11], 19);
    a = md4_ff(a, b, c, d, x[i+12], 3 );
    d = md4_ff(d, a, b, c, x[i+13], 7 );
    c = md4_ff(c, d, a, b, x[i+14], 11);
    b = md4_ff(b, c, d, a, x[i+15], 19);
    a = md4_gg(a, b, c, d, x[i+ 0], 3 );
    d = md4_gg(d, a, b, c, x[i+ 4], 5 );
    c = md4_gg(c, d, a, b, x[i+ 8], 9 );
    b = md4_gg(b, c, d, a, x[i+12], 13);
    a = md4_gg(a, b, c, d, x[i+ 1], 3 );
    d = md4_gg(d, a, b, c, x[i+ 5], 5 );
    c = md4_gg(c, d, a, b, x[i+ 9], 9 );
    b = md4_gg(b, c, d, a, x[i+13], 13);
    a = md4_gg(a, b, c, d, x[i+ 2], 3 );
    d = md4_gg(d, a, b, c, x[i+ 6], 5 );
    c = md4_gg(c, d, a, b, x[i+10], 9 );
    b = md4_gg(b, c, d, a, x[i+14], 13);
    a = md4_gg(a, b, c, d, x[i+ 3], 3 );
    d = md4_gg(d, a, b, c, x[i+ 7], 5 );
    c = md4_gg(c, d, a, b, x[i+11], 9 );
    b = md4_gg(b, c, d, a, x[i+15], 13);
    a = md4_hh(a, b, c, d, x[i+ 0], 3 );
    d = md4_hh(d, a, b, c, x[i+ 8], 9 );
    c = md4_hh(c, d, a, b, x[i+ 4], 11);
    b = md4_hh(b, c, d, a, x[i+12], 15);
    a = md4_hh(a, b, c, d, x[i+ 2], 3 );
    d = md4_hh(d, a, b, c, x[i+10], 9 );
    c = md4_hh(c, d, a, b, x[i+ 6], 11);
    b = md4_hh(b, c, d, a, x[i+14], 15);
    a = md4_hh(a, b, c, d, x[i+ 1], 3 );
    d = md4_hh(d, a, b, c, x[i+ 9], 9 );
    c = md4_hh(c, d, a, b, x[i+ 5], 11);
    b = md4_hh(b, c, d, a, x[i+13], 15);
    a = md4_hh(a, b, c, d, x[i+ 3], 3 );
    d = md4_hh(d, a, b, c, x[i+11], 9 );
    c = md4_hh(c, d, a, b, x[i+ 7], 11);
    b = md4_hh(b, c, d, a, x[i+15], 15);
    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);
}

function binl2hex(binarray) {
  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for(var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

function str2binl(str) {
  var bin = Array();
  var mask = (1 << chrsz) - 1;
  for(var i = 0; i < str.length * chrsz; i += chrsz)
    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
  return bin;
}

function hex_md4(s) {
  return binl2hex(core_md4(str2binl(s), s.length * chrsz));
}

function saveUserData(objStoreElemName, objDataName, iExpiryMin) {
  var oTimeNow = new Date();
  oTimeNow.setMinutes(oTimeNow.getMinutes() + iExpiryMin);
  var sExpirationDate = oTimeNow.toUTCString();
  objStoreElemName.expires = sExpirationDate;
  document.all[objStoreElemName].save(objDataName);
}

function addUserDataElement(objStoreElemName, objUElemName, objUElemValue){
  document.all[objStoreElemName].setAttribute(objUElemName, objUElemValue);
}

function loadUserData(objStoreElemName, objDataName){
  document.all[objStoreElemName].load(objDataName);
  document.all[objStoreElemName].innerText=objDataName;
}

function getUserDataElement(objStoreElemName, objElemName){
  var res= document.all[objStoreElemName].getAttribute(objElemName);
  return res;
}

function supportsUserData() {
  var v = navigator.appVersion.substring(0, 1);
  var a = navigator.userAgent.toLowerCase();
  var p = navigator.platform.toLowerCase();
  // return true if it's msie and not opera on winows platform
  if((navigator.appName == "Microsoft Internet Explorer") &&
     ((v == "4") || (v == "5") || (v == "6") || (v == "7")) &&
     (a.indexOf("msie") != -1) &&
     (a.indexOf("opera") == -1) &&
     (p.indexOf("win") != -1)) {
    return true;
  } else {
    return false;
  }
}

function shiftD(d) {
  d = d>>1;
  if(d == 0) {
    return 1;
  }
  return d;
}

function generateBid(id) {
  var d = parseInt(id, 16);
  var ret = "";

  if(d&0x01) {
     ret += navigator.appCodeName;
  }
  d = shiftD(d);
  if(d&0x01) {
     ret += navigator.appName;
  }
  d = shiftD(d);
  if(d&0x01) {
     ret += navigator.appVersion;
  }
  d = shiftD(d);
  if(d&0x01) {
     ret += navigator.language;
  }
  d = shiftD(d);
  if(d&0x01) {
     ret += navigator.platform;
  }
  d = shiftD(d);
  if(d&0x01) {
     ret += navigator.userAgent;
  }

  for(var i = 0; i < navigator.mimeTypes.length; i++) {
    d = shiftD(d);
    if(d&0x01) {
      ret += navigator.mimeTypes[i].type;
    }
    d = shiftD(d);
    if(d&0x01) {
      ret += navigator.mimeTypes[i].suffixes;
    }
    d = shiftD(d);
    if(d&0x01) {
      ret += navigator.mimeTypes[i].description;
    }
    if(ret.lenth > max_retlen) {
      break;
    }
  }

  for(var i = 0; i < navigator.plugins.length; i++) {
    d = shiftD(d);
    if(d&0x01) {
      ret += navigator.plugins[i].name;
    }
    d = shiftD(d);
    if(d&0x01) {
      ret += navigator.plugins[i].description;
    }
    d = shiftD(d);
    if(d&0x01) {
      ret += navigator.plugins[i].filename;
    }
    if(ret.lenth > max_retlen) {
      break;
    }
  }
  return hex_md4(ret);
}

function getBid(id) {
  if(supportsUserData()) {
    var bid = "IEfO2fdnwkdwYEjCve";
    return bid;
  } else {
    return generateBid(id);
  }
}

function writeBid(id, bid) {
  // use the same timeout settings as used for the client data store
  var timeout = 1000;
  var i_id = "IE" + id;
  try {
    addUserDataElement('sesUserData', i_id, bid);
    saveUserData('sesUserData', i_id, timeout);
  } catch(e) {
    // fallback
    return generateBid(id);
  }
  return bid;
}

function readBid(id) {
  var i_id = "IE" + id;
  var bid = "";
  try {
    loadUserData('sesUserData', i_id);
    bid = getUserDataElement('sesUserData', i_id);
  } catch(e) {
    // fallback
    return generateBid(id);
  }
  return bid;
}

function sesStart(loginform) {
  if("fO2fdnwkdwYEjCve".length == 0) {
    // browser id has already been set
    return;
  }

  // get the login form
  var formlist = document.getElementsByName(loginform);

  // create browser id
  var bid = getBid('8C3C82CB56AE');

  // store browser id if possible
  if(supportsUserData()) {
    bid = writeBid('8C3C82CB56AE', bid);
  }

  if(formlist && formlist.length) {
    var ac = formlist[0].getAttribute("action");
    if(ac) {
      // set new action
      if(ac.indexOf("?") == -1) {
        var nac = ac + "?8C3C82CB56AE=" + bid;
        formlist[0].setAttribute("action", nac);
      } else {
        var nac = ac + "&8C3C82CB56AE=" + bid;
        formlist[0].setAttribute("action", nac);
      }
    }
  }
}
