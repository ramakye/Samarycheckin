// ============================================================
//  Samary Care — shared core (config + Firebase + helpers)
//  Your Firebase config lives HERE ONLY. Both index.html
//  (staff) and admin.html import from this file.
// ============================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCxLAQuXg_ULHpuFpfuORZxvAL4vtBU0cg",
  authDomain: "samary-time-logger.firebaseapp.com",
  projectId: "samary-time-logger",
  storageBucket: "samary-time-logger.firebasestorage.app",
  messagingSenderId: "183228495376",
  appId: "1:183228495376:web:949a9ed9f80c1a532dbc95"
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// shared shift-hours threshold for "forgotten checkout"
export const STALE_HOURS = 18;

// ---------- DOM helpers ----------
export const $ = id => document.getElementById(id);
export function showMsg(id, type, text){ const m=$(id); if(!m) return; m.className=`msg show ${type}`; m.innerHTML=text; }
export function clearMsg(id){ const m=$(id); if(m) m.className='msg'; }

// ---------- geo ----------
export function haversine(a,b,c,d){
  const R=6371000, toR=x=>x*Math.PI/180;
  const dLat=toR(c-a), dLng=toR(d-b);
  const x=Math.sin(dLat/2)**2+Math.cos(toR(a))*Math.cos(toR(c))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
export function getPos(){
  return new Promise((res,rej)=>{
    if(!navigator.geolocation) return rej("Geolocation not supported on this device.");
    navigator.geolocation.getCurrentPosition(
      p=>res({lat:p.coords.latitude,lng:p.coords.longitude,acc:p.coords.accuracy}),
      e=>rej(e.code===1?"Location permission denied. Please allow location access to check in.":"Couldn't get your location — try again outdoors."),
      {enableHighAccuracy:true,timeout:12000,maximumAge:0}
    );
  });
}

// ---------- PIN hashing ----------
export async function hashPin(name,pin){
  const enc=new TextEncoder().encode('samary::'+name.trim().toLowerCase()+'::'+pin);
  const buf=await crypto.subtle.digest('SHA-256',enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

// ---------- shared time maths ----------
export function calcHours(a,d){
  const[ah,am]=a.split(':').map(Number),[dh,dm]=d.split(':').map(Number);
  let m=(dh*60+dm)-(ah*60+am); if(m<0) m+=1440; return m/60;
}

// ---------- friendly error text ----------
export function friendlyErr(e){
  const code=(e&&e.code)||''; console.error(e);
  if(code.includes('permission-denied'))
    return `Permission denied by Firestore — either your account isn't recognised as an admin, or the security rules weren't published. Check the <code>admins</code> collection and the Rules tab.`;
  if(code.includes('unavailable')||code.includes('network'))
    return `Can't reach Firestore — check your internet connection and that the database is created.`;
  if(e&&/subtle|digest/i.test(e.message||''))
    return `Secure-context error: hashing needs HTTPS or localhost — fine on 127.0.0.1 and GitHub Pages, but not a plain file:// page.`;
  return `Error: ${code||(e&&e.message)||e}`;
}
