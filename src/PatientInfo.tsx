import { useEffect, useState } from 'react';
import { api, dateLabel } from './api';
import { Empty, ErrorBox, Field, Form, Loading, PageTitle, useLoad, type Context } from './ui';
import { ProfileFields, profileData } from './PatientFields';
import { patientKeys, type PatientProfile } from '../shared/patient';
const sections: [string,[keyof PatientProfile,string][]][] = [
  ['Identity',[['lastName','Last name'],['firstName','First name'],['middleName','Middle name'],['suffix','Suffix'],['sex','Sex'],['birthDate','Date of birth'],['birthplace','Birthplace'],['bloodType','Blood type']]],
  ['Family',[['civilStatus','Civil status'],['maidenName','Maiden name'],['spouseName','Spouse’s name'],['motherName','Mother’s name'],['guardianName','Guardian / representative']]],
  ['Education and employment',[['educationalAttainment','Educational attainment'],['employmentStatus','Employment status']]],
  ['Household',[['familyPosition','Family member position'],['familyPositionOther','Other family member position']]],
  ['Residential address and contact',[['region','Region'],['province','Province'],['city','City / municipality'],['barangay','Barangay'],['street','Street / house number'],['phone','Contact number']]],
  ['Programs and insurance',[['dswdNhts','DSWD NHTS'],['fourPsMember','4Ps member'],['householdNo','Household No.'],['philhealthMember','PhilHealth member'],['philhealthStatus','PhilHealth status type'],['philhealthNo','PhilHealth No.'],['philhealthCategory','PhilHealth category'],['pcbMember','Primary Care Benefit (PCB) member']]],
];
function ProfilePanel({ctx,path}:{ctx:Context;path:string}) {
  const {data:p,error}=useLoad<PatientProfile>(path,ctx.reload);
  const [editing,setEditing]=useState(false);
  if(error) return <ErrorBox message={error}/>;
  if(!p) return <Loading/>;
  function visible(key:keyof PatientProfile) {
    if(key==='maidenName') return p!.sex==='Female'&&p!.civilStatus==='Married';
    if(key==='spouseName') return ['Married','Co-habitation'].includes(p!.civilStatus);
    if(key==='familyPositionOther') return p!.familyPosition==='Others';
    if(key==='householdNo') return p!.fourPsMember===true;
    if(['philhealthNo','philhealthStatus','philhealthCategory'].includes(key)) return p!.philhealthMember===true;
    return true;
  }
  return <section className="panel patient-profile-panel"><div className="panel-header"><h2>{p.name}</h2><button className="button secondary" onClick={()=>setEditing(v=>!v)}>{editing?'Cancel editing':'Edit information'}</button></div>
    {editing?<Form label="Save patient information" onSubmit={async d=>{
      const next=profileData(d),changes:Record<string,unknown>={};
      for(const k of patientKeys) if(next[k]!==p[k]) changes[k]=next[k];
      if(d.get('addressTouched')==='true') for(const k of ['regionCode','provinceCode','cityCode','barangayCode'] as const) changes[k]=next[k];
      if(Object.keys(changes).length) {await api(path,'PATCH',changes);await ctx.refreshUser();ctx.bump();}
      setEditing(false);ctx.notify('Patient information saved.');
    }}><ProfileFields key={p.id} initial={p} editing/></Form>:<>{sections.map(([title,fields])=><section className="profile-section" key={title}><h3>{title}</h3><dl className="profile-details">{fields.filter(([key])=>visible(key)).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{typeof p[key]==='boolean'?(p[key]?'Yes':'No'):p[key]?(key==='birthDate'?dateLabel(String(p[key])):String(p[key])):'Not recorded'}</dd></div>)}</dl></section>)}</>}
  </section>;
}
export function PatientInfo({ctx,patientId}:{ctx:Context;patientId:string|null}) {
  const own=ctx.user?.role==='patient';
  const [search,setSearch]=useState(''),[results,setResults]=useState<{id:string;name:string;birth_date:string;barangay:string}[]>([]),[error,setError]=useState('');
  useEffect(()=>{
    if(own)return;
    let alive=true;
    const id=setTimeout(()=>{
      if(search.trim().length<2){setResults([]);return;}
      api<typeof results>(`/patients/search?q=${encodeURIComponent(search)}`).then(p=>{if(alive){setResults(p);setError('');}}).catch(e=>{if(alive)setError(e.message);});
    },300);
    return ()=>{alive=false;clearTimeout(id);};
  },[search,own]);
  return <><PageTitle title={own?'My information':'Patient information'} description={own?'Review and update your patient details.':'Find a patient to review or update their information.'}/>
    {!own&&<section className="panel patient-profile-panel"><Field label="Search patient name"><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Type at least two letters"/></Field><ErrorBox message={error}/>{results.length>0&&<div className="search-results">{results.map(p=><button key={p.id} onClick={()=>{ctx.openPatient(p.id);setResults([]);}}><strong>{p.name}</strong><small>{dateLabel(p.birth_date)} · {p.barangay}</small></button>)}</div>}</section>}
    {own||patientId?<ProfilePanel key={own?'me':patientId} ctx={ctx} path={own?'/patients/me':`/patients/${patientId}`}/>:<Empty title="Select a patient">Patient details are available for patients connected to your Health Unit.</Empty>}
  </>;
}
