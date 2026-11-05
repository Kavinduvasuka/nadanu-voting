import { createClient } from '@supabase/supabase-js';
import './style.css';

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();
export const turnstileSiteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
export const configured = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)
  && (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key) || /^eyJ[A-Za-z0-9._-]+$/.test(key))
  && !/REPLACE|YOUR_/i.test(url + key);
export const supabase = configured ? createClient(url, key, {
  auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}
}):null;
export const CATS = [
  {slug:'solo-singing',name:'SOLO SINGING',num:'01',symbol:'✦',sub:'The voices that move us'},
  {slug:'solo-dancing',name:'SOLO DANCING',num:'02',symbol:'✳',sub:'One dancer. All the energy.'},
  {slug:'group-dancing',name:'GROUP DANCING',num:'03',symbol:'★',sub:'One crew. One stage. All in.'},
];
export const placeholders = [
  {id:'demo1',category_slug:'solo-singing',name:'THE NEXT VOICE',stage_name:'SOLO SINGING FINALIST',performance_title:'Your finalist goes here',sort_order:1,demo:true},
  {id:'demo2',category_slug:'solo-singing',name:'THE SPOTLIGHT',stage_name:'SOLO SINGING FINALIST',performance_title:'Your finalist goes here',sort_order:2,demo:true},
  {id:'demo3',category_slug:'solo-dancing',name:'THE SOLO ACT',stage_name:'SOLO DANCING FINALIST',performance_title:'Your finalist goes here',sort_order:1,demo:true},
  {id:'demo4',category_slug:'solo-dancing',name:'THE SHOWSTOPPER',stage_name:'SOLO DANCING FINALIST',performance_title:'Your finalist goes here',sort_order:2,demo:true},
  {id:'demo5',category_slug:'group-dancing',name:'THE MOVEMENT',stage_name:'GROUP DANCING FINALIST',performance_title:'Your finalist goes here',sort_order:1,demo:true},
  {id:'demo6',category_slug:'group-dancing',name:'THE CREW',stage_name:'GROUP DANCING FINALIST',performance_title:'Your finalist goes here',sort_order:2,demo:true},
];
export function safe(str=''){return String(str ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export function logo(){return `<a class="brand" href="./index.html" aria-label="Nadanu 3.0 home"><img src="${import.meta.env.BASE_URL}nadanu-logo.png" alt="Nadanu Dare to Dazzle"/><span><strong>NADANU 3.0</strong><small>DARE TO DAZZLE</small></span></a>`;}
export function footer(){return `<footer class="footer"><div class="footer-stripe"></div><div class="footer-inner"><span>© 2026 COMPUTING SOCIETY OF ICBT</span><span>FEEL THE BEAT. OWN THE STAGE.</span><div class="social"><a href="https://www.instagram.com/csoficbt" target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a><a href="https://www.tiktok.com/@csoficbt" target="_blank" rel="noopener noreferrer">TIKTOK ↗</a></div></div></footer>`;}
export function setNotice(text,type='info') { const el=document.getElementById('notice'); if(!el) return; el.textContent=text; el.className=`notice ${type}`; el.hidden=false; }
export function getBrowserToken(){let k='nadanu_voter_device_v1';let t=localStorage.getItem(k);if(!t){t=crypto.randomUUID();localStorage.setItem(k,t);}return t;}
