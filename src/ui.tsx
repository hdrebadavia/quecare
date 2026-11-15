import { Children, cloneElement, isValidElement, createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, Check, LoaderCircle, X, Inbox } from 'lucide-react';
import { api } from './api';
export type User={id:string;name:string;email:string;role:string;facility_id:string|null;can_manage_activities:boolean};
export type Facility={id:string;name:string;address:string;announcement:string};
export type Context={user:User|null;facility:Facility;notify:(message:string,error?:boolean)=>void;reload:number;bump:()=>void;navigate:(page:string)=>void;selectFacility:(id:string)=>void;refreshUser:()=>Promise<void>;openPatient:(id:string)=>void};
export function useLoad<T=any>(path:string|null,revision=0,interval=0){
  const [data,setData]=useState<T|null>(null),[error,setError]=useState(''),[updated,setUpdated]=useState(0);
  const previousPath=useRef(path);
  useEffect(()=>{let alive=true;if(previousPath.current!==path)setData(null);previousPath.current=path;setError('');const load=async()=>{if(!path)return;try{const d=await api<T>(path);if(alive){setData(d);setError('');setUpdated(Date.now());}}catch(e){if(alive)setError((e as Error).message);}};void load();const id=interval?setInterval(()=>{if(document.visibilityState==='visible')void load();},interval):undefined;return()=>{alive=false;clearInterval(id);};},[path,revision,interval]);
  return {data,error,updated};
}
export function Loading(){return <div className="empty"><LoaderCircle className="spin" size={24}/><p>Getting things ready…</p></div>;}
export function Empty({title='Nothing here yet',children}:{title?:string;children?:ReactNode}){return <div className="empty"><Inbox size={30}/><h3>{title}</h3>{children&&<p>{children}</p>}</div>;}
export function ErrorBox({message}:{message:string}){return message?<div className="alert error"><AlertCircle size={18}/>{message}</div>:null;}
export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}){return <span className={`badge ${tone}`}><span className="badge-dot"/>{children}</span>;}
export function Modal({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean}){useEffect(()=>{const listener=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();};document.addEventListener('keydown',listener);return()=>document.removeEventListener('keydown',listener);},[onClose]);return <div className="modal-backdrop" onClick={onClose}><section role="dialog" aria-modal="true" aria-label={title} className={`modal ${wide?'wide':''}`} onClick={e=>e.stopPropagation()}><div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20}/></button></div>{children}</section></div>;}
const FieldErrors=createContext<Record<string,string>>({});
export function Field({label,children,hint,name}:{label:string;children:ReactNode;hint?:string;name?:string}){const errors=useContext(FieldErrors);return <label className="field"><span>{label}</span>{name&&errors[name]?Children.map(children,child=>isValidElement<{name?:string;'aria-invalid'?:boolean}>(child)&&child.props.name===name?cloneElement(child,{'aria-invalid':true}):child):children}{hint&&<small>{hint}</small>}{name&&errors[name]&&<small className="field-error" role="alert">{errors[name]}</small>}</label>;}

export function Form({onSubmit,children,label='Save changes'}:{onSubmit:(data:FormData)=>Promise<void>;children:ReactNode;label?:string}){const [busy,setBusy]=useState(false),[error,setError]=useState(''),[fields,setFields]=useState<Record<string,string>>({});return <FieldErrors.Provider value={fields}><form onSubmit={async e=>{e.preventDefault();const data=new FormData(e.currentTarget);setBusy(true);setError('');setFields({});try{await onSubmit(data);}catch(e){setError((e as Error).message);const details=(e as any).fieldErrors||{};setFields(details);const first=Object.keys(details)[0];if(first)(document.getElementsByName(first)[0] as HTMLElement|undefined)?.focus();}finally{setBusy(false);}}}>{children}<ErrorBox message={error}/><div className="form-footer"><button className="button primary" disabled={busy} type="submit">{busy?<LoaderCircle size={17} className="spin"/>:<Check size={17}/>} {busy?'Please wait…':label}</button></div></form></FieldErrors.Provider>;}
export const value=(d:FormData,key:string)=>String(d.get(key)||'');
export function PageTitle({eyebrow,title,description,action}:{eyebrow?:string;title:string;description:string;action?:ReactNode}){return <div className="page-title"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action}</div>;}
export { ProfileFields, profileData } from './PatientFields';
