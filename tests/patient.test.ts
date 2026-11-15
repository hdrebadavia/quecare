import { describe, it, expect } from 'vitest';
import { validatePatient, displayName } from '../shared/patient';
import { resolveAddress, geography } from '../server/geography';
const core={firstName:'Ana',lastName:'Cruz',sex:'Female',birthDate:'1990-02-28'};
const parse=(data={})=>validatePatient({...core,...data},true,'2026-11-13');
describe('patient intake',()=>{
  it('keeps optional membership answers unrecorded and derives a display name',()=>{
    const p=parse({middleName:'Reyes',suffix:'Jr.'});expect(p.dswdNhts).toBeNull();expect(p.fourPsMember).toBeNull();expect(displayName(p)).toBe('Ana Reyes Cruz Jr.');
  });
  it.each(['firstName','lastName','sex'])('requires %s',key=>{expect(()=>parse({[key]:''})).toThrow();});
  it.each(['2026-02-30','1990-02-29','2027-01-01','2026-13-01','wrong',''])('rejects invalid/future birth date %s',birthDate=>{expect(()=>parse({birthDate})).toThrow();});
  it('validates leap days and Manila age boundaries',()=>{
    expect(parse({birthDate:'2000-02-29'}).birthDate).toBe('2000-02-29');
    expect(()=>parse({birthDate:'2008-11-14'})).toThrow(/guardian/);
    expect(parse({birthDate:'2008-11-13'}).guardianName).toBe('');
    expect(parse({birthDate:'2020-01-01',guardianName:'Parent Example'}).guardianName).toBe('Parent Example');
  });
  it.each(['suffix','sex','bloodType','civilStatus','educationalAttainment','employmentStatus','familyPosition','philhealthStatus','philhealthCategory'])('rejects invalid %s options',key=>{expect(()=>parse({[key]:'invalid'})).toThrow();});
  it('shows maiden and spouse names only when applicable',()=>{
    expect(parse({maidenName:'Reyes',spouseName:'Sam'})).toMatchObject({maidenName:'',spouseName:''});
    expect(parse({civilStatus:'Married',maidenName:'Reyes',spouseName:'Sam'})).toMatchObject({maidenName:'Reyes',spouseName:'Sam'});
    expect(parse({sex:'Male',civilStatus:'Married',maidenName:'Reyes',spouseName:'Sam'})).toMatchObject({maidenName:'',spouseName:'Sam'});
    expect(parse({civilStatus:'Co-habitation',maidenName:'Reyes',spouseName:'Sam'})).toMatchObject({maidenName:'',spouseName:'Sam'});
  });
  it('requires and clears other family position',()=>{
    expect(()=>parse({familyPosition:'Others'})).toThrow();
    expect(parse({familyPosition:'Others',familyPositionOther:'Grandmother'}).familyPositionOther).toBe('Grandmother');
    expect(parse({familyPosition:'Mother',familyPositionOther:'Grandmother'}).familyPositionOther).toBe('');
  });
  it('requires membership details and preserves leading zeros',()=>{
    expect(()=>parse({fourPsMember:true})).toThrow();
    expect(()=>parse({philhealthMember:true})).toThrow();
    const p=parse({fourPsMember:true,householdNo:'000123',philhealthMember:true,philhealthStatus:'Dependent',philhealthCategory:'IE',philhealthNo:'001234'});
    expect(p.householdNo).toBe('000123');expect(p.philhealthNo).toBe('001234');
    expect(()=>parse({...p,philhealthStatus:''})).toThrow();expect(()=>parse({...p,philhealthCategory:''})).toThrow();expect(()=>parse({...p,philhealthNo:''})).toThrow();
  });
  it.each([false,null])('clears hidden membership fields when answer is %s',answer=>{
    expect(parse({fourPsMember:answer,householdNo:'000123',philhealthMember:answer,philhealthStatus:'Member',philhealthNo:'00123',philhealthCategory:'IE'})).toMatchObject({householdNo:'',philhealthStatus:'',philhealthNo:'',philhealthCategory:''});
  });
  it('allows unrelated legacy updates without guessing a structured name',()=>{
    expect(validatePatient({birthDate:'1990-01-01',phone:'09123'},false).firstName).toBe('');
    expect(()=>validatePatient({birthDate:'1990-01-01',firstName:'Ana'},false)).toThrow();
  });
});
describe('nationwide geographic reference',()=>{
  it('has complete release totals and valid parents',()=>{
    expect(geography.filter(p=>p.kind==='region')).toHaveLength(18);expect(geography.filter(p=>p.kind==='province')).toHaveLength(82);expect(geography.filter(p=>p.kind==='city')).toHaveLength(1642);expect(geography.filter(p=>p.kind==='barangay')).toHaveLength(42010);
    const byCode=new Map(geography.map(p=>[p.code,p]));
    expect(new Set(geography.map(p=>p.code)).size).toBe(geography.length);
    for(const p of geography) if(p.parent) expect(byCode.has(p.parent)).toBe(true);
  });
  it('resolves every barangay through the correct region and optional province',()=>{
    const byCode=new Map(geography.map(p=>[p.code,p]));
    const base=parse();
    for(const b of geography.filter(p=>p.kind==='barangay')) {
      const city=byCode.get(b.parent)!,parent=byCode.get(city.parent)!;
      const province=parent.kind==='province'?parent:null,region=province?byCode.get(province.parent)!:parent;
      expect(resolveAddress({...base,regionCode:region.code,provinceCode:province?.code||'',cityCode:city.code,barangayCode:b.code}).barangay).toBe(b.name);
    }
  });
  it('rejects incomplete and mismatched paths but permits empty addresses',()=>{
    expect(resolveAddress(parse()).addressRelease).toBe('');
    expect(()=>resolveAddress(parse({regionCode:'0300000000'}))).toThrow();
    expect(()=>resolveAddress(parse({regionCode:'0300000000',cityCode:'1380600000',barangayCode:'1380601001'}))).toThrow();
  });
});
