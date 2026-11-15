import { useState } from 'react';
import { choices, patientFields, patientKeys, type PatientInput, type PatientProfile, type Place } from '../shared/patient';
import { Field, useLoad } from './ui';
import { today } from './api';
const blank = () => patientFields.parse({birthDate:''});
const membershipKeys = ['dswdNhts','fourPsMember','philhealthMember','pcbMember'];
export function profileData(d:FormData): PatientInput & {consent:boolean} {
  return {...Object.fromEntries(patientKeys.map(k=>[k,membershipKeys.includes(k)?(d.get(k)==='true'?true:d.get(k)==='false'?false:null):String(d.get(k)||'')])),consent:d.get('consent')==='on'} as PatientInput & {consent:boolean};
}
function PlaceSelect({name,label,places,value,onChange,disabled=false,required=false,emptyLabel}:{name:string;label:string;places:Place[];value:string;onChange:(code:string)=>void;disabled?:boolean;required?:boolean;emptyLabel?:string}) {
  const [query,setQuery]=useState('');
  return <div className="address-choice"><label className="field"><span>Find {label.toLowerCase()}</span><input aria-label={`Find ${label.toLowerCase()}`} type="search" placeholder={`Search ${label.toLowerCase()}`} value={query} onChange={e=>setQuery(e.target.value)} disabled={disabled}/></label><Field name={name} label={label}><select aria-label={label} name={name} value={value} onChange={e=>{onChange(e.target.value);setQuery('');}} required={required} disabled={disabled}><option value="">{emptyLabel||`Choose ${label.toLowerCase()}`}</option>{value&&!places.some(p=>p.code===value)&&<option value={value}>Saved selection</option>}{places.filter(p=>p.code===value||p.name.toLowerCase().includes(query.toLowerCase())).map(p=><option key={p.code} value={p.code}>{p.name}</option>)}</select></Field></div>;
}
export function ProfileFields({initial,editing=false}:{initial?:PatientProfile;editing?:boolean}) {
  const [addressTouched,setAddressTouched]=useState(false);
  const [p,setP]=useState<PatientInput>(()=>({...blank(),...initial}));
  function change(key:keyof PatientInput,v:string|boolean|null) {
    if(['regionCode','provinceCode','cityCode','barangayCode'].includes(key)) setAddressTouched(true);
    setP(old=>{
      const next={...old,[key]:v};
      if(!(next.sex==='Female'&&next.civilStatus==='Married')) next.maidenName='';
      if(!['Married','Co-habitation'].includes(next.civilStatus)) next.spouseName='';
      if(next.familyPosition!=='Others') next.familyPositionOther='';
      if(next.fourPsMember!==true) next.householdNo='';
      if(next.philhealthMember!==true){next.philhealthStatus='';next.philhealthNo='';next.philhealthCategory='';}
      const cascade=['regionCode','provinceCode','cityCode','barangayCode'] as const;
      const index=cascade.indexOf(key as typeof cascade[number]);
      if(index>=0) for(const child of cascade.slice(index+1)) next[child]='';
      return next;
    });
  }
  const input=(key:keyof PatientInput,label:string,required=false,type='text',max=200)=><Field key={key} name={key} label={label}><input aria-label={label} name={key} type={type} required={required} maxLength={max} max={type==='date'?today():undefined} value={String(p[key]??'')} onChange={e=>change(key,e.target.value)}/></Field>;
  const select=(key:keyof typeof choices,label:string,required=false)=><Field name={key} label={label}><select aria-label={label} name={key} value={String(p[key])} required={required} onChange={e=>change(key,e.target.value)}><option value="">Not recorded</option>{choices[key].map(v=><option key={v}>{v}</option>)}</select></Field>;
  const yesNo=(key:'dswdNhts'|'fourPsMember'|'philhealthMember'|'pcbMember',label:string)=><Field name={key} label={label}><select aria-label={label} name={key} value={p[key]===null?'':String(p[key])} onChange={e=>change(key,e.target.value===''?null:e.target.value==='true')}><option value="">Not recorded</option><option value="true">Yes</option><option value="false">No</option></select></Field>;
  const {data:regions,error:regionError}=useLoad<{places:Place[]}>('/geography');
  const {data:region,error:provinceError}=useLoad<{places:Place[]}>(p.regionCode?`/geography?parent=${p.regionCode}`:null);
  const {data:province,error:cityError}=useLoad<{places:Place[]}>(p.provinceCode?`/geography?parent=${p.provinceCode}`:null);
  const {data:city,error:barangayError}=useLoad<{places:Place[]}>(p.cityCode?`/geography?parent=${p.cityCode}`:null);
  const provinces=region?.places.filter(x=>x.kind==='province'&&x.parent===p.regionCode)||[];
  const cities=(p.provinceCode?province?.places:region?.places)?.filter(x=>x.kind==='city'&&x.parent===(p.provinceCode||p.regionCode))||[];
  const begun=!!(p.regionCode||p.provinceCode||p.cityCode||p.barangayCode);
  return <>
    <input type="hidden" name="addressTouched" value={String(addressTouched)}/>
    <fieldset className="profile-section"><legend>Identity</legend>{editing&&initial&&!initial.firstName&&<p className="muted">Existing full name: {initial.name}. Enter both first and last name to replace it.</p>}<div className="form-grid">
      {input('lastName','Last name',!editing||!!initial?.lastName||!!p.firstName)}{input('firstName','First name',!editing||!!initial?.firstName||!!p.lastName)}{input('middleName','Middle name')}{select('suffix','Suffix')}
      {select('sex','Sex',!editing||!!initial?.sex)}{input('birthDate','Date of birth',true,'date')}{input('birthplace','Birthplace')}{select('bloodType','Blood type')}
    </div></fieldset>
    <fieldset className="profile-section"><legend>Family</legend><div className="form-grid">{select('civilStatus','Civil status')}
      {p.sex==='Female'&&p.civilStatus==='Married'&&input('maidenName','Maiden name')}
      {['Married','Co-habitation'].includes(p.civilStatus)&&input('spouseName','Spouse’s name')}{input('motherName','Mother’s name')}
      {input('guardianName','Guardian / representative (if applicable)',!!p.birthDate&&new Date(p.birthDate+'T00:00:00Z')>new Date(today().replace(/^\d{4}/,y=>String(Number(y)-18))+'T00:00:00Z'))}
    </div><p className="muted small-text">A guardian / representative is required for patients under 18.</p></fieldset>
    <fieldset className="profile-section"><legend>Education and employment</legend><div className="form-grid">{select('educationalAttainment','Educational attainment')}{select('employmentStatus','Employment status')}</div></fieldset>
    <fieldset className="profile-section"><legend>Household</legend><div className="form-grid">{select('familyPosition','Family member position')}{p.familyPosition==='Others'&&input('familyPositionOther','Other family member position',true)}</div></fieldset>
    <fieldset className="profile-section"><legend>Residential address and contact</legend>{initial?.barangay&&!initial.barangayCode&&<p className="muted">Previously recorded barangay: {initial.barangay}. This is kept until you replace or explicitly clear the address.</p>}
      <div className="form-grid"><PlaceSelect name="regionCode" label="Region" places={regions?.places||[]} value={p.regionCode} onChange={v=>change('regionCode',v)} required={begun}/>
        {provinces.length>0?<PlaceSelect name="provinceCode" label="Province" places={provinces} value={p.provinceCode} onChange={v=>change('provinceCode',v)} required={begun&&!region?.places.some(x=>x.kind==='city')} emptyLabel={region?.places.some(x=>x.kind==='city')?'City without a province':'Choose province'}/>:<input type="hidden" name="provinceCode" value={p.provinceCode}/>}
        <PlaceSelect name="cityCode" label="City / municipality" places={cities} value={p.cityCode} onChange={v=>change('cityCode',v)} disabled={!p.regionCode} required={begun}/>
        <PlaceSelect name="barangayCode" label="Barangay" places={city?.places.filter(x=>x.parent===p.cityCode)||[]} value={p.barangayCode} onChange={v=>change('barangayCode',v)} disabled={!p.cityCode} required={begun}/>
        {input('street','Street / house number',false,'text',500)}{input('phone','Contact number',false,'tel',30)}
      </div>{(regionError||provinceError||cityError||barangayError)&&<p role="alert">Address options could not load. Refresh the page to retry.</p>}
      {(begun||!!initial?.barangay&&!initial.barangayCode)&&<button type="button" className="text-button" onClick={()=>change('regionCode','')}>Clear residential address</button>}
      <p className="muted small-text">Address choices: Philippine Statistics Authority (PSA), PSGC as of 30 September 2026.</p>
    </fieldset>
    <fieldset className="profile-section"><legend>Programs and insurance</legend><div className="form-grid">
      {yesNo('dswdNhts','DSWD NHTS')}{yesNo('fourPsMember','4Ps member')}{p.fourPsMember===true&&input('householdNo','Household No.',true,'text',100)}
      {yesNo('philhealthMember','PhilHealth member')}{p.philhealthMember===true&&<>{select('philhealthStatus','PhilHealth status type',true)}{input('philhealthNo','PhilHealth No.',true,'text',100)}{select('philhealthCategory','PhilHealth category',true)}</>}
      {yesNo('pcbMember','Primary Care Benefit (PCB) member')}
    </div></fieldset>
    {!editing&&<label className="checkbox"><input type="checkbox" name="consent" required/> I acknowledge the privacy notice and authorize registration for this visit. Sharing health records with other Health Units is a separate choice.</label>}
  </>;
}
