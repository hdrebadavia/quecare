import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, Bell, CalendarDays, ChevronDown, CircleHelp, ClipboardList, HeartPulse, LayoutDashboard, LogOut, Menu, Monitor, Plus, Search, Settings2, ShieldCheck, Sparkles, Users, X } from 'lucide-react';
import { api, setCsrf, today, dateLabel } from './api';
import { Badge, ErrorBox, Field, Form, Loading, Modal, PageTitle, ProfileFields, profileData, useLoad, value, type Context, type Facility, type User } from './ui';
import { Dashboard, QueueWorkspace, MonitorView } from './Queues';
import { PatientHome, JoinPage, TrackPage } from './Patients';
import { Activities, Bookings } from './Bookings';
import { HealthUnits } from './HealthUnits';
import { Administration, Reports, Directory, Records, Assistant } from './Workspace';

const nav=[{id:'overview',label:'Overview',icon:LayoutDashboard},{id:'queues',label:'Live queues',icon:Activity},{id:'activities',label:'Activities & booking',icon:CalendarDays},{id:'bookings',label:'Appointments',icon:ClipboardList},{id:'records',label:'Patient records',icon:Users},{id:'directory',label:'Service directory',icon:HeartPulse},{id:'reports',label:'Reports & insights',icon:Activity},{id:'admin',label:'Administration',icon:Settings2}];
export default function App(){
  const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false),[page,setPage]=useState('overview'),[facilityId,setFacilityId]=useState(localStorage.getItem('quecare-facility')||''),[login,setLogin]=useState(false),[revision,setRevision]=useState(0),[toast,setToast]=useState<{message:string;error:boolean}|null>(null),[mobileNav,setMobileNav]=useState(false),[assistant,setAssistant]=useState(false);
  const {data:facilities,error}=useLoad<Facility[]>('/facilities',revision);const {data:config}=useLoad('/config');
  const params=new URLSearchParams(location.search);const join=params.get('join'),track=params.get('track'),monitor=params.get('monitor'),reset=params.get('reset');
  const notify=(message:string,error=false)=>setToast({message,error});
  async function refreshUser(){try{const me=await api('/auth/me');setUser(me.user);setCsrf(me.csrf||'');if(me.user?.facility_id)setFacilityId(me.user.facility_id);}catch(e){notify((e as Error).message,true);}finally{setReady(true);}}
  useEffect(()=>{void refreshUser();},[]);
  useEffect(()=>{if(toast){const id=setTimeout(()=>setToast(null),6000);return()=>clearTimeout(id);}},[toast]);
  const facility=facilities?.find(f=>f.id===facilityId)||facilities?.[0];
  useEffect(()=>{if(!facilities)return;const id=facility?.id||'';if(id!==facilityId)setFacilityId(id);if(id)localStorage.setItem('quecare-facility',id);else localStorage.removeItem('quecare-facility');},[facilities,facility?.id,facilityId]);
  const navigate=(id:string)=>{setPage(id);setMobileNav(false);};
  if(!ready||!facilities)return <div className="boot"><Brand/><ErrorBox message={error}/><Loading/></div>;
  if(!facility)return <div className="boot"><Brand/><h1>No Health Units configured</h1>{user?.role==='system_admin'?<HealthUnits reload={revision} onChange={()=>setRevision(r=>r+1)} notify={notify}/>:<p>A system administrator needs to add a Health Unit before services are available.</p>}{!user?<button className="button primary" onClick={()=>setLogin(true)}>Sign in / Register</button>:<button className="button secondary" onClick={async()=>{await api('/auth/logout','POST',{});setUser(null);setCsrf('');}}>Sign out</button>}{login&&<AuthModal onClose={()=>setLogin(false)} onSuccess={async()=>{await refreshUser();setLogin(false);setRevision(r=>r+1);}} demo={config?.demo}/>}</div>;
  const ctx:Context={user,facility,notify,reload:revision,bump:()=>setRevision(r=>r+1),navigate,selectFacility:setFacilityId};
  const isStaff=!!user&&user.role!=='patient',isAdmin=!!user&&['system_admin','facility_admin'].includes(user.role);
  const visibleNav=nav.filter(n=>!(n.id==='admin'||n.id==='reports')||isAdmin).filter(n=>n.id!=='records'||user?.role==='provider'||user?.role==='patient').filter(n=>isStaff||!['queues','overview'].includes(n.id));
  if(monitor)return <><MonitorView facilityId={monitor} user={user}/>{!user&&<AuthModal onClose={()=>location.assign('/')} onSuccess={refreshUser} demo={config?.demo}/>}</>;
  return <div className={`app ${!isStaff?'patient-mode':''}`}>
    <aside className={`sidebar ${mobileNav?'mobile-open':''}`}><div className="sidebar-top"><Brand/><button className="icon-button mobile-close" onClick={()=>setMobileNav(false)} aria-label="Close menu"><X size={20}/></button></div><div className="workspace-label">{isStaff?'CARE TEAM WORKSPACE':'YOUR HEALTH, CONNECTED'}</div><nav>{!isStaff&&<button onClick={()=>navigate('home')} className={page==='home'||page==='overview'?'active':''}><LayoutDashboard size={19}/>My care hub<span className="nav-active-dot"/></button>}{visibleNav.map(n=><button key={n.id} className={page===n.id?'active':''} onClick={()=>navigate(n.id)}><n.icon size={19}/>{n.label}{page===n.id&&<span className="nav-active-dot"/>}{n.id==='queues'&&<span className="live-small"/>}</button>)}</nav><div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={21}/></div><strong>A little help, anytime.</strong><p>Find services and answers before your next visit.</p><button onClick={()=>setAssistant(true)}>Ask QueCare <ArrowUpRight size={15}/></button></div><div className="sidebar-footer"><ShieldCheck size={15}/><span>Built for better community care</span></div></div></aside>
    {mobileNav&&<div className="nav-overlay" onClick={()=>setMobileNav(false)}/>}
    <div className="app-body"><header className="topbar"><button className="icon-button menu-toggle" onClick={()=>setMobileNav(true)} aria-label="Open navigation"><Menu size={21}/></button><div className="facility-switch"><span className="facility-icon"><HeartPulse size={20}/></span><div><small>YOUR HEALTH UNIT</small><select aria-label="Health Unit" value={facility.id} onChange={e=>setFacilityId(e.target.value)} disabled={!!join||!!track||(isStaff&&user.role!=='system_admin')}>{facilities.map(f=><option value={f.id} key={f.id}>{f.name}</option>)}</select></div><ChevronDown size={15}/></div><div className="topbar-right"><span className="topbar-date">{dateLabel(today())}</span><span className="divider"/><button className="icon-button" onClick={()=>{notify(facility.announcement||'No new facility announcements.');}} aria-label="Facility announcements"><Bell size={20}/><i className="notification-dot"/></button>{user?<><div className="avatar">{user.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div><div className="user-label"><strong>{user.name}</strong><small>{({system_admin:'System administrator',facility_admin:'Facility administrator',queue_officer:'Queue officer',provider:'Healthcare provider',patient:'Patient'} as any)[user.role]}</small></div><button className="icon-button" title="Sign out" onClick={async()=>{await api('/auth/logout','POST',{});setUser(null);setCsrf('');setPage('home');ctx.bump();}}><LogOut size={17}/></button></>:<button className="button primary small" onClick={()=>setLogin(true)}>Sign in / Register</button>}</div></header>
      <main className="main-content">{join?<JoinPage ctx={ctx} token={join} signIn={()=>setLogin(true)}/>:track?<TrackPage ctx={ctx} token={track}/>:<>
        {(page==='overview'||page==='home')&&(isStaff?<Dashboard ctx={ctx}/>:<PatientHome ctx={ctx} signIn={()=>setLogin(true)}/>)}
        {page==='queues'&&isStaff&&<QueueWorkspace ctx={ctx}/>}
        {page==='activities'&&<Activities ctx={ctx} signIn={()=>setLogin(true)}/>}
        {page==='bookings'&&<Bookings ctx={ctx} signIn={()=>setLogin(true)}/>}
        {page==='records'&&user&&<Records ctx={ctx} facilities={facilities}/>}
        {page==='directory'&&<Directory ctx={ctx}/>}
        {page==='reports'&&isAdmin&&<Reports ctx={ctx}/>}
        {page==='admin'&&isAdmin&&<Administration ctx={ctx}/>}
      </>}<footer className="content-footer"><span><HeartPulse size={14}/> QueCare · Meycauayan City</span><span>Primary care. Connected communities.</span></footer></main>
    </div><button className="assistant-fab" onClick={()=>setAssistant(true)} aria-label="Ask QueCare"><Sparkles size={20}/><span>Ask QueCare</span></button>
    {login&&<AuthModal onClose={()=>setLogin(false)} onSuccess={async()=>{await refreshUser();setLogin(false);setRevision(r=>r+1);}} demo={config?.demo}/>}
    {reset&&<Modal title="Choose a new password" onClose={()=>location.assign('/')}><Form label="Reset password" onSubmit={async d=>{await api('/auth/reset','POST',{token:reset,password:value(d,'password')});notify('Password updated. You can now sign in.');history.replaceState(null,'','/');setLogin(true);ctx.bump();}}><Field label="New password (at least 10 characters)"><input name="password" type="password" minLength={10} maxLength={128} required/></Field></Form></Modal>}
    {assistant&&<Assistant ctx={ctx} onClose={()=>setAssistant(false)}/>}
    {toast&&<div role="status" className={`toast ${toast.error?'error':''}`}><span>{toast.message}</span><button className="icon-button" onClick={()=>setToast(null)} aria-label="Dismiss"><X size={16}/></button></div>}
  </div>;
}
export function Brand(){return <a href="/" className="brand"><span className="brand-mark"><HeartPulse size={25} strokeWidth={2.3}/></span><span>Que<span>Care</span><small>COMMUNITY HEALTH, CONNECTED</small></span></a>;}
function AuthModal({onClose,onSuccess,demo}:{onClose:()=>void;onSuccess:()=>Promise<void>;demo:boolean}){
  const [mode,setMode]=useState('login'),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  return <Modal title={mode==='login'?'Welcome back':mode==='register'?'Create your patient account':'Reset your password'} onClose={onClose}>
    <p className="muted">{mode==='login'?'Your next step to simpler, connected care.':mode==='register'?'Your account works across all participating Health Units.':'We’ll send a secure password reset link.'}</p>
    <Form label={mode==='login'?'Sign in':mode==='register'?'Create account':'Send reset link'} onSubmit={async d=>{if(mode==='login'){await api('/auth/login','POST',{email:value(d,'email'),password:value(d,'password')});await onSuccess();}else if(mode==='register'){await api('/auth/register','POST',{...profileData(d),email:value(d,'email'),password:value(d,'password')});await onSuccess();}else{const r=await api('/auth/reset-request','POST',{email:value(d,'email')});setError(r.message);}}}>
      {mode==='register'&&<ProfileFields/>}<Field label="Email address"><input name="email" type="email" required placeholder="you@example.com" autoComplete="email"/></Field>{mode!=='reset'&&<Field label={mode==='register'?'Password · at least 10 characters':'Password'}><input name="password" type="password" required minLength={mode==='register'?10:1} maxLength={128} autoComplete={mode==='register'?'new-password':'current-password'}/></Field>}
    </Form><div className="auth-links"><button onClick={()=>setMode(mode==='register'?'login':'register')}>{mode==='register'?'Already registered? Sign in':'Create a patient account'}</button><button onClick={()=>setMode(mode==='reset'?'login':'reset')}>{mode==='reset'?'Back to sign in':'Forgot password?'}</button></div><p className="muted">{error}</p>
    {demo&&mode==='login'&&<div className="demo-panel"><span className="eyebrow">EXPLORE WITH FICTIONAL DATA</span><p>Choose a workspace to try QueCare.</p><div className="demo-buttons">{[['admin','Administrator'],['officer','Queue officer'],['nurse','Nurse'],['patient','Patient']].map(([id,label])=><button disabled={busy} className="button secondary small" key={id} onClick={async()=>{setBusy(true);try{await api('/auth/login','POST',{email:`${id}@quecare.local`,password:'QueCareDemo2026!'});await onSuccess();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}>{label}</button>)}</div></div>}
  </Modal>;
}
