import { z } from 'zod';

export const choices = {
  suffix: ['Jr.', 'Sr.', 'II', 'III'],
  sex: ['Female', 'Male'],
  bloodType: ['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−', 'Unknown'],
  civilStatus: ['Single', 'Married', 'Widow/er', 'Separated', 'Annulled', 'Co-habitation'],
  educationalAttainment: ['No formal education', 'Elementary', 'High school', 'Vocational', 'College', 'Post graduate'],
  employmentStatus: ['Student', 'Employed', 'None/Unemployed', 'Unknown', 'Retired'],
  familyPosition: ['Father', 'Mother', 'Son', 'Daughter', 'Others'],
  philhealthStatus: ['Member', 'Dependent'],
  philhealthCategory: ['FE-Private', 'FE-Government', 'IE', 'Others'],
} as const;
const optionalText = (max = 200) => z.string().trim().max(max).default('');
const option = (values: readonly string[]) => z.string().refine(v => v === '' || values.includes(v), 'Choose a valid option.').default('');
export const patientFields = z.object({
  firstName: optionalText(), lastName: optionalText(), middleName: optionalText(), suffix: option(choices.suffix),
  sex: option(choices.sex), birthDate: z.string(), birthplace: optionalText(), bloodType: option(choices.bloodType),
  civilStatus: option(choices.civilStatus), maidenName: optionalText(), spouseName: optionalText(), motherName: optionalText(), guardianName: optionalText(),
  educationalAttainment: option(choices.educationalAttainment), employmentStatus: option(choices.employmentStatus),
  familyPosition: option(choices.familyPosition), familyPositionOther: optionalText(),
  regionCode: optionalText(10), provinceCode: optionalText(10), cityCode: optionalText(10), barangayCode: optionalText(10),
  street: optionalText(500), phone: optionalText(30),
  dswdNhts: z.boolean().nullable().default(null), fourPsMember: z.boolean().nullable().default(null), householdNo: optionalText(100),
  philhealthMember: z.boolean().nullable().default(null), philhealthStatus: option(choices.philhealthStatus), philhealthNo: optionalText(100), philhealthCategory: option(choices.philhealthCategory),
  pcbMember: z.boolean().nullable().default(null),
});
export type PatientInput = z.infer<typeof patientFields>;
export type PatientProfile = PatientInput & {id: string; name: string; barangay: string; region: string; province: string; city: string; addressRelease: string};
export type Place = {code: string; name: string; kind: 'region' | 'province' | 'city' | 'barangay'; parent: string};
export const patientKeys = Object.keys(patientFields.shape) as (keyof PatientInput)[];
export const displayName = (p: Pick<PatientInput, 'firstName' | 'middleName' | 'lastName' | 'suffix'>) => [p.firstName, p.middleName, p.lastName, p.suffix].filter(Boolean).join(' ');
export const manilaToday = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Manila', year:'numeric', month:'2-digit', day:'2-digit'}).format(new Date());

/** Validate both new intake and merged legacy updates, with identical conditional cleanup. */
export function validatePatient(raw: unknown, creating: boolean, today = manilaToday()): PatientInput {
  const parsed = patientFields.safeParse(raw);
  if (!parsed.success) throw parsed.error;
  const p = parsed.data;
  const issues: z.core.$ZodIssue[] = [];
  const require = (key: keyof PatientInput, message: string) => {if (!p[key]) issues.push({code:'custom',path:[key],message});};
  if (creating) { require('firstName','First name is required.'); require('lastName','Last name is required.'); require('sex','Sex is required.'); }
  if (p.firstName || p.lastName || p.middleName || p.suffix) { require('firstName','First name is required to replace the full name.'); require('lastName','Last name is required to replace the full name.'); }
  const validDate = Number(p.birthDate.slice(0,4))>0 && /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) && !isNaN(Date.parse(p.birthDate)) && new Date(p.birthDate).toISOString().slice(0,10) === p.birthDate && p.birthDate <= today;
  if (!validDate) issues.push({code:'custom', path:['birthDate'],message:'Enter a valid birth date that is not in the future.'});
  if (validDate) {
    const [y,m,d] = p.birthDate.split('-').map(Number), [ty,tm,td] = today.split('-').map(Number);
    if (ty-y-(tm<m || tm===m && td<d ? 1:0)<18) require('guardianName','A guardian name is required for patients under 18.');
  }
  if (!(p.sex === 'Female' && p.civilStatus === 'Married')) p.maidenName = '';
  if (!['Married','Co-habitation'].includes(p.civilStatus)) p.spouseName = '';
  if (p.familyPosition === 'Others') require('familyPositionOther','Specify the family member position.'); else p.familyPositionOther = '';
  if (p.fourPsMember === true) require('householdNo','Household No. is required for 4Ps members.'); else p.householdNo = '';
  if (p.philhealthMember === true) {
    require('philhealthStatus','Choose Member or Dependent.'); require('philhealthNo','PhilHealth No. is required.'); require('philhealthCategory','Choose a PhilHealth category.');
  } else { p.philhealthStatus = ''; p.philhealthNo = ''; p.philhealthCategory = ''; }
  if (issues.length) throw new z.ZodError(issues);
  return p;
}
