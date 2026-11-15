import {afterEach,describe,expect,it,vi} from 'vitest';
import {api,ApiError,setCsrf} from '../src/api';
afterEach(()=>{vi.unstubAllGlobals();setCsrf('');});
describe('API outage handling',()=>{
  it('rejects HTML even with a successful status instead of treating it as patient data',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>new Response('<html>starting</html>',{status:200})));
    await expect(api('/facilities')).rejects.toMatchObject({status:200,retryable:true});
  });
  it.each([502,503,504])('marks HTTP %s as recoverable',async status=>{
    vi.stubGlobal('fetch',vi.fn(async()=>new Response('<html>Unavailable</html>',{status})));
    await expect(api('/facilities')).rejects.toMatchObject({status,retryable:true});
  });
  it('preserves field validation errors without treating them as an outage',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>Response.json({error:'Invalid birth date',fieldErrors:{birthDate:'Invalid'}},{status:400})));
    await expect(api('/patients','POST',{})).rejects.toMatchObject({status:400,retryable:false,fieldErrors:{birthDate:'Invalid'}});
  });
  it('does not retry a write after an ambiguous network failure',async()=>{
    const fetcher=vi.fn(async()=>{throw new Error('private network detail');});vi.stubGlobal('fetch',fetcher);
    await expect(api('/patients','POST',{})).rejects.toBeInstanceOf(ApiError);expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('does not retry permission errors or expose HTML markup',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>new Response('<html>secret proxy message</html>',{status:403})));
    await expect(api('/patients/me')).rejects.toMatchObject({status:403,retryable:false});
    await expect(api('/patients/me')).rejects.not.toThrow('secret proxy message');
  });
});
