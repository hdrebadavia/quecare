import snapshot from './data/psgc.json';
import type { Place, PatientInput } from '../shared/patient.js';
import { z } from 'zod';
export const geography = snapshot.places as Place[];
const byCode = new Map(geography.map(p => [p.code, p]));
export const addressMetadata = {release:snapshot.release, asOf:snapshot.asOf, source:snapshot.source, attribution:snapshot.attribution};
export function resolveAddress(p: PatientInput) {
  const codes = [p.regionCode,p.provinceCode,p.cityCode,p.barangayCode];
  if (!codes.some(Boolean)) return {region:'',province:'',city:'',barangay:'',addressRelease:''};
  const region=byCode.get(p.regionCode), province=byCode.get(p.provinceCode), city=byCode.get(p.cityCode), barangay=byCode.get(p.barangayCode);
  const fail = (key:string) => {throw new z.ZodError([{code:'custom',path:[key],message:'Select a complete, valid residential address through barangay.'}]);};
  if (region?.kind !== 'region') return fail('regionCode');
  if (p.provinceCode && (province?.kind !== 'province' || province.parent !== region.code)) return fail('provinceCode');
  if (city?.kind !== 'city' || city.parent !== (province?.code || region.code)) return fail('cityCode');
  if (barangay?.kind !== 'barangay' || barangay.parent !== city.code) return fail('barangayCode');
  return {region:region.name,province:province?.name || '',city:city.name,barangay:barangay.name,addressRelease:snapshot.release};
}
