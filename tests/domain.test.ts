import { describe,it,expect } from 'vitest';
import { averageWait,csvCell,isMinor } from '../server/domain';
describe('waiting-time measurements',()=>{
  it('does not publish an average before three valid observations',()=>{
    expect(averageWait([{entered_at:'2026-10-28T00:00:00Z',started_at:'2026-10-28T00:10:00Z'}])).toEqual({samples:1,minutes:null});
  });
  it('uses service starts and excludes outage reconstruction and invalid timing',()=>{
    const sample=(minutes:number,reconstructed=false)=>({entered_at:'2026-10-28T00:00:00Z',started_at:new Date(Date.parse('2026-10-28T00:00:00Z')+minutes*60000),reconstructed});
    expect(averageWait([sample(5),sample(10),sample(15),sample(900,true),sample(-5),{entered_at:'2026-10-28T00:00:00Z',started_at:null}])).toEqual({samples:3,minutes:10});
  });
});
describe('export and registration safety',()=>{
  it('escapes spreadsheet formulas and embedded quotes',()=>{expect(csvCell('=HYPERLINK("bad")')).toBe('"\'=HYPERLINK(""bad"")"');expect(csvCell('a,b')).toBe('"a,b"');});
  it('requires guardian handling until the eighteenth birthday',()=>{expect(isMinor('2008-10-29','2026-10-28')).toBe(true);expect(isMinor('2008-10-28','2026-10-28')).toBe(false);});
});
